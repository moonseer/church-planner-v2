# Localization Directory

This directory contains translation files for internationalization (i18n) support in the Church Planner v2 application.

## Directory Structure

- **en/**: English translation files
  - `common.json`: General UI translations
  - `dashboard.json`: Dashboard-specific translations
  - `calendar.json`: Calendar-specific translations
  - ...etc.

- **es/**: Spanish translation files
  - `common.json`: General UI translations
  - `dashboard.json`: Dashboard-specific translations
  - `calendar.json`: Calendar-specific translations
  - ...etc.

## Adding a New Language

To add a new language:

1. Create a new directory with the language code (e.g., `fr` for French)
2. Copy all JSON files from the `en` directory to the new language directory
3. Translate all strings in the copied files
4. Update the language selection in the application settings

## Translation File Format

Each translation file is a JSON object with nested keys. For example:

```json
{
  "section": {
    "subsection": {
      "key": "Translated text"
    }
  }
}
```

## Using Translations in the Application

### Client-side (React with i18next)

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('section.subsection.key')}</h1>
      <p>{t('section.anotherKey', { variable: 'value' })}</p>
    </div>
  );
};
```

### Server-side (Node.js with i18next)

```typescript
import i18next from 'i18next';

const translatedText = i18next.t('section.subsection.key', { lng: 'en' });
```

## Best Practices

1. **Organization**:
   - Keep translation keys organized by feature
   - Use dot notation for nested keys
   - Group related translations together

2. **Naming Conventions**:
   - Use camelCase for keys
   - Use descriptive, specific names
   - Avoid generic keys like "title" or "description"

3. **Variables**:
   - Use clear placeholders with double curly braces: `{{variable}}`
   - Document the expected variables in comments

4. **Pluralization**:
   - Use appropriate plural forms for each language
   - Test translations with various counts

5. **Maintenance**:
   - Keep all language files in sync
   - Update all translations when adding new features
   - Document any special considerations for specific languages 