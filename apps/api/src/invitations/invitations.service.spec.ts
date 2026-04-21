import { BadRequestException, ConflictException } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';

describe('InvitationsService', () => {
  let prisma: PrismaMock;
  let emailService: { sendInvitationEmail: jest.Mock };
  let service: InvitationsService;
  const fixedNow = new Date('2026-06-15T12:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(fixedNow);
    prisma = createPrismaMock();
    emailService = { sendInvitationEmail: jest.fn().mockResolvedValue(undefined) };
    service = new InvitationsService(prisma as any, emailService as any);
  });

  afterEach(() => jest.useRealTimers());

  describe('create', () => {
    it('rejects creating an invitation for an email that already has a user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'x@y.com' });

      await expect(
        service.create({ email: 'x@y.com', name: 'X' } as any, 'admin-1')
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects creating an invitation when an active PENDING one already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.invitation.findFirst.mockResolvedValue({ id: 'inv-1', status: 'PENDING' });

      await expect(service.create({ email: 'x@y.com' } as any, 'admin-1')).rejects.toThrow(
        /An active invitation already exists/
      );
    });

    it('creates a PENDING invitation with an expiry derived from expiresInDays (default 7)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.invitation.findFirst.mockResolvedValue(null);
      prisma.invitation.create.mockImplementation((args: any) => {
        return Promise.resolve({ ...args.data, invitedByUser: { name: 'Admin' } });
      });

      const result = await service.create({ email: 'x@y.com', name: 'X' } as any, 'admin-1');

      expect(prisma.invitation.create).toHaveBeenCalled();
      const createdArg = prisma.invitation.create.mock.calls[0][0];
      const expiresAt = createdArg.data.expiresAt as Date;
      const expected = new Date(fixedNow);
      expected.setDate(expected.getDate() + 7);
      expect(expiresAt.getTime()).toBe(expected.getTime());
      expect(result.emailSent).toBe(true);
      expect(emailService.sendInvitationEmail).toHaveBeenCalled();
    });

    it('still returns an invitation with emailSent=false when the email provider fails', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.invitation.findFirst.mockResolvedValue(null);
      prisma.invitation.create.mockResolvedValue({
        email: 'x@y.com',
        invitedByUser: { name: 'Admin' },
      });
      emailService.sendInvitationEmail.mockRejectedValue(new Error('SMTP down'));

      const result = await service.create({ email: 'x@y.com' } as any, 'admin-1');

      expect(result.emailSent).toBe(false);
    });
  });

  describe('validate', () => {
    it('returns invalid for a token that does not exist', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);

      const result = await service.validate('nope');

      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/Invalid invitation token/);
    });

    it('returns invalid for a REVOKED invitation', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        id: 'i1',
        status: 'REVOKED',
        expiresAt: new Date('2099-01-01'),
      });

      const result = await service.validate('tok');
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/revoked/i);
    });

    it('returns invalid for an already ACCEPTED invitation', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        id: 'i1',
        status: 'ACCEPTED',
        expiresAt: new Date('2099-01-01'),
      });

      const result = await service.validate('tok');
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/already been used/i);
    });

    it('marks an expired PENDING invitation as EXPIRED and reports invalid', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        id: 'i1',
        status: 'PENDING',
        expiresAt: new Date('2020-01-01'),
      });

      const result = await service.validate('tok');

      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/expired/i);
      expect(prisma.invitation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'i1' },
          data: { status: 'EXPIRED' },
        })
      );
    });

    it('returns valid + email for a fresh PENDING invitation', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        id: 'i1',
        status: 'PENDING',
        email: 'x@y.com',
        name: 'X',
        expiresAt: new Date('2099-01-01'),
      });

      const result = await service.validate('tok');

      expect(result.valid).toBe(true);
      expect(result.email).toBe('x@y.com');
      expect(result.name).toBe('X');
    });
  });

  describe('revoke', () => {
    it('refuses to revoke an ACCEPTED invitation', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        id: 'i1',
        invitedBy: 'u1',
        status: 'ACCEPTED',
      });
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', roles: ['ADMIN'] });

      await expect(service.revoke('i1', 'u1')).rejects.toThrow(/already been accepted/);
    });

    it("refuses when a non-admin user tries to revoke someone else's invitation", async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        id: 'i1',
        invitedBy: 'other-user',
        status: 'PENDING',
      });
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', roles: ['VIEWER'] });

      await expect(service.revoke('i1', 'u1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('allows an ADMIN to revoke any invitation they did not create', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        id: 'i1',
        invitedBy: 'other',
        status: 'PENDING',
      });
      prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', roles: ['ADMIN'] });
      prisma.invitation.delete.mockResolvedValue({});

      await service.revoke('i1', 'admin-1');

      expect(prisma.invitation.delete).toHaveBeenCalledWith({ where: { id: 'i1' } });
    });
  });
});
