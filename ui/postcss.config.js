export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  // prevent PostCSS from parsing JS files
  options: {
    parser: (file) => {
      if (file && file.endsWith(".js")) {
        return false; // skip .js files
      }
    },
  },
};
