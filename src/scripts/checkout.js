import getAndRemoveFlag from '../utils/getAndRemoveFlag.js';
import { branchSelect } from '../utils/promptBranchSelect.js';
import runCommand from '../utils/runCommand.js';
import { shellEscape, shellEscapeArgs } from '../utils/shellEscape.js';
import { getBranches, branchDataAsObjects } from '../utils/utils.js';

export default async function (args, dryRun) {
    // Mutating the arguments to evaluate what needs to be passed down to the git command
    const onlyUserBranches = getAndRemoveFlag(args, '--my', '-m').flag;
    args = getAndRemoveFlag(args, '--my', '-m').args;

    if (args?.length > 0) {
        try {
            await runCommand(`git checkout ${shellEscapeArgs(args)}`, dryRun);
            process.exit();
        } catch {
            process.exit(1);
        }
    }

    const refs = await getBranches({ sort: '-committerdate' });
    const branchData = branchDataAsObjects(refs);

    const options = branchData.filter(({ branchname }) => {
        if (!onlyUserBranches) return true;
        if (branchname === 'master' || branchname === 'main') {
            return false;
        }

        return true;
    });
    const selection = await branchSelect(options);

    await runCommand(`git checkout ${shellEscape(selection)}`, dryRun);
}
