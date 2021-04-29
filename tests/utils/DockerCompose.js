/**
  *   Do not remove or alter the notices in this preamble.
  *   This software code regards ISAAC Standard Software.
  *   Copyright © 2021 ISAAC and/or its affiliates.
  *   www.isaac.nl All rights reserved. License grant and user rights and obligations
  *   according to applicable license agreement. Please contact sales@isaac.nl for
  *   questions regarding license and user rights.
  */

var spawn = require('child_process').spawn
const exec = require('child_process').exec;

let dirname = null;

function execAsync(cmd) {
    return new Promise((resolve) => {
        exec(cmd, err => {
            resolve();
        });
    });
}

async function dockerKill() {
    await execAsync(`cd ${dirname} && docker-compose kill`);
}

function dockerUp(readyText) {

    process.on('SIGINT', dockerKill);

    return new Promise(async (res) => {
        await execAsync(`cd ${dirname} && docker-compose down`);
        await execAsync(`cd ${dirname} && docker-compose rm`);

        const cmd = spawn('docker-compose', ['up'], { cwd: dirname });
        cmd.stdout.on('data', function (data) {
            if (data.toString().includes(readyText)) {
                res();
            }
        });
    })
}

module.exports = (_dirname) => {
    dirname = _dirname
    return { dockerKill, dockerUp }
}
