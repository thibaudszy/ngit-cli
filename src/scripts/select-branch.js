import clipboard from 'clipboardy';
import { getBranches, branchDataAsObjects } from '../utils/utils.js';
import { branchMultiSelect } from '../utils/promptBranchSelect.js';
import chalk from 'chalk';

export default async function () {
    const refs = await getBranches({ sort: '-committerdate' });
    const options = branchDataAsObjects(refs);
    const selection = await branchMultiSelect(options);

    const inlinedSelection = selection.join(' ');
    console.log(chalk.bold(chalk.blueBright('Copied to clipboard:')), inlinedSelection);
    clipboard.writeSync(inlinedSelection);
}
