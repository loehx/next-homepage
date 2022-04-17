module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                black: "var(--black)",
                primary: "var(--primary)",
                secondary: "var(--secondary)",
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
        screens: {
            sm: "600px",
            md: "1000px",
        },
    },
    plugins: [],
};
