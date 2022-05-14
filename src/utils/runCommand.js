import { execSync } from 'child_process';

export default async function (command, dryRun) {
    if (dryRun) {
        console.log(command);
    } else {
        await execSync(command, { encoding: 'utf-8' });
    }
}
