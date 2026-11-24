import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    testTimeout: 30_000,
    hookTimeout: 120_000,
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    fileParallelism: false, // sharing one test db
  },
});
