/**
 * Test shim for next-intl.
 *
 * Production next-intl requires NextIntlClientProvider + message catalogs.
 * For component unit tests we don't care about translation fidelity — we just
 * want the component to render without throwing. `useTranslations` returns a
 * function that echoes the key back (optionally prefixed with the namespace),
 * so tests can assert on keys like "open" instead of wiring real catalogs.
 */
export const useTranslations = (namespace?: string) => {
  const translate = (key: string, values?: Record<string, unknown>) => {
    if (values && Object.keys(values).length > 0) {
      return `${namespace ? `${namespace}.` : ''}${key}(${JSON.stringify(values)})`;
    }
    return key;
  };
  // next-intl's `t.rich` support — return string version for tests
  (translate as any).rich = translate;
  return translate as ((key: string, values?: Record<string, unknown>) => string) & {
    rich: typeof translate;
  };
};

export const useLocale = () => 'en';
export const useFormatter = () => ({
  dateTime: (d: Date) => d.toISOString(),
  number: (n: number) => String(n),
  relativeTime: (d: Date) => d.toISOString(),
});
export const useMessages = () => ({});
export const NextIntlClientProvider = ({ children }: { children: React.ReactNode }) => children;
