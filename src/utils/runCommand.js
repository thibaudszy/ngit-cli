import { execSync } from 'child_process';

function getGitRoot() {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
}

export default async function (command, dryRun) {
    const gitRoot = getGitRoot();
    if (dryRun) {
        console.log(`[cwd: ${gitRoot}] ${command}`);
    } else {
        execSync(command, { encoding: 'utf-8', cwd: gitRoot });
    }
}
