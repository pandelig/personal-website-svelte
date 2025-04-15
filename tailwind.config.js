import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

/** @type {import("tailwindcss").Config} */
export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		extend: {}
	},

	plugins: [typography, daisyui],

	daisyui: {
		// themes: ["lofi"],
		themes: [
			{
				mytheme: {
					primary: "#000000",
					secondary: "#78716c",
					accent: "#000000",
					neutral: "#ffffff",
					"base-100": "#ffffff"
				}
			}
		]
	}
};
