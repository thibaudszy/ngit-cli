import clipboard from 'clipboardy';
import promptStatusSelect from '../utils/promptStatusSelect.js';

export default async function () {
    const selection = await promptStatusSelect();

    const selectionToCopy = selection.join(' ');
    console.log('Copied to clipboard:', selectionToCopy);
    clipboard.writeSync(selectionToCopy);
}
