require('dotenv').config();

module.exports = {
  // eslint-disable-next-line no-process-env
  apiKey: process.env.APPLITOOLS_API_KEY,
  browser: [
    { width: 1024, height: 768, name: 'chrome' },
    { width: 1024, height: 768, name: 'ie11' },
  ],
  waitBeforeScreenshot: 500,
};
