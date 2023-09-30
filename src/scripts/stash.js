import inquirer from 'inquirer';
import parsedGitStatus from '../utils/parsedGitStatus.js';
import runCommand from '../utils/runCommand.js';

export default async function (args, dryRun) {
    const gitStatusJson = await parsedGitStatus();
    if (gitStatusJson === null) {
        console.log('Working tree clean, nothing to commit.');
        return;
    }

    const isModified = (gitState) => gitState !== 'unmodified';
    const getFile = (gitFileState) => gitFileState.file;

    const stagedFiles = gitStatusJson
        .filter(({ index }) => isModified(index) && index !== 'untracked')
        .map(getFile);

    const trackedFiles = gitStatusJson
        .filter(({ workingTree, index }) => isModified(workingTree) && index !== 'untracked')
        .map(getFile);

    const untrackedFiles = gitStatusJson.filter(({ index }) => index === 'untracked').map(getFile);

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

    await runCommand(`git stash push ${args.join(' ')} ${selectedFiles.target.join(' ')}`, dryRun);
}
