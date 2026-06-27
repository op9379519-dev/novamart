import React from "react";
import { Globe, Check, Sparkles, ShieldCheck } from "lucide-react";

interface LanguageSettingsPageProps {
  currentLang: "en" | "hi" | "es";
  onLanguageChange: (lang: "en" | "hi" | "es") => void;
}

const translations = {
  en: {
    title: "🌐 Regional Language Settings",
    sub: "Tune the core NovaMart application interface to your preferred native dialect.",
    select: "Select Interface Language",
    activeLabel: "Currently Selected",
    msg: "✓ Language synchronized successfully! Core menus, checkout prompts, order invoices, and dispute filing structures will adapt automatically.",
    features: "Dynamic Multi-vendor Translation",
    featuresSub: "Automatically translatestax structures, payment dialogs, address entries, and billing invoice statements."
  },
  hi: {
    title: "🌐 क्षेत्रीय भाषा सेटिंग्स",
    sub: "अपनी पसंदीदा स्थानीय भाषा में नोवामार्ट एप्लिकेशन इंटरफ़ेस सेट करें।",
    select: "इंटरफ़ेस की भाषा चुनें",
    activeLabel: "वर्तमान में चयनित",
    msg: "✓ भाषा सफलतापूर्वक समन्वित हो गई है! मुख्य मेनू, चेकआउट विकल्प, ऑर्डर रसीदें और शिकायत प्रपत्र स्वचालित रूप से बदल जाएंगे।",
    features: "गतिशील बहु-विक्रेता अनुवाद",
    featuresSub: "टैक्स नियमों, पेमेंट संवाद, एड्रेस प्रविष्टियों और बिलिंग विवरणों का स्वचालित अनुवाद करता है।"
  },
  es: {
    title: "🌐 Ajustes de Idioma Regional",
    sub: "Ajuste la interfaz de la aplicación NovaMart a su dialecto nativo preferido.",
    select: "Seleccionar Idioma de la Interfaz",
    activeLabel: "Seleccionado Actualmente",
    msg: "✓ ¡Idioma sincronizado con éxito! El menú principal, opciones de pago, facturas de compra y disputas de soporte se adaptarán automáticamente.",
    features: "Traducción Dinámica Multivendedor",
    featuresSub: "Traduce automáticamente estructuras de impuestos, diálogos de pagos, e informes de facturación."
  }
};

export default function LanguageSettingsPage({ currentLang, onLanguageChange }: LanguageSettingsPageProps) {
  const t = translations[currentLang] || translations.en;

  const languages = [
    { code: "en" as const, name: "English", nativeName: "English (US/UK)", icon: "🇬🇧" },
    { code: "hi" as const, name: "Hindi", nativeName: "हिंदी (भारत)", icon: "🇮🇳" },
    { code: "es" as const, name: "Spanish", nativeName: "Español (ES/MX)", icon: "🇪🇸" }
  ];

  return (
    <div className="space-y-8 text-left max-w-2xl mx-auto py-4 select-none min-h-[60vh]" id="language-selection-page">
      
      {/* Upper header */}
      <div className="space-y-2 border-b pb-4 border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          {t.title}
        </h2>
        <p className="text-xs text-neutral-400 font-medium leading-relaxed">
          {t.sub}
        </p>
      </div>

      <div className="space-y-6">
        <span className="text-xs uppercase font-black text-neutral-400 tracking-widest block">
          {t.select}
        </span>

        {/* Card choice list */}
        <div className="grid grid-cols-1 gap-4">
          {languages.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all text-left group ${
                  isActive 
                    ? "bg-red-600/5 dark:bg-red-600/10 border-red-500 text-neutral-950 dark:text-white font-black ring-2 ring-red-500/20"
                    : "bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-850 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300"
                }`}
                id={`lang-btn-${lang.code}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-200">
                    {lang.icon}
                  </span>
                  <div>
                    <span className="text-sm font-extrabold block text-neutral-900 dark:text-white">{lang.name}</span>
                    <span className="text-[11px] text-neutral-400 font-medium">{lang.nativeName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isActive ? (
                    <span className="bg-red-500 text-white p-1 rounded-full text-[9px] font-bold">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-neutral-305 dark:border-neutral-800"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Informative Synchronized State bubble */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-900 space-y-3">
          <p className="text-[11px] text-neutral-500 font-medium leading-relaxed italic">
            {t.msg}
          </p>
          
          <div className="flex gap-2.5 items-start text-[10px] text-neutral-400 pt-3 border-t border-neutral-100 dark:border-neutral-900">
            <ShieldCheck className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
            <div>
              <span className="font-bold text-neutral-700 dark:text-neutral-200 block">
                {t.features}
              </span>
              {t.featuresSub}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
