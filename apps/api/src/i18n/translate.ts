import { Locale } from '@padel/types';
import en from './dictionaries/en.json';
import pt from './dictionaries/pt.json';

type Dict = Record<string, unknown>;

const dictionaries: Record<Locale, Dict> = {
  [Locale.EN]: en as Dict,
  [Locale.PT]: pt as Dict,
};

const FALLBACK: Locale = Locale.PT;

function lookup(dict: Dict, key: string): string | undefined {
  const parts = key.split('.');
  let node: unknown = dict;
  for (const part of parts) {
    if (node && typeof node === 'object' && part in (node as Dict)) {
      node = (node as Dict)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const v = vars[name];
    return v !== undefined ? String(v) : `{${name}}`;
  });
}

export function t(
  locale: Locale | null | undefined,
  key: string,
  vars?: Record<string, string | number>
): string {
  const resolved = locale && dictionaries[locale] ? locale : FALLBACK;
  const value = lookup(dictionaries[resolved], key) ?? lookup(dictionaries[FALLBACK], key);
  if (value === undefined) return key;
  return interpolate(value, vars);
}

export function normalizeLocale(raw: string | null | undefined): Locale {
  if (!raw) return FALLBACK;
  const upper = raw.toUpperCase();
  return upper === Locale.EN || upper === Locale.PT ? (upper as Locale) : FALLBACK;
}
