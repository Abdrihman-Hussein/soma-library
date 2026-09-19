import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Lang } from '../types'
import so from './so.json'
import en from './en.json'

type Dict = typeof so

interface I18nContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (path: string, vars?: Record<string, string | number>) => string
}

const dictionaries: Record<Lang, Dict> = { so, en: en as Dict }

const I18nContext = createContext<I18nContextValue | null>(null)

function lookup(dict: unknown, path: string): string | undefined {
  let node: unknown = dict
  for (const part of path.split('.')) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof node === 'string' ? node : undefined
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('somalibrary.lang')
    return saved === 'en' || saved === 'so' ? saved : 'so'
  })

  useEffect(() => {
    localStorage.setItem('somalibrary.lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => setLangState(l), [])

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      let str = lookup(dictionaries[lang], path) ?? lookup(dictionaries.en, path) ?? path
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`{{${k}}}`, 'g'), String(v))
        }
      }
      return str
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useT() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useT must be used inside I18nProvider')
  return ctx
}
