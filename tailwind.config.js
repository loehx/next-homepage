module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                transparent: "rgba(0,0,0,0)",
                black: {
                    DEFAULT: "var(--black)",
                    5: "rgba(var(--black-rgb), .05)",
                    10: "rgba(var(--black-rgb), .1)",
                    20: "rgba(var(--black-rgb), .2)",
                    30: "rgba(var(--black-rgb), .3)",
                    40: "rgba(var(--black-rgb), .4)",
                    50: "rgba(var(--black-rgb), .5)",
                    60: "rgba(var(--black-rgb), .6)",
                    70: "rgba(var(--black-rgb), .7)",
                    80: "rgba(var(--black-rgb), .8)",
                    90: "rgba(var(--black-rgb), .9)",
                },
                white: {
                    DEFAULT: "white",
                    5: "rgba(255, 255, 255, .05)",
                    10: "rgba(255, 255, 255, .1)",
                    20: "rgba(255, 255, 255, .2)",
                    30: "rgba(255, 255, 255, .3)",
                    40: "rgba(255, 255, 255, .4)",
                    50: "rgba(255, 255, 255, .5)",
                    60: "rgba(255, 255, 255, .6)",
                    70: "rgba(255, 255, 255, .7)",
                    80: "rgba(255, 255, 255, .8)",
                    90: "rgba(255, 255, 255, .9)",
                },
                primary: {
                    DEFAULT: "var(--primary)",
                    50: "var(--primary-50)",
                    100: "var(--primary-100)",
                    200: "var(--primary-200)",
                    300: "var(--primary-300)",
                    400: "var(--primary-400)",
                    500: "var(--primary)",
                    600: "var(--primary-600)",
                    700: "var(--primary-700)",
                    800: "var(--primary-800)",
                    900: "var(--primary-900)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    50: "var(--secondary-50)",
                    100: "var(--secondary-100)",
                    200: "var(--secondary-200)",
                    300: "var(--secondary-300)",
                    400: "var(--secondary-400)",
                    500: "var(--secondary)",
                    600: "var(--secondary-600)",
                    700: "var(--secondary-700)",
                    800: "var(--secondary-800)",
                    900: "var(--secondary-900)",
                },
                green: "var(--green)",
                red: "var(--red)",
                yellow: "var(--yellow)",
                grey: {
                    100: "var(--grey-1)",
                    200: "var(--grey-2)",
                    300: "var(--grey-3)",
                    400: "var(--grey-4)",
                    500: "var(--grey-5)",
                },
            },
        },
        fontFamily: {
            default: ["var(--font-default)"],
            headline: ["var(--font-headline)"],
            mono: ["var(--font-mono)"],
        },
        fontSize: {
            "2xs": "0.625rem",
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            "2xl": "1.5rem",
            "3xl": "1.875rem",
            "4xl": "2.25rem",
            "5xl": "3.375rem",
        },
        screens: {
            sm: "600px",
            md: "1000px",
        },
    },
    plugins: [],
};
