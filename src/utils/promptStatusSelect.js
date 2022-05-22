import chalk from 'chalk';
import inquirer from 'inquirer';
import parsedGitStatus from '../utils/parsedGitStatus.js';

export default async function () {
    const gitStatusJson = await parsedGitStatus();
    if (gitStatusJson === null) {
        console.log('Working tree clean, nothing to commit.');
        return;
    }
    const isModified = (gitState) => gitState !== 'unmodified';
    const getFile = (gitFileState) => gitFileState.file;

    const stagedFiles = gitStatusJson.filter(
        ({ index }) => isModified(index) && index !== 'untracked'
    );
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
    console.log(`Files already staged:`);
    for (let fileStatus of stagedFiles) {
        console.log(chalk.greenBright(fileStatus.index), getFile(fileStatus));
    }
    console.log('-------------');
    const selectedFiles = await inquirer.prompt({
        type: 'checkbox',
        name: 'target',
        message: 'Choose files to copy to your clipboard',
        choices,
        pageSize: 10,
        loop: false,
    });

    return selectedFiles.target;
}
