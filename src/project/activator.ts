/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { activateTestRunner } from "./cmds/test";
import { activateBuildCommand } from "./cmds/build";
import { activateCloudCommand } from "./cmds/cloud";
import { activateRunCommand } from "./cmds/run";
import { activateDocCommand } from "./cmds/doc";
import { activateAddCommand } from "./cmds/add";
import { activatePasteJsonAsRecord } from "./cmds/json-to-record";
import { activatePackCommand } from "./cmds/pack";

export * from "./cmds/cmd-runner";

export function activate() {
    // activate ballerina test command
    activateTestRunner();

    // activate ballerina build command
    activateBuildCommand();

    // activate ballerina pack command
    activatePackCommand();

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
