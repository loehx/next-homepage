import '../src/styles/global.css';

// Fix for "React is not defined" error in Storybook autodocs with Preact
import * as preact from 'preact';
if (typeof window !== 'undefined') {
  window.React = preact;
}

/** @type { import('@storybook/preact').Preview } */
const preview = {
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
