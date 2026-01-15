# Installation des Dépendances - Auth V2

## Étapes d'Installation

### 1. Installer les dépendances de test

```bash
npm install --save-dev \
  vitest@^1.0.0 \
  @vitest/ui@^1.0.0 \
  @testing-library/react@^14.0.0 \
  @testing-library/jest-dom@^6.1.5 \
  @testing-library/user-event@^14.5.1 \
  jsdom@^23.0.1 \
  @vitest/coverage-v8@^1.0.0
```

### 2. Vérifier l'installation

```bash
npm run test -- --version
```

### 3. Exécuter les tests

```bash
# Tous les tests
npm run test

# Tests unitaires seulement
npm run test:unit

# Avec coverage
npm run test:coverage
```

## Scripts Disponibles

Les scripts suivants ont été ajoutés au package.json:

- `npm run test` - Lance tous les tests en mode watch
- `npm run test:unit` - Lance uniquement les tests unitaires (run once)
- `npm run test:coverage` - Tests avec rapport de couverture
- `npm run test:watch` - Mode watch pour développement
- `npm run test:ui` - Interface graphique Vitest

## Dépendances Ajoutées

| Package | Version | Usage |
|---------|---------|-------|
| vitest | ^1.0.0 | Test runner |
| @vitest/ui | ^1.0.0 | Interface graphique |
| @testing-library/react | ^14.0.0 | Tests composants React |
| @testing-library/jest-dom | ^6.1.5 | Matchers DOM |
| @testing-library/user-event | ^14.5.1 | Simulation interactions |
| jsdom | ^23.0.1 | Environnement DOM |
| @vitest/coverage-v8 | ^1.0.0 | Coverage reporter |

## Prochaines Étapes

Après installation:

1. Exécuter `npm run test` pour valider la configuration
2. Les tests devraient passer (55+ tests)
3. Vérifier le coverage: `npm run test:coverage`
4. Explorer l'UI: `npm run test:ui`
