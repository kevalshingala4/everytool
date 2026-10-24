/**
 * Tailwind CSS Configuration
 * -------------------------------------------------------------
 * This file tells Tailwind where to find your files so it can
 * apply the beautiful dark theme, cards, and colors to EveryTool.
 */

/** @type {import('tailwindcss').Config} */
export default {
  // 1. CONTENT: Tells Tailwind to scan all template files in 'src'
  // This ensures all Tailwind classes in your Astro components are styled.
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'
  ],

  // 2. THEME: Where you can customize colors, spacing, and fonts in the future.
  theme: {
    extend: {},
  },

  // 3. PLUGINS: Add any extra utility plugins here when needed.
  plugins: [],
};
