// eslint-disable-next-line max-classes-per-file
const { EventEmitter } = require('events');

class EventWrapper extends EventEmitter {
  constructor(cb) {
    super();
    this.cb = cb;
  }

  execute() {
    (async () => {
      try {
        const res = await this.cb();
        this.emit('executed', res);
      } catch (err) {
        this.emit('error', err);
      }
    })();
  }
}

module.exports = class PromiseQueue {
  constructor({ threads }) {
    this.queue = [];
    this.threads = threads;
    this.inProgress = [];
  }

  add(cb) {
    cb = new EventWrapper(cb);
    this.queue.push(cb);

    this.updateQueue();

    return this.wrapInPromise(cb);
  }

  updateQueue() {
    if (this.queue.length && this.inProgress.length < this.threads) {
      const cb = this.queue.shift();

      this.inProgress.push(cb);
      this.executeCb(cb);
    }
  }

  executeCb(cb) {
    cb.execute();
    cb.on('executed', () => {
      this.filterQueue(cb);
    });
    cb.on('error', () => {
      this.filterQueue(cb);
    });
  }

  filterQueue(cb) {
    this.inProgress = this.inProgress.filter(_cb => _cb !== cb) || [];
    this.updateQueue();
  }

  wrapInPromise(cb) {
    return new Promise((resolve, reject) => {
      cb.on('executed', resolve);
      cb.on('error', reject);
    });
  }
};
