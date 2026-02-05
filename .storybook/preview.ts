import type { Preview } from "@storybook/preact";
import '../src/styles/global.css';

// Fix for "React is not defined" error in Storybook autodocs with Preact
import * as preact from 'preact';

if (typeof window !== 'undefined') {
  (window as any).React = preact;
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
