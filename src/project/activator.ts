import { activateTestRunner } from "./cmds/test";
import { activateBuildCommand } from "./cmds/build";
import { activateCloudCommand } from "./cmds/cloud";
import { activateRunCommand } from "./cmds/run";
import { activateDocCommand } from "./cmds/doc";
import { activateAddCommand } from "./cmds/add";
import { activatePasteJsonAsRecord } from "./cmds/json-to-record";

export * from "./cmds/cmd-runner";

export function activate() {
    // activate ballerina test command
    activateTestRunner();

    // activate ballerina build command
    activateBuildCommand();

    // activate ballerina run command
    activateRunCommand();

    // activate ballerina doc command
    activateDocCommand();

    // activate the create Cloud.toml command
    activateCloudCommand();

    // activate the add module command
    activateAddCommand();

    // activate the pasteJsonAsRecord command
    activatePasteJsonAsRecord();
}
