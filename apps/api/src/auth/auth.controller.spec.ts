import { AuthController } from './auth.controller';

/**
 * Controllers are thin HTTP adapters that delegate to services. We verify:
 *   - The right service method is called
 *   - Arguments are mapped correctly (DTO passthrough, user.sub extraction)
 *   - The service's return value is forwarded untouched
 *
 * Service business logic is covered in auth.service.spec.ts.
 */

const makeAuthServiceMock = () => ({
  signup: jest.fn(),
  login: jest.fn(),
  googleAuth: jest.fn(),
  refresh: jest.fn(),
  validateUser: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  updateProfilePhoto: jest.fn(),
  updateProfile: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerificationEmail: jest.fn(),
});

describe('AuthController', () => {
  let authService: ReturnType<typeof makeAuthServiceMock>;
  let controller: AuthController;

  beforeEach(() => {
    authService = makeAuthServiceMock();
    controller = new AuthController(authService as any);
  });

  it('delegates signup to the service and returns its result', async () => {
    authService.signup.mockResolvedValue({ message: 'ok' });

    const dto = { email: 'x@y.com', password: 'pw', name: 'X', invitationToken: 'tok' } as any;
    const result = await controller.signup(dto);

    expect(authService.signup).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ message: 'ok' });
  });

  it('delegates login to the service', async () => {
    authService.login.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });

    const dto = { email: 'x@y.com', password: 'pw' } as any;
    await expect(controller.login(dto)).resolves.toEqual({
      accessToken: 'a',
      refreshToken: 'r',
    });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('delegates googleAuth to the service', async () => {
    authService.googleAuth.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });

    const dto = { email: 'x@y.com', name: 'X' } as any;
    await controller.googleAuth(dto);

    expect(authService.googleAuth).toHaveBeenCalledWith(dto);
  });

  it('extracts user.sub from the request for refresh', async () => {
    authService.refresh.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });

    const req = { user: { sub: 'user-123' } } as any;
    await controller.refresh(req);

    expect(authService.refresh).toHaveBeenCalledWith('user-123');
  });

  it('extracts user.sub from the request for getProfile', async () => {
    authService.validateUser.mockResolvedValue({ id: 'user-123' });

    await controller.getProfile({ user: { sub: 'user-123' } } as any);

    expect(authService.validateUser).toHaveBeenCalledWith('user-123');
  });

  it('forwards forgotPassword and resetPassword DTOs', async () => {
    authService.forgotPassword.mockResolvedValue({ message: 'ok' });
    authService.resetPassword.mockResolvedValue({ message: 'ok' });

    await controller.forgotPassword({ email: 'x@y.com' } as any);
    await controller.resetPassword({ token: 't', password: 'p' } as any);

    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'x@y.com' });
    expect(authService.resetPassword).toHaveBeenCalledWith({ token: 't', password: 'p' });
  });

  it('passes both user.sub and the photo URL when updating the profile photo', async () => {
    authService.updateProfilePhoto.mockResolvedValue({ id: 'u1' });

    await controller.updateProfilePhoto(
      { user: { sub: 'user-123' } } as any,
      { profilePhoto: 'https://example.com/p.jpg' } as any
    );

    expect(authService.updateProfilePhoto).toHaveBeenCalledWith(
      'user-123',
      'https://example.com/p.jpg'
    );
  });

  it('forwards the entire DTO to updateProfile along with user.sub', async () => {
    authService.updateProfile.mockResolvedValue({ id: 'u1' });
    const dto = { name: 'New Name', phoneNumber: '+351912345678' };

    await controller.updateProfile({ user: { sub: 'user-123' } } as any, dto as any);

    expect(authService.updateProfile).toHaveBeenCalledWith('user-123', dto);
  });

  it('extracts the token string from VerifyEmailDto', async () => {
    authService.verifyEmail.mockResolvedValue({ message: 'ok' });

    await controller.verifyEmail({ token: 'verify-token' } as any);

    expect(authService.verifyEmail).toHaveBeenCalledWith('verify-token');
  });

  it('extracts the email from ResendVerificationDto', async () => {
    authService.resendVerificationEmail.mockResolvedValue({ message: 'ok' });

    await controller.resendVerification({ email: 'x@y.com' } as any);

    expect(authService.resendVerificationEmail).toHaveBeenCalledWith('x@y.com');
  });

  it('propagates service errors', async () => {
    authService.login.mockRejectedValue(new Error('boom'));

    await expect(controller.login({ email: 'x', password: 'y' } as any)).rejects.toThrow('boom');
  });
});
