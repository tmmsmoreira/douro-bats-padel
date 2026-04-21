/**
 * jsdom-env setup for component tests. Silences noisy console.warn from
 * StatusBadge's unknown-status branch so intentional "unknown status" tests
 * don't flood the terminal — individual tests can still spy on console.warn.
 */
import '@testing-library/jest-dom';
