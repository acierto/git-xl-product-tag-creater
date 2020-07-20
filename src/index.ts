import path from 'path';
import {exec} from 'child_process';

const getFolderName = () => path.basename(process.cwd());

const getVersion = () => {
    const {argv} = process;
    const version = argv[2];

    if (!version) {
        throw 'Version is not specified. You have to specify a version name after a command delimited by a space.' +
        'I.e. git-xl-product-tag-creater v9.7.0';
    }
    return version;
}

const getNewTagVersion = () => {
    const version = getVersion();
    const tagVersionPart = version.slice(version.search(/\d/));
    return `${getFolderName()}-${tagVersionPart}`;
};

const executeCommand = (command: string) =>
    new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            console.log(`Executing: ${command}`);

            if (error) {
                console.log(`error: ${error.message}`);
                resolve(error);
            } else if (stderr) {
                console.log(`stderr: ${stderr}`);
                resolve(stderr);
            } else {
                resolve(stdout);
            }
        });
    });

const checkIfTagExists = async (newTagVersion: string) => {
    const result = await executeCommand(`git tag -l ${newTagVersion}`);
    return '' !== result;
}

const createTag = async (newTagVersion: string) => {
    if (await checkIfTagExists(newTagVersion)) {
        console.log(`Skipping the creation of the tag ${newTagVersion} as it is already exist`);
        return;
    }

    await executeCommand(`git tag ${newTagVersion}`);
    await executeCommand(`git push origin ${newTagVersion}`);
}

(async () => {
    await executeCommand('git fetch --prune');

    const newTagVersion = getNewTagVersion();
    if (!await checkIfTagExists(getVersion())) {
        console.log(`Skipping creation of new tag due to missing tag ${getVersion()} in ${getFolderName()}. It's not
        necessary a problem as this project could be not released before.`);
        return;
    }

    await executeCommand(`git checkout ${getVersion()}`);
    await createTag(newTagVersion);
})();
