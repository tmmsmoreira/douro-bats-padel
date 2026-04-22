import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PlayersService } from './players.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';
import { Role } from '@padel/types';

describe('PlayersService.findAll', () => {
  let prisma: PrismaMock;
  let service: PlayersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new PlayersService(prisma as any);
  });

  it('returns registered players (sorted by rating desc) combined with pending invitations', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'u1',
        email: 'alice@x.com',
        name: 'Alice',
        profilePhoto: null,
        emailVerified: new Date(),
        createdAt: new Date('2026-01-01'),
        player: {
          id: 'p1',
          rating: 350,
          status: 'ACTIVE',
          notificationsPaused: false,
          createdAt: new Date('2026-01-01'),
        },
      },
    ]);
    prisma.invitation.findMany.mockResolvedValue([
      {
        id: 'inv1',
        email: 'bob@x.com',
        name: 'Bob',
        status: 'PENDING',
        expiresAt: new Date('2099-01-01'),
        invitedBy: 'u1',
        invitedByUser: { id: 'u1', name: 'Alice', email: 'alice@x.com' },
        token: 'tok',
        usedAt: null,
        createdAt: new Date('2026-01-02'),
      },
    ]);

    const result = await service.findAll();

    // Registered player first, then invited-but-not-registered
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: 'u1', email: 'alice@x.com', invitation: null });
    expect(result[0].player).toMatchObject({ id: 'p1', rating: 350 });
    expect(result[1]).toMatchObject({ id: 'inv1', email: 'bob@x.com', player: null });
    expect(result[1].invitation).toMatchObject({ status: 'PENDING', token: 'tok' });

    // Sort-by-rating is in the Prisma query, not post-processed
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { player: { rating: 'desc' } },
      })
    );
  });

  it('filters invitations to PENDING and non-expired', async () => {
    prisma.user.findMany.mockResolvedValue([]);
    prisma.invitation.findMany.mockResolvedValue([]);

    await service.findAll();

    const call = prisma.invitation.findMany.mock.calls[0][0];
    expect(call.where.status).toBe('PENDING');
    expect(call.where.expiresAt.gt).toBeInstanceOf(Date);
  });

  it('returns an empty array when there are no users or invitations', async () => {
    prisma.user.findMany.mockResolvedValue([]);
    prisma.invitation.findMany.mockResolvedValue([]);

    expect(await service.findAll()).toEqual([]);
  });
});

describe('PlayersService.findOne', () => {
  let prisma: PrismaMock;
  let service: PlayersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new PlayersService(prisma as any);
  });

  const registeredUser = {
    id: 'u1',
    email: 'alice@x.com',
    name: 'Alice',
    profilePhoto: null,
    emailVerified: new Date(),
    createdAt: new Date('2026-01-01'),
    roles: [Role.VIEWER],
    dateOfBirth: new Date('1990-01-01'),
    phoneNumber: '+351900000000',
    player: { id: 'p1', rating: 300, weeklyScores: [], rankingSnapshots: [] },
  };

  it('returns only public fields when the requester is not an admin', async () => {
    prisma.user.findUnique.mockResolvedValue(registeredUser);

    const result = await service.findOne('u1', null);

    // Public fields allowed
    expect(result).toMatchObject({ id: 'u1', name: 'Alice', player: registeredUser.player });
    // Private fields NOT leaked
    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('phoneNumber');
    expect(result).not.toHaveProperty('dateOfBirth');
    expect(result).not.toHaveProperty('roles');
  });

  it('returns the full record (including email/roles/phone) for admin requesters', async () => {
    prisma.user.findUnique.mockResolvedValue(registeredUser);

    const result = await service.findOne('u1', { roles: [Role.ADMIN] });

    expect(result).toMatchObject({
      id: 'u1',
      email: 'alice@x.com',
      roles: [Role.VIEWER],
      phoneNumber: '+351900000000',
    });
  });

  it('looks up invitations as a fallback for admin requesters', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.invitation.findUnique.mockResolvedValue({
      id: 'inv1',
      email: 'bob@x.com',
      name: 'Bob',
      status: 'PENDING',
      expiresAt: new Date('2099-01-01'),
      invitedBy: 'u1',
      invitedByUser: { id: 'u1', name: 'Alice', email: 'alice@x.com' },
      token: 'tok',
      usedAt: null,
      createdAt: new Date('2026-01-02'),
    });

    const result = (await service.findOne('inv1', { roles: [Role.ADMIN] })) as any;

    expect(result).toMatchObject({ id: 'inv1', email: 'bob@x.com', player: null });
    expect(result.invitation).toMatchObject({ status: 'PENDING', token: 'tok' });
  });

  it('never queries invitations for non-admin requesters (prevents invitation metadata leak)', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne('inv1', { roles: [Role.VIEWER] })).rejects.toBeInstanceOf(
      NotFoundException
    );
    expect(prisma.invitation.findUnique).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when neither user nor invitation exists (admin)', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.invitation.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', { roles: [Role.ADMIN] })).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('handles a requester with no roles field at all (treated as public)', async () => {
    prisma.user.findUnique.mockResolvedValue(registeredUser);

    const result = await service.findOne('u1', {});

    expect(result).not.toHaveProperty('email');
  });
});

describe('PlayersService.remove', () => {
  let prisma: PrismaMock;
  let service: PlayersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new PlayersService(prisma as any);
  });

  it('deletes a non-admin user and returns a success message', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', roles: [Role.VIEWER] });
    prisma.user.delete.mockResolvedValue({});

    const result = await service.remove('u1');

    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(result).toEqual({ message: 'User deleted successfully' });
  });

  it('throws NotFoundException when the user is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('refuses to delete admin users', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', roles: [Role.ADMIN, Role.VIEWER] });

    await expect(service.remove('u1')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('handles users with no roles array (treated as non-admin)', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', roles: null });
    prisma.user.delete.mockResolvedValue({});

    await expect(service.remove('u1')).resolves.toEqual({ message: 'User deleted successfully' });
  });
});
