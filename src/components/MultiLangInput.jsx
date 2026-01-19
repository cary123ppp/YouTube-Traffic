import React, { useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

const MultiLangInput = ({ value, onChange, placeholder, rows = 1, className = '', currentLang }) => {
  const [internalLang, setInternalLang] = useState('en');
  const activeLang = currentLang || internalLang;
  const isControlled = !!currentLang;

  // Helper to parse current value safely
  const getValues = () => {
    try {
      if (!value) return {};
      if (typeof value === 'string' && value.trim().startsWith('{')) {
        return JSON.parse(value);
      }
      return { en: value };
    } catch (e) {
      return { en: value };
    }
  };

  const values = getValues();

  const handleChange = (text) => {
    const newValues = { ...values, [activeLang]: text };
    onChange(JSON.stringify(newValues));
  };

  return (
    <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Tabs - Only show if not controlled externally */}
      {!isControlled && (
        <div className="flex bg-gray-50 border-b overflow-x-auto no-scrollbar">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setInternalLang(lang.code)}
              className={`
                flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none
                ${activeLang === lang.code ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'}
              `}
            >
              <span className="mr-1.5">{lang.flag}</span>
              {lang.label}
              {values[lang.code] && <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
            </button>
          ))}
        </div>
      )}
      
      {/* Input Area */}
      <div className="p-0 relative">
        {isControlled && (
          <div className="absolute right-2 top-2 text-lg pointer-events-none opacity-50">
            {LANGUAGES.find(l => l.code === activeLang)?.flag}
          </div>
        )}

        {rows > 1 ? (
          <textarea
            rows={rows}
            value={values[activeLang] || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`${placeholder || ''} (${LANGUAGES.find(l => l.code === activeLang).label})`}
            className="w-full px-3 py-2 outline-none resize-y text-black bg-transparent"
            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
          />
        ) : (
          <input
            type="text"
            value={values[activeLang] || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`${placeholder || ''} (${LANGUAGES.find(l => l.code === activeLang).label})`}
            className="w-full px-3 py-2 outline-none text-black bg-transparent"
            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
          />
        )}
      </div>
    </div>
  );
};

export default MultiLangInput;