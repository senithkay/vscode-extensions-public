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

import { BallerinaProject } from "../../core/extended-language-client";
import { Terminal, window } from "vscode";
import { isWindows } from "../../utils";

export enum PALETTE_COMMANDS {
    ADD = 'ballerina.project.add',
    BUILD = 'ballerina.project.build',
    CLOUD = 'ballerina.create.cloud',
    DOC = 'ballerina.project.doc',
    FOCUS_OVERVIEW = 'ballerinaPackageTreeView.focus',
    RUN = 'ballerina.project.run',
    RUNICON = 'ballerina.project.run-icon',
    SAVE_ALL = 'workbench.action.files.saveFiles',
    TEST = 'ballerina.project.test',
    PASTE_JSON_AS_RECORD = 'ballerina.pasteAsRecord'
}

export enum BALLERINA_COMMANDS {
    TEST = "test", BUILD = "build", FORMAT = "format", RUN = "run", DOC = "doc", ADD = "add", OTHER = "other"
}

export enum PROJECT_TYPE {
    SINGLE_FILE = "SINGLE_FILE_PROJECT", BUILD_PROJECT = "BUILD_PROJECT", BALR_PROJECT = "BALR_PROJECT"
}

export enum COMMAND_OPTIONS {
    ALL = "--all"
}

export enum MESSAGES {
    NOT_SUPPORT = "Ballerina version is not supported by the VSCode plugin.",
    MODULE_NAME = "Enter module name.",
    SELECT_OPTION = "Select a build option.",
    NOT_IN_PROJECT = "Current file does not belong to a ballerina project.",
    INVALID_JSON = "Invalid JSON String"
}

export const BAL_TOML = "Ballerina.toml";
const TERMINAL_NAME = 'Terminal';

let terminal: Terminal;
export function runCommand(file: BallerinaProject | string, executor: string, cmd: BALLERINA_COMMANDS, ...args:
    string[]) {
    if (terminal) {
        terminal.dispose();
    }
    let filePath = '';
    typeof file === 'string' ? filePath = file : filePath = file.path!;
    let argsList = '';
    if (args && args.length > 0) {
        args.forEach((arg) => {
            argsList += arg.concat(' ');
        });
    }
    let commandText;
    if (cmd === BALLERINA_COMMANDS.OTHER) {
        commandText = `${executor} ${argsList}`;
        terminal = window.createTerminal({ name: TERMINAL_NAME });
    } else {
        commandText = `${executor} ${cmd} ${argsList}`;
        terminal = window.createTerminal({ name: TERMINAL_NAME, cwd: filePath });
    }
    terminal.sendText(isWindows() ? 'cls' : 'clear', true);
    terminal.show(true);
    terminal.sendText(commandText, true);
}

export function clearTerminal(): void {
    if (terminal) {
        terminal.dispose();
    }
}
