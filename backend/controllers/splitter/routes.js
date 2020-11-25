const Router = require('koa-router');
const multer = require('@koa/multer');
const path = require('path');
const crypto = require('crypto');
// const fs = require('fs');
const actions = require('./actions');

const fileNameRegExp = /(.+)\.(.+$)/gi;

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(`${__dirname}/../../../frontend/public/music/`));
  },
  filename: (req, file, cb) => {
    const match = [...file.originalname.matchAll(fileNameRegExp)][0];
    const filename = match[1];
    const extension = match[2];
    const hashName = crypto.createHash('sha256')
      .digest('hex');

    cb(null, `${filename}-${hashName}.${extension}`);
  },
});

module.exports = new Router({ prefix: '/splitter' })
  .post('/', multer({ storage: storageConfig }).single('music'), actions.postSplitMusic);
