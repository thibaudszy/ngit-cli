import { execSync } from 'child_process';

export default async function () {
    const states = {
        ' ': 'unmodified',
        M: 'modified',
        T: 'file type changed',
        A: 'added',
        D: 'deleted',
        R: 'renamed',
        C: 'copied',
        U: 'updated but unmerged',
        '?': 'untracked',
    };

    const gitStatus = await execSync('git status --porcelain', { encoding: 'utf-8' });
    if (!gitStatus) return null;
    // The last element of the array is an empty string
    const gitStatusArray = gitStatus.split('\n');
    gitStatusArray.pop();
    return gitStatusArray.map((fileStatus) => ({
        index: states[fileStatus[0]],
        workingTree: states[fileStatus[1]],
        file: fileStatus.slice(3),
    }));
}
