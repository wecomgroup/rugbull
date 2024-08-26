const { I18n } = require('i18n');
const config = require('../config/i18n')
const acceptLanguageParser = require('accept-language-parser');


const i18n = new I18n(config);


i18n.detectLocaleFromAcceptedLanguages = (acceptedLanguages, localesSupported = config.locales) => {
  const acceptedLanguageCodes = acceptLanguageParser.pick(localesSupported, acceptedLanguages);
  return acceptedLanguageCodes || config.defaultLocale;
}


module.exports = i18n;

