import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';
import { Role } from '@padel/types';

// bcrypt is the hot path and ~100ms per call with real salting. Mocking it
// keeps the suite fast and lets us assert exactly which plaintext was hashed.
jest.mock('bcrypt');

describe('AuthService', () => {
  let prisma: PrismaMock;
  let jwtService: { signAsync: jest.Mock };
  let configService: { get: jest.Mock };
  let emailService: {
    sendVerificationEmail: jest.Mock;
    sendPasswordResetEmail: jest.Mock;
  };
  let invitationsService: { validate: jest.Mock; markAsUsed: jest.Mock };
  let service: AuthService;

  const fixedNow = new Date('2026-06-15T12:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(fixedNow);
    prisma = createPrismaMock();
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
    };
    configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        if (key === 'NODE_ENV') return 'test';
        return defaultValue;
      }),
    };
    emailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };
    invitationsService = {
      validate: jest.fn(),
      markAsUsed: jest.fn().mockResolvedValue(undefined),
    };

    service = new AuthService(
      prisma as any,
      jwtService as any,
      configService as any,
      emailService as any,
      invitationsService as any
    );

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => jest.useRealTimers());

  describe('signup', () => {
    it('rejects when no invitation token is provided', async () => {
      await expect(
        service.signup({ email: 'x@y.com', password: 'pw', name: 'X' } as any)
      ).rejects.toThrow(/Invitation token is required/);
    });

    it('rejects when the invitation is invalid', async () => {
      invitationsService.validate.mockResolvedValue({
        valid: false,
        message: 'Expired',
      });

      await expect(
        service.signup({
          email: 'x@y.com',
          password: 'pw',
          name: 'X',
          invitationToken: 'tok',
        } as any)
      ).rejects.toThrow(/Expired/);
    });

    it('rejects when email does not match the invitation', async () => {
      invitationsService.validate.mockResolvedValue({
        valid: true,
        email: 'different@y.com',
      });

      await expect(
        service.signup({
          email: 'x@y.com',
          password: 'pw',
          name: 'X',
          invitationToken: 'tok',
        } as any)
      ).rejects.toThrow(/does not match the invitation/);
    });

    it('rejects when the email is already registered', async () => {
      invitationsService.validate.mockResolvedValue({ valid: true, email: 'x@y.com' });
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.signup({
          email: 'x@y.com',
          password: 'pw',
          name: 'X',
          invitationToken: 'tok',
        } as any)
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('hashes the password and creates an auto-verified user (invitation already proves the address)', async () => {
      invitationsService.validate.mockResolvedValue({ valid: true, email: 'x@y.com' });
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-user',
        email: 'x@y.com',
        name: 'X',
      });

      await service.signup({
        email: 'x@y.com',
        password: 'secret-pw',
        name: 'X',
        dateOfBirth: '1990-05-04',
        phoneNumber: '+351912345678',
        invitationToken: 'tok',
      } as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('secret-pw', 10);
      const createArgs = prisma.user.create.mock.calls[0][0];
      expect(createArgs.data).toMatchObject({
        email: 'x@y.com',
        passwordHash: 'hashed-password',
        emailVerified: true,
        roles: [Role.VIEWER],
        name: 'X',
        phoneNumber: '+351912345678',
      });
      expect(createArgs.data.dateOfBirth).toBeInstanceOf(Date);
      expect(createArgs.data.emailVerificationToken).toBeUndefined();
      expect(createArgs.data.emailVerificationExpires).toBeUndefined();
      expect(invitationsService.markAsUsed).toHaveBeenCalledWith('tok');
      expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('rejects with ConflictException when phoneNumber is already in use', async () => {
      invitationsService.validate.mockResolvedValue({ valid: true, email: 'x@y.com' });
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['phoneNumber'] },
      });

      await expect(
        service.signup({
          email: 'x@y.com',
          password: 'secret-pw',
          name: 'X',
          dateOfBirth: '1990-05-04',
          phoneNumber: '+351912345678',
          invitationToken: 'tok',
        } as any)
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    const baseUser = () => ({
      id: 'u1',
      email: 'x@y.com',
      passwordHash: 'hashed',
      emailVerified: true,
      roles: [Role.VIEWER],
      tokenVersion: 0,
    });

    it('rejects when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'nope', password: 'pw' } as any)).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    });

    it('rejects when the user has no passwordHash (e.g. Google-only account)', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser(), passwordHash: null });

      await expect(service.login({ email: 'x@y.com', password: 'pw' } as any)).rejects.toThrow(
        /Invalid credentials/
      );
    });

    it('rejects when the password does not match', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'x@y.com', password: 'wrong' } as any)).rejects.toThrow(
        /Invalid credentials/
      );
    });

    it('returns access + refresh tokens when credentials are valid', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser());

      const result = await service.login({ email: 'x@y.com', password: 'pw' } as any);

      expect(result).toEqual({
        accessToken: 'signed.jwt.token',
        refreshToken: 'signed.jwt.token',
      });
      // Signs twice: once for access (default secret), once for refresh (different secret)
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('embeds the user tokenVersion as `tv` in signed payloads', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser(), tokenVersion: 3 });

      await service.login({ email: 'x@y.com', password: 'pw' } as any);

      const signedPayload = (jwtService.signAsync as jest.Mock).mock.calls[0][0];
      expect(signedPayload).toMatchObject({ sub: 'u1', tv: 3 });
    });
  });

  describe('refresh', () => {
    it('rejects when the user no longer exists', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh('u1', 0)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects when the refresh tokenVersion is stale (e.g. password was reset)', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'x@y.com',
        roles: [Role.VIEWER],
        tokenVersion: 5,
      });

      await expect(service.refresh('u1', 4)).rejects.toThrow(/revoked/i);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('issues fresh tokens when the version matches', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'x@y.com',
        roles: [Role.VIEWER],
        tokenVersion: 5,
      });

      const result = await service.refresh('u1', 5);

      expect(result).toEqual({
        accessToken: 'signed.jwt.token',
        refreshToken: 'signed.jwt.token',
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('googleAuth', () => {
    it('creates a new user with emailVerified=true when none exists and invitation is valid', async () => {
      invitationsService.validate.mockResolvedValue({ valid: true, email: 'x@y.com' });
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-user',
        email: 'x@y.com',
        roles: [Role.VIEWER],
      });

      await service.googleAuth({
        email: 'x@y.com',
        name: 'X',
        invitationToken: 'tok',
      } as any);

      const createArgs = prisma.user.create.mock.calls[0][0];
      expect(createArgs.data.emailVerified).toBe(true);
      expect(invitationsService.markAsUsed).toHaveBeenCalledWith('tok');
    });

    it('requires an invitation for brand-new users', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.googleAuth({ email: 'x@y.com', name: 'X' } as any)).rejects.toThrow(
        /Invitation token is required/
      );
    });

    it('marks existing user as verified if they were not yet', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'x@y.com',
        emailVerified: false,
        profilePhoto: null,
        roles: [Role.VIEWER],
      });
      prisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'x@y.com',
        emailVerified: true,
        roles: [Role.VIEWER],
      });

      await service.googleAuth({ email: 'x@y.com', name: 'X' } as any);

      const updateArgs = prisma.user.update.mock.calls[0][0];
      expect(updateArgs.data.emailVerified).toBe(true);
    });

    it('rejects non-HTTPS profile photo URLs in non-dev environments', async () => {
      configService.get.mockImplementation((k: string, d?: unknown) =>
        k === 'NODE_ENV' ? 'production' : d
      );

      await expect(
        service.googleAuth({
          email: 'x@y.com',
          name: 'X',
          profilePhoto: 'http://insecure.com/photo.jpg',
          invitationToken: 'tok',
        } as any)
      ).rejects.toThrow(/HTTPS/);
    });

    it('rejects overlong profile photo URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);

      await expect(
        service.googleAuth({
          email: 'x@y.com',
          name: 'X',
          profilePhoto: longUrl,
          invitationToken: 'tok',
        } as any)
      ).rejects.toThrow(/too long/);
    });
  });

  describe('forgotPassword', () => {
    it('returns a neutral message when the email does not exist (no user enumeration)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'unknown@y.com' } as any);

      expect(result.message).toMatch(/If the email exists/);
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('stores a hashed reset token with a 1-hour expiry and sends the email', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'x@y.com',
        name: 'X',
      });
      prisma.user.update.mockResolvedValue({});

      await service.forgotPassword({ email: 'x@y.com' } as any);

      const updateArgs = prisma.user.update.mock.calls[0][0];
      expect(updateArgs.data.resetPasswordToken).toMatch(/^[a-f0-9]{64}$/);
      expect((updateArgs.data.resetPasswordExpires as Date).getTime()).toBe(
        fixedNow.getTime() + 3_600_000
      );
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('rejects when the token is invalid', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'bad', password: 'newpw' } as any)
      ).rejects.toThrow(/Invalid or expired/);
    });

    it('updates the password, clears the reset token, and bumps tokenVersion on success', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'u1' });
      prisma.user.update.mockResolvedValue({});

      await service.resetPassword({ token: 'tok', password: 'new-secret' } as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('new-secret', 10);
      const updateArgs = prisma.user.update.mock.calls[0][0];
      expect(updateArgs.data).toEqual({
        passwordHash: 'hashed-password',
        resetPasswordToken: null,
        resetPasswordExpires: null,
        tokenVersion: { increment: 1 },
      });
    });

    it('looks up the user by the SHA-256 hash of the provided token, not the raw token', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'u1' });
      prisma.user.update.mockResolvedValue({});

      const rawToken = 'my-raw-token';
      const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await service.resetPassword({ token: rawToken, password: 'pw' } as any);

      const whereArg = prisma.user.findFirst.mock.calls[0][0].where;
      expect(whereArg.resetPasswordToken).toBe(expectedHash);
      expect(whereArg.resetPasswordExpires.gt).toBeInstanceOf(Date);
    });
  });

  describe('verifyEmail', () => {
    it('rejects invalid/expired tokens', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail('bad')).rejects.toThrow(/Invalid or expired/);
    });

    it('marks the user as verified and clears the token on success', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'u1' });
      prisma.user.update.mockResolvedValue({});

      await service.verifyEmail('good-token');

      const updateArgs = prisma.user.update.mock.calls[0][0];
      expect(updateArgs.data).toEqual({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      });
    });
  });

  describe('resendVerificationEmail', () => {
    it('returns a neutral message when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.resendVerificationEmail('unknown@y.com');

      expect(result.message).toMatch(/If the email exists and is not verified/);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('returns the uniform neutral message when the email is already verified', async () => {
      // Defense against email enumeration: the response must not distinguish
      // "not registered" from "already verified" — both return the same text.
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', emailVerified: true });

      const result = await service.resendVerificationEmail('x@y.com');

      expect(result.message).toMatch(/If the email exists and is not verified/);
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('issues a new token and sends the email when user exists and is unverified', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'x@y.com',
        name: 'X',
        emailVerified: false,
      });
      prisma.user.update.mockResolvedValue({});

      await service.resendVerificationEmail('x@y.com');

      expect(prisma.user.update).toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    });
  });

  describe('updateProfilePhoto', () => {
    it('accepts an https URL', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'x@y.com',
        name: 'X',
        profilePhoto: 'https://example.com/p.jpg',
        roles: [Role.VIEWER],
      });

      await expect(
        service.updateProfilePhoto('u1', 'https://example.com/p.jpg')
      ).resolves.toMatchObject({ profilePhoto: 'https://example.com/p.jpg' });
    });

    it('rejects overlong URLs before hitting the database', async () => {
      await expect(service.updateProfilePhoto('u1', 'https://' + 'a'.repeat(2050))).rejects.toThrow(
        /too long/
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects malformed URLs', async () => {
      await expect(service.updateProfilePhoto('u1', 'not a url')).rejects.toThrow(
        /not a valid URL/
      );
    });
  });

  describe('updateProfile', () => {
    it('maps string dateOfBirth to a Date; null clears it', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'x@y.com',
        name: 'X',
        roles: [],
        player: null,
      });

      await service.updateProfile('u1', { dateOfBirth: '1990-01-01' });
      expect((prisma.user.update.mock.calls[0][0].data.dateOfBirth as Date).getTime()).toBe(
        new Date('1990-01-01').getTime()
      );

      prisma.user.update.mockClear();
      prisma.user.update.mockResolvedValue({ id: 'u1', email: 'x@y.com', roles: [], player: null });
      await service.updateProfile('u1', { dateOfBirth: null as unknown as string });
      expect(prisma.user.update.mock.calls[0][0].data.dateOfBirth).toBeNull();
    });

    it('surfaces a ConflictException when the phone number is already in use', async () => {
      const prismaError = Object.assign(new Error('unique violation'), {
        code: 'P2002',
        meta: { target: ['phoneNumber'] },
      });
      prisma.user.update.mockRejectedValue(prismaError);

      await expect(
        service.updateProfile('u1', { phoneNumber: '+351912345678' })
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('re-throws any unexpected Prisma error', async () => {
      prisma.user.update.mockRejectedValue(new Error('boom'));

      await expect(service.updateProfile('u1', { name: 'X' })).rejects.toThrow(/boom/);
    });
  });

  describe('validateUser', () => {
    it('returns a sanitized user profile without sensitive fields', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'x@y.com',
        name: 'X',
        dateOfBirth: null,
        phoneNumber: null,
        profilePhoto: null,
        roles: [Role.VIEWER],
        passwordHash: 'SHOULD_NOT_LEAK',
        resetPasswordToken: 'SHOULD_NOT_LEAK',
        player: { id: 'p1' },
      });

      const result = await service.validateUser('u1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('resetPasswordToken');
      expect(result.id).toBe('u1');
    });

    it('throws UnauthorizedException when the user no longer exists', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser('missing')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
