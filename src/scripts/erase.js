import chalk from 'chalk';
import inquirer from 'inquirer';
import getAndRemoveFlag from '../utils/getAndRemoveFlag.js';
import runCommand from '../utils/runCommand.js';
import {
    getBranches,
    getUserName,
    branchDataAsObjects,
    formatOptions,
    getSelectedBranches,
} from '../utils/utils.js';

export default async function (args, dryRun) {
    const all = getAndRemoveFlag(args, '--all', '-a').flag;
    const onlyGone = getAndRemoveFlag(args, '--gone', '-g').flag;
    try {
        await runCommand('git remote prune origin', dryRun);
    } catch {
        console.log(
            chalk.redBright(
                'Could not prune origin. Some of the tracking info might not be up to date.'
            )
        );
    }
    const refs = await getBranches({ sort: '-committerdate' });
    let branchData = branchDataAsObjects(refs);
    if (onlyGone) {
        branchData = branchData.filter(({ remote }) => remote === 'Gone');
    }
    if (branchData.length === 0) {
        console.log('No branches to delete');
        process.exit();
    }
    const userName = await getUserName();

    const options = branchData.filter(({ branchname }) => {
        if (branchname === 'master' || branchname === 'main') {
            return false;
        }

        return true;
    });
    const { formattedHeader, formattedChoices } = formatOptions(options, 1);

    const selectedRef = await inquirer.prompt({
        type: 'checkbox',
        name: 'target',
        message: formattedHeader,
        choices: formattedChoices,
        pageSize: 10,
        loop: false,
    });

    const branchesToDelete = getSelectedBranches(options, selectedRef.target);

    // sanity check
    if (branchesToDelete.includes('master') || branchesToDelete.includes('main')) {
        console.error('master or main branches in branches to delete.');
        process.exit(1);
    }

    const result = {
        localSuccessCount: 0,
        remoteSuccessCount: 0,
        statuses: {},
        handleDeleteResponse(branch, responseLocal, responseRemote) {
            this.statuses[branch] = {
                Local: responseLocal === 'success' ? 'SUCCESS' : responseLocal,
            };
            if (!responseRemote) return;

            this.statuses[branch].Remote =
                responseRemote === 'success' ? 'SUCCESS' : responseRemote;
        },
    };

    const deleteBranch = async (branchObject, all) => {
        const { branchname, remote } = branchObject;
        let localDelete;
        try {
            await runCommand(`git branch -D ${branchname}`, dryRun);
            localDelete = 'success';
        } catch (e) {
            localDelete = e.stderr.split('\n')[0];
        }
        let remoteDelete;
        if (all && remote === 'Tracked') {
            try {
                await runCommand(`git push origin --delete ${branchname};`, dryRun);
                remoteDelete = 'success';
            } catch (e) {
                remoteDelete = e.stderr.split('\n')[0];
            }
        }
        result.handleDeleteResponse(branchname, localDelete, remoteDelete);
    };

    await Promise.all(branchesToDelete.map((branch) => deleteBranch(branch, all)));

    console.table(result.statuses);
}
