#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const contractsRoot = path.resolve(repoRoot, 'dev_communication/shared/contracts');
const contractsDistPath = path.join(contractsRoot, 'dist', 'contracts.json');
const contractTypesPath = path.join(contractsRoot, 'dist', 'contract-types.d.ts');
const contractsApiPath = path.join(contractsRoot, 'api');

const sourceRoots = ['src', 'scripts'];
const requiredEndpointKeys = ['endpoint', 'method', 'response'];

let hasErrors = false;

function error(message) {
  hasErrors = true;
  console.error(`ERROR: ${message}`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    error(`Failed to parse JSON: ${filePath} (${err.message})`);
    return null;
  }
}

function walkFiles(targetPath, collector) {
  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      walkFiles(path.join(targetPath, entry), collector);
    }
    return;
  }
  collector(targetPath);
}

function verifyDistArtifacts() {
  if (!fs.existsSync(contractsDistPath)) {
    error(`Missing canonical contract artifact: ${contractsDistPath}`);
    return;
  }

  if (!fs.existsSync(contractTypesPath)) {
    error(`Missing canonical contract types artifact: ${contractTypesPath}`);
    return;
  }

  const contractsJson = readJson(contractsDistPath);
  if (!contractsJson) return;

  if (!contractsJson.contracts || typeof contractsJson.contracts !== 'object') {
    error(`${contractsDistPath} does not include a top-level "contracts" object`);
    return;
  }

  const missingKeys = [];
  const missingRequest = [];
  for (const [contractName, contractEntries] of Object.entries(contractsJson.contracts)) {
    if (!contractEntries || typeof contractEntries !== 'object') {
      missingKeys.push(`${contractName}: expected object`);
      continue;
    }

    for (const [entryName, entryDef] of Object.entries(contractEntries)) {
      if (!entryDef || typeof entryDef !== 'object') {
        missingKeys.push(`${contractName}.${entryName}: expected object`);
        continue;
      }

      for (const key of requiredEndpointKeys) {
        if (!(key in entryDef)) {
          missingKeys.push(`${contractName}.${entryName}: missing "${key}"`);
        }
      }

      if (!('request' in entryDef)) {
        missingRequest.push(`${contractName}.${entryName}`);
      }
    }
  }

  if (missingKeys.length > 0) {
    error(
      `Endpoint-only contract validation failed. Missing keys:\n${missingKeys
        .slice(0, 25)
        .join('\n')}${missingKeys.length > 25 ? '\n... (truncated)' : ''}`
    );
  } else {
    console.log('OK: contracts/dist/contracts.json uses endpoint-only entries.');
  }

  if (missingRequest.length > 0) {
    console.log(
      `WARN: ${missingRequest.length} endpoint entries do not define request metadata (accepted for now).`
    );
  }
}

function verifyNoGeneratedJsSiblings() {
  if (!fs.existsSync(contractsApiPath)) {
    error(`Missing contracts/api directory: ${contractsApiPath}`);
    return;
  }

  const jsFiles = fs
    .readdirSync(contractsApiPath)
    .filter((file) => file.endsWith('.js'));

  if (jsFiles.length > 0) {
    error(
      `Found generated JS siblings in contracts/api (should be dist-only): ${jsFiles.join(', ')}`
    );
  } else {
    console.log('OK: contracts/api contains no generated .js artifacts.');
  }
}

function verifyNoJsContractImportsInUi() {
  const matches = [];

  for (const root of sourceRoots) {
    const fullPath = path.join(repoRoot, root);
    if (!fs.existsSync(fullPath)) continue;

    walkFiles(fullPath, (filePath) => {
      if (!/\.(ts|tsx|js|jsx|md)$/i.test(filePath)) return;
      const content = fs.readFileSync(filePath, 'utf8');

      if (/contracts\/api\/[^'"`]+\.js/gi.test(content)) {
        matches.push(path.relative(repoRoot, filePath));
      }
    });
  }

  if (matches.length > 0) {
    error(
      `Found references to removed contracts/api/*.js artifacts:\n${matches.join('\n')}`
    );
  } else {
    console.log('OK: no UI/docs references to contracts/api/*.js artifacts.');
  }
}

verifyDistArtifacts();
verifyNoGeneratedJsSiblings();
verifyNoJsContractImportsInUi();

if (hasErrors) {
  process.exit(1);
}

console.log('Contract ingestion verification passed.');
