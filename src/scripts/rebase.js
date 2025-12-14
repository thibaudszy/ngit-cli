import getAndRemoveFlag from '../utils/getAndRemoveFlag.js';
import { branchSelect } from '../utils/promptBranchSelect.js';
import runCommand from '../utils/runCommand.js';
import { getBranches, branchDataAsObjects } from '../utils/utils.js';

export default async function (args, dryRun) {
    const interactive = getAndRemoveFlag(args, '--interactive', '-i').flag;
    args = getAndRemoveFlag(args, '--interactive', '-i').args;

    // If args provided, pass through to git rebase
    if (args?.length > 0) {
        const interactiveFlag = interactive ? '-i ' : '';
        try {
            await runCommand(`git rebase ${interactiveFlag}${args.join(' ')}`, dryRun);
            process.exit();
        } catch {
            process.exit(1);
        }
    }

    const refs = await getBranches({ sort: '-committerdate' });
    const branchData = branchDataAsObjects(refs);

    if (branchData.length === 0) {
        console.log('No branches available.');
        process.exit();
    }

    const selection = await branchSelect(branchData);
    const interactiveFlag = interactive ? '-i ' : '';

    await runCommand(`git rebase ${interactiveFlag}${selection}`, dryRun);
}
