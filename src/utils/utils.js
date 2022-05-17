import { execSync } from 'child_process';
import chalk from 'chalk';

export const getBranches = async ({ sort }) => {
    const refsGitCommand = `git branch --sort=${sort} --format='\
          authordate --> %(authordate:relative) |\
          committerdate --> %(committerdate:relative) |\
          branchname --> %(refname:short) |\
          remote --> %(push:track,nobracket)|\
          remotename --> %(upstream:remoteref)'`;

    return execSync(refsGitCommand, { encoding: 'utf-8' }).trim();
};
export const getBranchFromOption = (option) => option.split('|')[3].trim();

export const getSelectedBranches = (branchArray, selected) => {
    const selectedBranches = selected.map(getBranchFromOption);
    return branchArray.filter(({ branchname }) => selectedBranches.includes(branchname));
};

export const getUserName = async () =>{
    try{
        return (await execSync('git config user.name', { encoding: 'utf-8' })).trim();
    } catch {
        console.log(chalk.red("Error while trying to access your git username. Please add your username in your .gitconfig file (https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)."));
        process.exit(1);
    }
}

export const branchDataAsObjects = (gitBranchOutput) => {
    const branchData = gitBranchOutput
        .split('\n')
        .map((refData) => refData.split('|').map((str) => str.trim()));

    return branchData.map((branch, index) => {
        const dataObject = Object.fromEntries(
            branch.map((param) => param.split('-->').map((str) => str.trim()))
        );
        if (dataObject.remote === 'gone') dataObject.remote = 'Gone';
        else {
            const branchParam = dataObject.remotename?.split('refs/heads/')[1];
            dataObject.remote = branchParam ? 'Tracked' : 'None';
        }
        return {...dataObject, index};
    });
};

function calculateColumnsWidths(branchData) {
    /**
     *  Calculates the length of every key in the branch objects within the array of branches
     */

    const lengthsOfKeys = [...branchData].map((branch) => {
        const propertiesLength = {};
        for (let key in branch) {
            propertiesLength[key] = branch[key].length;
        }
        return propertiesLength;
    });

    /**
     *  Reduces the previous array to the max width of every key
     */
    return lengthsOfKeys.reduce((acc, branch) => {
        for (let key in branch) {
            if (!acc[key]) acc[key] = 0;
            if (branch[key] > acc[key]) {
                acc[key] = branch[key];
            }
        }
        return acc;
    }, {});
}

export const formatOptions = (dataObject, headerOffset = 0) => {
    const branchData = Object.values(dataObject);
    const headerOffsetPadding = new Array(headerOffset).fill(' ').join('');
    const header = {
        index: 'index',
        authordate: `Created`,
        committerdate: 'Last commit',
        remote: 'Remote',
        branchname: 'Branch',
    };

    const maxWidths = calculateColumnsWidths([header, ...branchData]);

    /**
     * Returns the branch object with padded values so columns are the same width
     * @param branchObject
     * @param maxWidths
     * @returns {*}
     */
    const pad = (branchObject, maxWidths) => {
        const result = { ...branchObject };
        for (let key in branchObject) {
            const padding = maxWidths[key] - branchObject[key].length;
            if (padding > 0) {
                result[key] = branchObject[key] + new Array(padding).fill(' ').join('');
            }
        }
        return result;
    };

    const formattedChoices = branchData.map((branch) => {
        return addColor(pad(branch, maxWidths)).join(' | ');
    });

    const formattedHeader = headerOffsetPadding + addColor(pad(header, maxWidths)).join(' | ');
    return { formattedHeader, formattedChoices };
};

export const addColor = (paddedBranchData) => {
    const { authordate, committerdate, remote, branchname } = paddedBranchData;
    const { yellow, red, green } = chalk;
    const remoteColor = {
        Remote: green, // for header
        Tracked: green,
        Gone: red,
    };
    const coloredRemote = remoteColor[remote.trim()] ? remoteColor[remote.trim()](remote) : remote;
    return [chalk.rgb(0, 179, 255)(authordate), yellow(committerdate), coloredRemote, branchname];
};
