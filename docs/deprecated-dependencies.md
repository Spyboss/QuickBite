# Handling Deprecated Dependencies in QuickBite

This document provides guidance on replacing deprecated dependencies in the QuickBite application with modern alternatives.

## Identified Deprecated Dependencies

The following deprecated dependencies were identified in the QuickBite application:

1. `lodash.get@4.4.2`: Use optional chaining (`?.`) instead
2. `lodash.isequal@4.5.0`: Use `node:util.isDeepStrictEqual` instead
3. `glob@7.1.6`: Upgrade to `glob@9` or later
4. `eslint@8.56.0`: Upgrade to ESLint 9
5. `@mui/base@5.0.0-beta.36`: Replace with `@base-ui-components/react`

## Replacement Strategies

### 1. Replace `lodash.get` with Optional Chaining

**Before:**
```javascript
import get from 'lodash.get';

const value = get(obj, 'path.to.property');
const defaultValue = get(obj, 'path.to.missing', 'default');
```

**After:**
```javascript
// No import needed - native JavaScript

const value = obj?.path?.to?.property;
const defaultValue = obj?.path?.to?.missing ?? 'default';
```

### 2. Replace `lodash.isequal` with `node:util.isDeepStrictEqual`

**Before:**
```javascript
import isEqual from 'lodash.isequal';

const areEqual = isEqual(obj1, obj2);
```

**After:**
```javascript
import { isDeepStrictEqual } from 'node:util';

const areEqual = isDeepStrictEqual(obj1, obj2);
```

### 3. Upgrade `glob` to Version 9+

**Step 1:** Update the dependency:
```bash
npm install glob@latest
```

**Step 2:** Update usage patterns:

**Before (v7):**
```javascript
const glob = require('glob');

// Callback style
glob('**/*.js', (err, files) => {
  if (err) throw err;
  console.log(files);
});

// Sync style
const files = glob.sync('**/*.js');
```

**After (v9+):**
```javascript
import { glob } from 'glob';

// Promise style
const files = await glob('**/*.js');

// Sync style
import { globSync } from 'glob';
const files = globSync('**/*.js');
```

### 4. Upgrade ESLint to Version 9

**Step 1:** Update the dependency:
```bash
npm install eslint@latest
```

**Step 2:** Update ESLint configuration:

ESLint 9 uses a new configuration format. If you're using an older format (e.g., `.eslintrc.js`), you'll need to migrate to the new format (`eslint.config.js`).

See the [ESLint Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0) for details.

### 5. Replace `@mui/base` with `@base-ui-components/react`

**Step 1:** Install the new package:
```bash
npm uninstall @mui/base
npm install @base-ui-components/react
```

**Step 2:** Update imports:

**Before:**
```javascript
import { Button } from '@mui/base';
```

**After:**
```javascript
import { Button } from '@base-ui-components/react';
```

## Automated Replacement

We've created a script to help automate the replacement of some deprecated dependencies:

```bash
node scripts/replace-deprecated.js
```

This script will:
1. Find files using `lodash.get` and `lodash.isequal`
2. Replace them with modern alternatives
3. Log the changes made

## Manual Review

After running the automated replacement script, you should manually review the changes to ensure they work as expected. Some complex usage patterns may require additional adjustments.

## Security Vulnerabilities

To fix security vulnerabilities, run:

```bash
bash scripts/fix-vulnerabilities.sh
```

This script will:
1. Run `npm audit` to identify vulnerabilities
2. Fix non-breaking vulnerabilities with `npm audit fix`
3. Generate reports of remaining vulnerabilities

For critical vulnerabilities that can't be fixed automatically, you'll need to manually update the affected packages or implement workarounds.
