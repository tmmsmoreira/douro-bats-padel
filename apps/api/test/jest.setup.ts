/**
 * Silence NestJS Logger output during tests. Individual suites can still spy on
 * it, but the default is clean test output instead of pages of service logs.
 *
 * This runs as a Jest `setupFiles` entry (before the test framework is wired
 * up), so we monkey-patch Logger.prototype directly instead of using beforeAll.
 */
import { Logger } from '@nestjs/common';

const noop = () => undefined;
Logger.prototype.log = noop as Logger['log'];
Logger.prototype.error = noop as Logger['error'];
Logger.prototype.warn = noop as Logger['warn'];
Logger.prototype.debug = noop as Logger['debug'];
Logger.prototype.verbose = noop as Logger['verbose'];
