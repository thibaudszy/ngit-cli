import { execSync } from 'child_process';

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

export function parseGitStatusOutput(gitStatus) {
    if (!gitStatus) return null;
    // The last element of the array is an empty string
    const gitStatusArray = gitStatus.split('\n');
    gitStatusArray.pop();
    return gitStatusArray.map((fileStatus) => {
        const index = states[fileStatus[0]];
        const workingTree = states[fileStatus[1]];
        let file = fileStatus.slice(3);

        // For renamed/copied files, format is "old_name -> new_name"
        // Extract the new name for use in git commands
        if (index === 'renamed' || index === 'copied') {
            const arrowIndex = file.indexOf(' -> ');
            if (arrowIndex !== -1) {
                file = file.slice(arrowIndex + 4);
            }
        }

        return { index, workingTree, file };
    });
}

export default async function () {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
    return parseGitStatusOutput(gitStatus);
}
