/* eslint-disable */
import { ChildProcess, spawn } from 'child_process';
// import { MongoMemoryReplSet } from 'mongodb-memory-server';
import readline from "readline";
import 'dotenv/config'

function prompt(message: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(message, resolve));
}

function waitForLoadLine(ps: ChildProcess, loadLine: string) {
  return new Promise<void>((resolve, reject) => {
    ps.stdout!.on('data', (data) => {
      if (data.includes(loadLine)) {
        console.log('API server is ready');
        resolve();
      }
    });
  });
}

module.exports = async function () {
  // TODO: Automate these tasks that currently have to be done manually
  await prompt('Remember to build docker images and user-api sdk, start up compose, update ID token, and then press any key to continue...');

  /* Initiate mongo memory server

  console.log('\nInitiating mongo memory server...\n');

  const instance = await MongoMemoryReplSet.create({
    binary: { version: '6.0.5' },
  });

  const uri = instance.getUri();
  global['__MONGOINSTANCE'] = instance;
  process.env.E2E_MONGO_URI = uri;
  */
  
  /* Initiate docker compose

  console.log('\nInitiating docker compose...\n');

  const ps = spawn('docker', ['compose', 'up']);
  globalThis.serverProcess = ps;

  waitForLoadLine(ps, 'Application is running');
  */

  process.env.E2E_API_URI = "localhost:3000"

  console.log('\nInitiating tests...\n');
};
