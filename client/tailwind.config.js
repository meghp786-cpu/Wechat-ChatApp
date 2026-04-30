/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neonViolet: "#9D00FF",
                electricBlue: "#00E5FF",
                deepCharcoal: "#0A0A0A",
                creamBg: "#F4F0E4",
                tealAccent: "#44A194",
                mutedBlue: "#537D96",
                softCoral: "#EC8F8D",
                darkSlate: "#1A202C",
                secondarySlate: "#4A5568",
                darkerCream: "#E8E3D5",
            },
            boxShadow: {
                glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                tealGlow: "0 0 20px rgba(68, 161, 148, 0.3)",
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
                'teal-blue-gradient': 'linear-gradient(to bottom right, #44A194, #537D96)',
            },
        },
    },
    plugins: [],
}
