import inquirer from 'inquirer';
import { execSync } from 'child_process';
import getAndRemoveFlag from '../utils/getAndRemoveFlag.js';
import runCommand from '../utils/runCommand.js';
import {
    getBranches,
    getUserName,
    formatOptions,
    addColor,
    branchDataAsObjects,
    getBranchFromOption,
} from '../utils/utils.js';
import chalk from 'chalk';

export default async function (args, dryRun) {
    // Mutating the arguments to evaluate what needs to be passed down to the git command
    const onlyUserBranches = getAndRemoveFlag(args, '--my', '-m').flag;
    args = getAndRemoveFlag(args, '--my', '-m').args;

    if (args?.length > 0) {
        try {
            await runCommand(`git checkout ${args.join(' ')}`, dryRun);
            process.exit();
        } catch {
            process.exit(1);
        }
    }

    const refs = await getBranches({ sort: '-committerdate' });
    const branchData = branchDataAsObjects(refs);
    const userName = await getUserName();

    const options = branchData.filter(({ branchname }) => {
        if (!onlyUserBranches) return true;
        if (branchname === 'master' || branchname === 'main') {
            return false;
        }

        return true;
    });
    const { formattedHeader, formattedChoices } = formatOptions(options);

    const selectedRef = await inquirer.prompt({
        type: 'list',
        name: 'target',
        message: formattedHeader,
        choices: formattedChoices,
        pageSize: 10,
        loop: false,
    });

    await runCommand(`git checkout ${getBranchFromOption(selectedRef.target)}`, dryRun);
}
