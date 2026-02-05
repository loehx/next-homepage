import type { StorybookConfig } from "@storybook/preact-vite";

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
