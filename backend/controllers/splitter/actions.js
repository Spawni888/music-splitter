const { execFile } = require('child_process');
const fs = require('fs');
// const path = require('path');

const postSplitMusic = async (ctx) => {
  console.log(ctx.request.file.path);

  // // create a read stream
  // const readable = fs.createReadStream(ctx.request.file.path);
  // ctx.body = readable;

  ctx.body = 'Backend up';
};

module.exports = {
  postSplitMusic,
};
