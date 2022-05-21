#! /usr/bin/env node

import chalk from 'chalk';
import getAndRemoveFlag from './src/utils/getAndRemoveFlag.js';

let [, , command, ...args] = process.argv;

const script = await import(`./src/scripts/${command}.js`);
try {
    const dryRun = getAndRemoveFlag(args, '--ngit-dry-run').flag;
    args = getAndRemoveFlag(args, '--ngit-dry-run').args;

    await script.default(args, dryRun);
} catch (error) {
    console.log(error);
    console.log(chalk.bgRed('Exited with error'));
}