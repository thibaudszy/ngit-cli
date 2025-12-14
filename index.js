#!/usr/bin/env node
/* eslint-disable -- eslint can't parse top level imports yet */
import chalk from 'chalk';
import inquirer from 'inquirer';
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

const commands = [
    { name: 'add', description: 'Stage files interactively' },
    { name: 'checkout', description: 'Switch branches interactively' },
    { name: 'erase', description: 'Delete branches interactively' },
    { name: 'rebase', description: 'Rebase onto a branch interactively' },
    { name: 'stash', description: 'Stash changes interactively' },
    { name: 'select-branch', description: 'Copy branch names to clipboard' },
    { name: 'select-status', description: 'Copy file names to clipboard' },
];

let [, , command, ...args] = process.argv;

async function selectCommand() {
    const { selected } = await inquirer.prompt({
        type: 'list',
        name: 'selected',
        message: 'Select a command',
        choices: commands.map(({ name, description }) => ({
            name: `${name} - ${description}`,
            value: name,
        })),
        pageSize: 10,
    });
    return selected;
}

const validCommands = commands.map(c => c.name);

if (!command) {
    command = await selectCommand();
} else if (!validCommands.includes(command)) {
    console.log(chalk.bgRed(`Unknown command: ${command}`));
    console.log('Available commands:', validCommands.join(', '));
    process.exit(1);
}

try {
    const script = await import(`./src/scripts/${command}.js`);
    console.clear();
    const dryRun = getAndRemoveFlag(args, '--ngit-dry-run').flag;
    args = getAndRemoveFlag(args, '--ngit-dry-run').args;

    await script.default(args, dryRun);
} catch (error) {
    console.log(chalk.bgRed('Exited with error'), error.stderr || error.message || error);
}
