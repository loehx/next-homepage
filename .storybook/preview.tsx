import type { Preview } from "@storybook/react";
import React from "react";
import "../src/styles/fonts.css";
import "../src/styles/global.css";
import "../src/styles/theme.css";
import "../src/styles/animations.css";

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: "^on[A-Z].*" },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
