import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type { import('@storybook/preact-vite').StorybookConfig } */
const config = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/preact-vite",
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(config, {
      resolve: {
        alias: {
          'react': 'preact/compat',
          'react-dom': 'preact/compat',
          'react-dom/test-utils': 'preact/compat/test-utils',
          'react/jsx-runtime': 'preact/jsx-runtime',
          'lenis/react': path.resolve(__dirname, './lenis-react-mock.tsx'),
        },
      },
      optimizeDeps: {
        include: [
          'preact/compat',
          'preact/hooks',
          'preact',
          'react',
          'react-dom',
        ],
      },
      server: {
        port: 6006,
      },
    });
  },
};

export default config;
