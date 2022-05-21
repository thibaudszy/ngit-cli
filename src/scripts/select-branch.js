import clipboard from 'clipboardy';
import { getBranches, branchDataAsObjects } from '../utils/utils.js';
import { branchSelect } from '../utils/promptBranchSelect.js';

export default async function () {
    const refs = await getBranches({ sort: '-committerdate' });
    const options = branchDataAsObjects(refs);
    const selection = await branchSelect(options);

    console.log('Copied to clipboard:', selection);
    clipboard.writeSync(selection);
}
