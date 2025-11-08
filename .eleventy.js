module.exports = function(eleventyConfig) {

  // Эти папки будут скопированы в итоговый сайт 1-в-1
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("script");
  eleventyConfig.addPassthroughCopy("images");

  // Говорим Eleventy, что .njk файлы - это наш "вход"
  return {
    dir: {
      input: ".", // Корень проекта
      output: "_site" // Куда складывать готовый сайт
    }
  };
};