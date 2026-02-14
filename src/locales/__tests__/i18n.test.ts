import i18n from '../i18n';
import enTranslations from '../en';
import plTranslations from '../pl';
import ukTranslations from '../uk';
import deTranslations from '../de';

describe('i18n Configuration', () => {
  it('should have English as fallback language', () => {
    expect(i18n.options.fallbackLng).toContain('en');
  });

  it('should have English translations', () => {
    expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
  });

  describe('Translation Keys', () => {
    const requiredKeys = [
      'home.title',
      'home.scanButton',
      'home.recentScans',
      'settings.title',
      'settings.language',
      'subscription.pro',
      'subscription.free',
      'subscription.upgrade',
    ];

    requiredKeys.forEach((key) => {
      it(`should have key "${key}" in all languages`, () => {
        expect(i18n.exists(key, { lng: 'en' })).toBe(true);
        expect(i18n.exists(key, { lng: 'pl' })).toBe(true);
        expect(i18n.exists(key, { lng: 'uk' })).toBe(true);
        expect(i18n.exists(key, { lng: 'de' })).toBe(true);
      });
    });
  });

  describe('Translation Consistency', () => {
    it('should have same keys across all languages', () => {
      const enKeys = Object.keys(flatten(enTranslations));
      const plKeys = Object.keys(flatten(plTranslations));
      const ukKeys = Object.keys(flatten(ukTranslations));
      const deKeys = Object.keys(flatten(deTranslations));

      expect(plKeys.sort()).toEqual(enKeys.sort());
      expect(ukKeys.sort()).toEqual(enKeys.sort());
      expect(deKeys.sort()).toEqual(enKeys.sort());
    });
  });
});

// Helper to flatten nested translation object
function flatten(obj: any, prefix = ''): Record<string, any> {
  return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flatten(obj[key], fullKey));
    } else {
      acc[fullKey] = obj[key];
    }
    return acc;
  }, {});
}
