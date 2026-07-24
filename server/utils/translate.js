const axios = require('axios');

// LibreTranslate API (completely free and open source)
async function translateText(text, targetLanguage) {
  try {
    // If target language is English, return as is
    if (targetLanguage === 'en') {
      return text;
    }

    // Map language codes to LibreTranslate format
    const languageMap = {
      'es': 'es', // Spanish
      'fr': 'fr', // French
      'hi': 'hi', // Hindi
      'zh': 'zh'  // Chinese
    };

    const targetLang = languageMap[targetLanguage] || 'en';
    
    const response = await axios.post('https://libretranslate.com/translate', {
      q: text,
      source: 'en',
      target: targetLang
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.translatedText) {
      return response.data.translatedText;
    } else {
      console.log('Translation failed, returning original text');
      return text;
    }
  } catch (error) {
    console.error('Translation error:', error.message);
    // Return original text if translation fails
    return text;
  }
}

// Reverse translation (from other language to English)
async function translateToEnglish(text, sourceLanguage) {
  try {
    // If source language is English, return as is
    if (sourceLanguage === 'en') {
      return text;
    }

    const languageMap = {
      'es': 'es', // Spanish
      'fr': 'fr', // French
      'hi': 'hi', // Hindi
      'zh': 'zh'  // Chinese
    };

    const sourceLang = languageMap[sourceLanguage] || 'en';
    
    const response = await axios.post('https://libretranslate.com/translate', {
      q: text,
      source: sourceLang,
      target: 'en'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.translatedText) {
      return response.data.translatedText;
    } else {
      console.log('Translation failed, returning original text');
      return text;
    }
  } catch (error) {
    console.error('Translation error:', error.message);
    // Return original text if translation fails
    return text;
  }
}

module.exports = { translateText, translateToEnglish };