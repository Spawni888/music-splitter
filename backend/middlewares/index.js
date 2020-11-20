const testMW = async (ctx, next) => {
  console.log('middlewares are working!');
  return next();
};

module.exports = {
  testMW,
};
