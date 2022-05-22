import { formatOptions, getBranchFromIndexedOptions } from '../utils/utils.js';
import inquirer from 'inquirer';

export async function branchSelect(options, branchNameOnly = true) {
    const indexedOptions = options.map((branchData, index) => ({
        ...branchData,
        index: index.toString(),
    }));
    const { formattedHeader, formattedChoices } = formatOptions(indexedOptions);

    const selection = await inquirer.prompt({
        type: 'list',
        name: 'target',
        message: formattedHeader,
        choices: formattedChoices,
        pageSize: 10,
        loop: false,
    });
    const branchObject = getBranchFromIndexedOptions(indexedOptions, selection.target);
    return branchNameOnly ? branchObject.branchname : branchObject;
}

export async function branchMultiSelect(options, branchNameOnly = true) {
    const indexedOptions = options.map((branchData, index) => ({
        ...branchData,
        index: index.toString(),
    }));
    const { formattedHeader, formattedChoices } = formatOptions(indexedOptions, 1);

    const selection = await inquirer.prompt({
        type: 'checkbox',
        name: 'target',
        message: formattedHeader,
        choices: formattedChoices,
        pageSize: 10,
        loop: false,
    });

    const getBranch = (selectedOption) =>
        getBranchFromIndexedOptions(indexedOptions, selectedOption);

    const selectedBranches = selection.target.map(getBranch);

    return branchNameOnly ? selectedBranches.map(({ branchname }) => branchname) : selectedBranches;
}
