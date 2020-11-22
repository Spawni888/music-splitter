const Router = require('koa-router');
const multer = require('@koa/multer');
const path = require('path');
const actions = require('./actions');

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(`${__dirname}/../../../frontend/public/uploaded/`));
  },
  filename: (req, file, cb) => {
    const match = [...file.originalname.matchAll(/(.+)\.(.+$)/gi)][0];
    const filename = match[1];
    const extension = match[2];

    cb(null, `${filename}-${Date.now()}.${extension}`);
  },
});

module.exports = new Router({ prefix: '/splitter' })
  .post('/', multer({ storage: storageConfig }).single('music'), actions.postSplitMusic);
