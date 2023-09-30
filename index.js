#! /usr/bin/env node

import chalk from 'chalk';
import getAndRemoveFlag from './src/utils/getAndRemoveFlag.js';

// Exit program on `q` key press
// --------------------------------------

process.stdin.setEncoding('utf-8');

process.stdin.on('data', (data) => {
    const input = data.toString().trim(); // Convert buffer to string and remove whitespace.
    if (input === 'q') {
        process.exit();
    }
});

// Put the standard input into "raw" mode, so keys are read as they are pressed.
process.stdin.setRawMode(true);

// Resume standard input to start receiving "data" events.
process.stdin.resume();

// --------------------------------------
// --------------------------------------

let [, , command, ...args] = process.argv;

const script = await import(`./src/scripts/${command}.js`);
try {
    console.clear();
    const dryRun = getAndRemoveFlag(args, '--ngit-dry-run').flag;
    args = getAndRemoveFlag(args, '--ngit-dry-run').args;

    await script.default(args, dryRun);
} catch (error) {
    console.log(chalk.bgRed('Exited with error'), error.stderr);
}
