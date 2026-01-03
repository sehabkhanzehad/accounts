import { createContext, useContext } from "react"
import { useTranslation } from 'react-i18next'

const I18nContext = createContext(undefined)

export function I18nProvider({ children }) {
  const { t: i18nT, i18n } = useTranslation()
  const language = i18n.language

  const t = (key, options) => {
    // If key is an object (inline translation), use smart fallback
    if (typeof key === "object" && key !== null) {
      // Try current language first
      if (key[language]) {
        return key[language]
      }

      // Fallback to English
      if (key.en) {
        return key.en
      }

      // If no English, return first available value
      const values = Object.values(key)
      return values[0] || ""
    }

    // Otherwise, use the original i18next translation with options
    return i18nT(key, options)
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage: (lang) => i18n.changeLanguage(lang), t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}
