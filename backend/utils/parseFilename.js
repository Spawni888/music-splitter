const fileNameRegExp = /(.+\/)?(.+)\.(.+$)/gi;

module.exports = (filePath) => {
  try {
    console.log(filePath);
    const match = [...filePath.matchAll(fileNameRegExp)][0];
    const [, destination, filename, fileExtension] = match;

    return {
      destination,
      filename,
      fileExtension,
    };
  }
  catch (err) {
    console.log(err);
  }
};
