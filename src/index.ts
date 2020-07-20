import path from 'path';
import {exec} from 'child_process';

const getNewTagVersion = () => {
    const cwd = process.cwd();
    const folderName = path.basename(cwd);
    const {argv} = process;
    const version = argv[2];

    if (!version) {
        throw 'Version is not specified. You have to specify a version name after a command delimited by a space.' +
        'I.e. git-xl-product-tag-creater v9.7.0';
    }

    const tagVersionPart = version.slice(version.search(/\d/));
    return `${folderName}-${tagVersionPart}`;
};

const executeCommand = (command: string) => {
    exec(command, (error, stdout, stderr) => {
        console.log(`Executing: ${command}`);

        if (error) {
            console.log(`error: ${error.message}`);
        } else if (stderr) {
            console.log(`stderr: ${stderr}`);
        }
    });
};

const createTag = (newTagVersion: string) => {
    executeCommand(`git tag ${newTagVersion}`);
    executeCommand(`git push origin ${newTagVersion}`);
}

(() => {
    const newTagVersion = getNewTagVersion();
    createTag(newTagVersion);
})();
