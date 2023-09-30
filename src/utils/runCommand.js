import { execSync } from 'child_process';

const goToGitRootCommand = 'cd $(git rev-parse --show-toplevel)';

export default async function (command, dryRun) {
    const fullCommand = `${goToGitRootCommand} && ${command}`;
    if (dryRun) {
        console.log(fullCommand);
    } else {
        execSync(fullCommand, { encoding: 'utf-8' });
    }
}
