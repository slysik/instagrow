import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				// Instagram Gradient Colors
				ig: {
					orange: "#F77737",
					pink: "#E1306C",
					purple: "#833AB4",
				},
				// Brand Colors
				brand: {
					dark: "#1E293B",
					light: "#F5F5F4",
					card: "#FAFAF9",
				},
				// Text Colors
				text: {
					primary: "#18181B",
					secondary: "#71717A",
					inverse: "#FFFFFF",
				},
			},
			fontFamily: {
				sans: ["var(--font-inter)", "system-ui", "sans-serif"],
			},
			backgroundImage: {
				"ig-gradient": "linear-gradient(45deg, #F77737, #E1306C, #833AB4)",
				"ig-gradient-hover":
					"linear-gradient(45deg, #F77737, #E1306C, #833AB4)",
			},
			animation: {
				"fade-in": "fadeIn 0.3s ease-in-out",
				"slide-up": "slideUp 0.3s ease-out",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
			},
		},
	},
	plugins: [],
};

export default config;
