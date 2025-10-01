export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            keyframes: {
                'nudge-right': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '50%': { transform: 'translateX(10px)' },
                }
            },
            animation: {
                'nudge-right': 'nudge-right 4s ease-in-out infinite',
            }
        },
    },
    plugins: [],
};
