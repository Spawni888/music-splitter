const fileNameRegExp = /(.+\/)?(.+)\.(.+$)/gi;

module.exports = (filePath) => {
  const match = [...filePath.matchAll(fileNameRegExp)][0];
  const absPathToFile = match[1];
  const filename = match[2];
  const fileExtension = match[3];

  return {
    absPathToFile,
    filename,
    fileExtension,
  };
};
