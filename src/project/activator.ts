import { activateTestRunner } from "./cli-cmds/test";
import { activateBuildCommand } from "./cli-cmds/build";
import { activateCloudCommand } from "./cli-cmds/cloud";
import { activateRunCommand } from "./cli-cmds/run";
import { activateDocCommand } from "./cli-cmds/doc";
import { activateAddCommand } from "./cli-cmds/add";

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
}
