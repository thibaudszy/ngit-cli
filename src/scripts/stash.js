import chalk from 'chalk';
import inquirer from 'inquirer';
import parsedGitStatus from '../utils/parsedGitStatus.js';
import runCommand from '../utils/runCommand.js';
import { shellEscapeArgs } from '../utils/shellEscape.js';

export default async function (args, dryRun) {
    const gitStatusJson = await parsedGitStatus();
    if (gitStatusJson === null) {
        console.log('Working tree clean, nothing to commit.');
        return;
    }

    const isModified = (gitState) => gitState !== 'unmodified';
    const isRenamedOrCopied = (gitState) => gitState === 'renamed' || gitState === 'copied';

    // Renamed/copied files cannot be partially stashed with pathspecs
    const renamedFiles = gitStatusJson.filter(
        ({ index }) => isRenamedOrCopied(index)
    );

    // If there are renames, offer to stash all first
    if (renamedFiles.length > 0) {
        console.log(chalk.yellow('Renamed/copied files detected (cannot be selectively stashed):'));
        renamedFiles.forEach(({ renamedFrom, file }) => {
            console.log(chalk.yellow(`  ${renamedFrom} -> ${file}`));
        });
        console.log();

        const { stashAll } = await inquirer.prompt({
            type: 'confirm',
            name: 'stashAll',
            message: 'Stash all changes (including renames)?',
            default: true,
        });

        if (stashAll) {
            const escapedArgs = args.length > 0 ? ' ' + shellEscapeArgs(args) : '';
            await runCommand(`git stash push${escapedArgs}`, dryRun);
            return;
        }
    }

    const stagedFiles = gitStatusJson
        .filter(({ index }) => isModified(index) && index !== 'untracked' && !isRenamedOrCopied(index))
        .map(({ file }) => file);

    const trackedFiles = gitStatusJson
        .filter(({ workingTree, index }) => isModified(workingTree) && index !== 'untracked')
        .map(({ file }) => file);

    const untrackedFiles = gitStatusJson
        .filter(({ index }) => index === 'untracked')
        .map(({ file }) => file);

    const hasStashableFiles = stagedFiles.length > 0 || trackedFiles.length > 0 || untrackedFiles.length > 0;
    if (!hasStashableFiles) {
        console.log('No other files available to stash selectively.');
        return;
    }

    const choices = [
        new inquirer.Separator('Staged files: -----'),
        ...stagedFiles,
        new inquirer.Separator('Tracked files: -----'),
        ...trackedFiles,
        new inquirer.Separator('Untracked files: -----'),
        ...untrackedFiles,
    ];

    const selectedFiles = await inquirer.prompt({
        type: 'checkbox',
        name: 'target',
        message: 'Choose files to stash',
        choices,
        pageSize: 10,
        loop: false,
    });

    if (selectedFiles.target.length === 0) {
        console.log('No files selected.');
        return;
    }

    const escapedArgs = args.length > 0 ? shellEscapeArgs(args) + ' ' : '';
    const escapedFiles = shellEscapeArgs(selectedFiles.target);
    await runCommand(`git stash push ${escapedArgs}-- ${escapedFiles}`, dryRun);
}
