import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./apps/customer/**/*.{ts,tsx,js,jsx}",
    "./apps/vendor/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
};

export default config;
