/* eslint-disable */

import { MongoMemoryReplSet } from 'mongodb-memory-server';

module.exports = function () {
  // console.log('\nTearing down...\n');
  // const ps = globalThis.serverProcess;
  // return new Promise<void>(async (resolve, reject) => {
  //   const instance: MongoMemoryReplSet = global['__MONGOINSTANCE'];
  //   await instance.stop();
  //   ps.on('exit', (code, signal) => {
  //     console.log('Exit');
  //     resolve();
  //   });
  //   ps.kill();
  // });
};
