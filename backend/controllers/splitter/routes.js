const Router = require('koa-router');
const actions = require('./actions');
const multer = require('@koa/multer');
const path = require('path');

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(`${__dirname}/../../../frontend/public/uploaded/`));
  },
  filename: (req, file, cb) => {
    const match = [...file.originalname.match(/([^.]+)/gi)];
    const filename = match[0];
    const extension = match[1];

    cb(null, `${filename}-${Date.now()}.${extension}`);
  },
  onFileUploadStart: (file) => {
    console.log('start uploading');
  },
});

module.exports = new Router({ prefix: '/splitter' })
  .post('/', multer({ storage: storageConfig }).single('music'), actions.postSplitMusic);
