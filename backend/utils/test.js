const Queue = require('./queue');

const testFn = (arg) => new Promise(resolve => setTimeout(() => resolve(arg), 5000));
const queue = new Queue({ threads: 2 });

queue.add(() => testFn(1));
setTimeout(() => {
  queue.add(() => testFn(2));
  queue.add(() => testFn(3));
  queue.add(() => testFn(4));
  queue.add(() => testFn(5));
  queue.add(() => testFn(6));
}, 1000);
