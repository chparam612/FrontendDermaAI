import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_STRINGS = [
  'multi-view',
  'multi-modal',
  'High Risk',
  'Low Risk',
  'Diagnostic Assessment',
  'Differential Diagnostic',
  'Fitzpatrick',
];

function getSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Exclude mocks directory
      if (entry.name === 'mocks') {
        continue;
      }
      files.push(...getSourceFiles(fullPath));
    } else if (entry.isFile()) {
      // Only include .ts and .tsx files, excluding tests
      if (
        (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
        !entry.name.includes('.test.')
      ) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

describe('Honesty & Guard Test (Phase F5 Wording Rules)', () => {
  it('scans src/**/*.ts(x) (excluding tests and mocks) and ensures no forbidden terms appear', () => {
    const srcDir = path.resolve(__dirname);
    const sourceFiles = getSourceFiles(srcDir);
    expect(sourceFiles.length).toBeGreaterThan(5);

    const violations: Array<{ file: string; line: number; forbidden: string; text: string }> = [];

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((lineText, idx) => {
        for (const forbidden of FORBIDDEN_STRINGS) {
          // Check case-insensitive to ensure strict honesty
          if (lineText.toLowerCase().includes(forbidden.toLowerCase())) {
            // Explicit disclaimer "not Fitzpatrick" is allowed per audit instructions
            if (forbidden.toLowerCase() === 'fitzpatrick' && lineText.includes('not Fitzpatrick')) {
              continue;
            }
            violations.push({
              file: path.relative(srcDir, filePath),
              line: idx + 1,
              forbidden,
              text: lineText.trim(),
            });
          }
        }
      });
    }

    if (violations.length > 0) {
      const summary = violations
        .map((v) => `[${v.file}:${v.line}] Contains forbidden term "${v.forbidden}": ${v.text}`)
        .join('\n');
      expect.fail(`Found forbidden terms in source files:\n${summary}`);
    }

    expect(violations).toHaveLength(0);
  });
});
