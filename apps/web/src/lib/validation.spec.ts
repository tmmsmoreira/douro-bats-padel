import { validators } from './validation';

describe('validators.required', () => {
  const required = validators.required();

  it('rejects empty string, whitespace, null, and undefined', () => {
    expect(required('').isValid).toBe(false);
    expect(required('   ').isValid).toBe(false);
    expect(required(null as unknown as string).isValid).toBe(false);
    expect(required(undefined as unknown as string).isValid).toBe(false);
  });

  it('accepts any non-empty, non-whitespace value', () => {
    expect(required('x').isValid).toBe(true);
    expect(required(' x ').isValid).toBe(true);
  });

  it('returns the custom error message when invalid', () => {
    expect(validators.required('Please fill this in')('').error).toBe('Please fill this in');
  });
});

describe('validators.minLength / maxLength', () => {
  it('minLength accepts values at or above the threshold', () => {
    const v = validators.minLength(3);
    expect(v('ab').isValid).toBe(false);
    expect(v('abc').isValid).toBe(true);
    expect(v('abcd').isValid).toBe(true);
  });

  it('maxLength accepts values at or below the threshold', () => {
    const v = validators.maxLength(3);
    expect(v('abc').isValid).toBe(true);
    expect(v('abcd').isValid).toBe(false);
  });
});

describe('validators.email', () => {
  const email = validators.email();

  it.each([
    ['user@example.com', true],
    ['first.last+tag@example.co.uk', true],
    ['plainstring', false],
    ['missing@tld', false],
    ['@nohost.com', false],
    ['spaces in@email.com', false],
    ['', false],
  ])('email(%p) → isValid=%p', (value, expected) => {
    expect(email(value).isValid).toBe(expected);
  });
});

describe('validators.url', () => {
  const url = validators.url();

  it('treats empty string as valid (optional)', () => {
    expect(url('').isValid).toBe(true);
  });

  it('accepts well-formed URLs', () => {
    expect(url('https://example.com').isValid).toBe(true);
    expect(url('http://localhost:3000/foo').isValid).toBe(true);
  });

  it('rejects malformed URLs', () => {
    expect(url('not a url').isValid).toBe(false);
  });
});

describe('validators.numberRange / min / max', () => {
  it('numberRange accepts boundary values', () => {
    const v = validators.numberRange(0, 100);
    expect(v(0).isValid).toBe(true);
    expect(v(100).isValid).toBe(true);
    expect(v(-1).isValid).toBe(false);
    expect(v(101).isValid).toBe(false);
  });

  it('min and max are inclusive', () => {
    expect(validators.min(5)(5).isValid).toBe(true);
    expect(validators.min(5)(4).isValid).toBe(false);
    expect(validators.max(5)(5).isValid).toBe(true);
    expect(validators.max(5)(6).isValid).toBe(false);
  });
});

describe('validators.futureDate', () => {
  const fixedNow = new Date('2026-06-15T12:00:00Z');

  beforeEach(() => jest.useFakeTimers().setSystemTime(fixedNow));
  afterEach(() => jest.useRealTimers());

  it('accepts a date strictly in the future', () => {
    expect(validators.futureDate()('2030-01-01T00:00:00Z').isValid).toBe(true);
  });

  it('rejects the current instant (strictly in the future)', () => {
    expect(validators.futureDate()(fixedNow.toISOString()).isValid).toBe(false);
  });

  it('rejects a past date', () => {
    expect(validators.futureDate()('2000-01-01').isValid).toBe(false);
  });

  it('accepts Date inputs as well as strings', () => {
    expect(validators.futureDate()(new Date('2030-01-01')).isValid).toBe(true);
  });
});

describe('validators.afterDate', () => {
  it('accepts dates strictly after the comparison date', () => {
    const v = validators.afterDate('2026-01-01');
    expect(v('2026-02-01').isValid).toBe(true);
    expect(v('2025-12-01').isValid).toBe(false);
  });

  it('rejects equal dates (strictly after)', () => {
    const v = validators.afterDate('2026-01-01T00:00:00Z');
    expect(v('2026-01-01T00:00:00Z').isValid).toBe(false);
  });
});

describe('validators.custom', () => {
  it('delegates to the provided predicate', () => {
    const isEven = validators.custom<number>((n) => n % 2 === 0, 'Must be even');
    expect(isEven(4).isValid).toBe(true);
    expect(isEven(5).isValid).toBe(false);
    expect(isEven(5).error).toBe('Must be even');
  });
});
