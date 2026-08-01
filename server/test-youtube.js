const { downloadVideo } = require("./services/youtube");

downloadVideo("https://www.youtube.com/watch?v=-uzyfko6v98")
  .then(console.log)
  .catch(console.error);