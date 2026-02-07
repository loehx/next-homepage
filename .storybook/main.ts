import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
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
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(config, {
      esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
      },
      resolve: {
        alias: {
          'lenis/react': path.resolve(process.cwd(), '.storybook/lenis-react-mock.tsx'),
          'preact/hooks': 'react',
          'preact/jsx-runtime': 'react/jsx-runtime',
          'preact': 'react',
        },
      },
      optimizeDeps: {
        force: true,
        exclude: ['preact', 'preact/hooks'],
        include: [
          'react',
          'react-dom',
          '@react-three/fiber',
          '@react-three/drei',
          'three',
        ],
      },
      server: {
        port: 6006,
      },
    });
  },
};

export default config;
