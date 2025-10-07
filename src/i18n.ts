import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import faTranslation from "./locales/fa.json";
import enTranslation from "./locales/en.json";
import arTranslation from "./locales/ar.json";
import zhTranslation from "./locales/zh.json";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      fa: {
        translation: faTranslation,
      },
      en: {
        translation: enTranslation,
      },
      ar: {
        translation: arTranslation,
      },
      zh: {
        translation: zhTranslation,
      },
    },
    lng: "fa", // default language
    fallbackLng: "fa", // fallback language if translation is missing
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;