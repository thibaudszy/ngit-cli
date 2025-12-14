import { execSync } from 'child_process';
import { branchSelect } from '../utils/promptBranchSelect.js';
import runCommand from '../utils/runCommand.js';
import { getBranches, branchDataAsObjects } from '../utils/utils.js';

function getCurrentBranch() {
    return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
}

export default async function (args, dryRun) {
    // If args provided, pass through to git rebase
    if (args?.length > 0) {
        try {
            await runCommand(`git rebase ${args.join(' ')}`, dryRun);
            process.exit();
        } catch {
            process.exit(1);
        }
    }

    const currentBranch = getCurrentBranch();
    const refs = await getBranches({ sort: '-committerdate' });
    const branchData = branchDataAsObjects(refs).filter(
        ({ branchname }) => branchname !== currentBranch
    );

    if (branchData.length === 0) {
        console.log('No other branches available to rebase onto.');
        process.exit();
    }

    const selection = await branchSelect(branchData);

    await runCommand(`git rebase ${selection}`, dryRun);
}
