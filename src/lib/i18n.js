/**
 * Detects the user's preferred language from the browser.
 * Returns a short language code (e.g., 'en', 'zh', 'es').
 */
export const getLanguage = () => {
  const lang = navigator.language || navigator.userLanguage || 'en';
  return lang.split('-')[0].toLowerCase();
};

/**
 * Parses a string that might be a JSON object containing translations.
 * If it is valid JSON, returns the value for the current language.
 * Otherwise, returns the original string.
 * 
 * Example input: '{"en": "Hello", "zh": "你好"}'
 * Example output (if lang is 'zh'): '你好'
 */
export const localize = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Optimization: If it doesn't look like JSON, return immediately
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return text;
  }

  try {
    const json = JSON.parse(trimmed);
    const lang = getLanguage();
    
    // 1. Try exact match (e.g. 'zh')
    if (json[lang]) return json[lang];
    
    // 2. Fallback to 'en'
    if (json['en']) return json['en'];
    
    // 3. Fallback to the first key found
    const keys = Object.keys(json);
    if (keys.length > 0) return json[keys[0]];
    
    return text;
  } catch (e) {
    // Parsing failed, it's just a regular string that happens to start/end with {}
    return text;
  }
};