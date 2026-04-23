/**
 * Lightweight factory for a mocked PrismaService used by service unit tests.
 *
 * Intentionally hand-rolled (vs. jest-mock-extended) so that each test
 * configures only the Prisma methods it actually exercises. This keeps tests
 * readable and makes it obvious when a service change starts calling a new
 * Prisma method.
 */

type Fn = jest.Mock;

const makeModelMock = () => ({
  findUnique: jest.fn() as Fn,
  findFirst: jest.fn() as Fn,
  findMany: jest.fn() as Fn,
  create: jest.fn() as Fn,
  createMany: jest.fn() as Fn,
  update: jest.fn() as Fn,
  updateMany: jest.fn() as Fn,
  upsert: jest.fn() as Fn,
  delete: jest.fn() as Fn,
  deleteMany: jest.fn() as Fn,
  count: jest.fn() as Fn,
  groupBy: jest.fn() as Fn,
  aggregate: jest.fn() as Fn,
});

export type ModelMock = ReturnType<typeof makeModelMock>;

export interface PrismaMock {
  event: ModelMock;
  rSVP: ModelMock;
  playerProfile: ModelMock;
  user: ModelMock;
  draw: ModelMock;
  assignment: ModelMock;
  match: ModelMock;
  weeklyScore: ModelMock;
  rankingSnapshot: ModelMock;
  invitation: ModelMock;
  eventCourt: ModelMock;
  venue: ModelMock;
  court: ModelMock;
  pushSubscription: ModelMock;
  $transaction: jest.Mock;
  $queryRaw: jest.Mock;
  $executeRaw: jest.Mock;
}

/**
 * $transaction supports two call patterns:
 *   - Array: prisma.$transaction([op1, op2])    → returns Promise.all(ops)
 *   - Callback: prisma.$transaction(async (tx) => ...) → invokes callback with the mock itself
 *
 * This helper handles both so services under test can use either form without
 * the test having to know which one.
 */
export function createPrismaMock(): PrismaMock {
  const prisma: Partial<PrismaMock> = {
    event: makeModelMock(),
    rSVP: makeModelMock(),
    playerProfile: makeModelMock(),
    user: makeModelMock(),
    draw: makeModelMock(),
    assignment: makeModelMock(),
    match: makeModelMock(),
    weeklyScore: makeModelMock(),
    rankingSnapshot: makeModelMock(),
    invitation: makeModelMock(),
    eventCourt: makeModelMock(),
    venue: makeModelMock(),
    court: makeModelMock(),
    pushSubscription: makeModelMock(),
  };

  prisma.$transaction = jest.fn((arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: unknown) => unknown)(prisma);
    }
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    return undefined;
  }) as jest.Mock;

  // Raw-SQL helpers default to returning an empty result so tests that don't
  // configure them don't crash; tests that care (e.g. waitlist `FOR UPDATE`
  // locking) override with mockResolvedValue before invoking the service.
  prisma.$queryRaw = jest.fn().mockResolvedValue([]) as jest.Mock;
  prisma.$executeRaw = jest.fn().mockResolvedValue(0) as jest.Mock;

  return prisma as PrismaMock;
}
