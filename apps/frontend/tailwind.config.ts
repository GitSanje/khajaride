import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./apps/customer/**/*.{ts,tsx,js,jsx}",
    "./apps/vendor/**/*.{ts,tsx,js,jsx}",
  ],
  plugins: [],
};

export default config;
