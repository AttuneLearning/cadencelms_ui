# UAT Testing Directory

This directory contains User Acceptance Testing (UAT) scenarios that validate user stories.

## Structure

```
uat/
├── scenarios/          # Playwright E2E test files
│   ├── auth.uat.spec.ts
│   ├── dashboard.uat.spec.ts
│   └── courses.uat.spec.ts
├── fixtures/           # Test data and user states
│   ├── users.ts
│   └── courses.ts
├── utils/              # Page objects and helpers
│   ├── pages/
│   └── helpers.ts
└── README.md
```

## Running UAT Tests

```bash
# Run all UAT tests
npm run e2e

# Run with UI mode (for debugging)
npx playwright test --ui

# Run specific scenario
npx playwright test auth.uat.spec.ts

# Run in headed mode
npx playwright test --headed

# Generate report
npx playwright show-report
```

## Writing UAT Scenarios

Each scenario maps to a user story with acceptance criteria:

```typescript
test.describe('User Story: [Story Title]', () => {
  test('AC1: [Acceptance Criterion]', async ({ page }) => {
    // Given: setup preconditions
    // When: perform action
    // Then: verify outcome
  });
});
```

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Keep tests independent** - no shared state between tests
3. **Use fixtures** for consistent test data
4. **Page Objects** encapsulate page interactions
5. **Descriptive names** that match story language
