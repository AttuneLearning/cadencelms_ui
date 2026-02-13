# Contract Ingestion Workflow

## Canonical Inputs

Use only generated contract artifacts from:

- `dev_communication/shared/contracts/dist/contracts.json`
- `dev_communication/shared/contracts/dist/contract-types.d.ts`

Do not depend on generated JavaScript files in `contracts/api/`. Source `.contract.ts` files remain useful for human reference, but ingestion/verification should be based on `dist` artifacts.

## Verification

Run:

```bash
npm run contracts:verify
```

This check validates:

1. `contracts/dist` artifacts exist.
2. Exported contract entries follow endpoint-only shape (`endpoint`, `method`, `request`, `response`).
3. No generated `.js` siblings exist in `contracts/api`.
4. UI/docs do not reference `contracts/api/*.js`.

## Recommended Update Sequence

1. Pull latest backend/submodule changes.
2. Run `npm run contracts:verify`.
3. Run `npm run -s typecheck`.
4. Run targeted tests for changed entities/features.
