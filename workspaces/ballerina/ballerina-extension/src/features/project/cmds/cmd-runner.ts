/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BallerinaProject } from "@wso2-enterprise/ballerina-core";
import { Terminal, window, workspace } from "vscode";
import { isWindows } from "../../../utils";
import { ballerinaExtInstance } from "../../../core";


export enum PALETTE_COMMANDS {
    ADD = 'kolab.project.add',
    BUILD = 'kolab.project.build',
    PACK = 'kolab.project.pack',
    CLOUD = 'kolab.create.cloud',
    LOGIN_COPILOT = "kolab.login.copilot",
    RESET_BI = "kolab.reset.bi",
    DOC = 'kolab.project.doc',
    FOCUS_EXPLORER = 'ballerinaExplorerTreeView.focus',
    RUN_CMD = 'kolab.project.run.cmd',
    RUN = 'kolab.project.run',
    SAVE_ALL = 'workbench.action.files.saveFiles',
    TEST = 'kolab.project.test',
    PASTE_JSON_AS_RECORD = 'kolab.pasteAsRecord',
    PASTE_XML_AS_RECORD = 'kolab.pasteXMLAsRecord',
    CHOREO_SIGNIN = 'kolab.choreo.signin',
    CHOREO_ANON_SIGNIN = 'kolab.choreo.anonymous.signin',
    CHOREO_SIGNOUT = 'kolab.choreo.signout',
    FOCUS_SOURCE_CONTROL = 'workbench.view.scm',
    CHOREO_SYNC_CHANGES = 'kolab.choreo.sync',
    PERFORMANCE_FORECAST_ENABLE = 'performance.forecasting.enable',
    PERFORMANCE_FORECAST_DISABLE = 'performance.forecasting.disable',
    TRY_IT = 'kolab.tryit',
    OPEN_IN_DIAGRAM = 'kolab.openIn.diagram',
    SHOW_DIAGRAM = 'kolab.show.diagram',
    SHOW_SOURCE = 'kolab.show.source',
    SHOW_ARCHITECTURE_VIEW = 'kolab.view.architectureView',
    SHOW_EXAMPLES = 'kolab.showExamples',
    SHOW_CELL_VIEW = 'kolab.view.cellView',
    REFRESH_SHOW_ARCHITECTURE_VIEW = "kolab.view.architectureView.refresh",
    RUN_CONFIG = 'kolab.project.run.config',
    CONFIG_CREATE_COMMAND = 'kolab.project.config.create',
    SHOW_ENTITY_DIAGRAM = 'kolab.view.entityDiagram',
    SHOW_SERVICE_DESIGNER_VIEW = 'kolab.view.serviceDesigner',
    SHOW_GRAPHQL_DESIGNER_VIEW = 'kolab.view.graphqlDesigner'
}

export enum BALLERINA_COMMANDS {
    TEST = "test", BUILD = "build", FORMAT = "format", RUN = "run", RUN_WITH_WATCH = "run --watch", DOC = "doc",
    ADD = "add", OTHER = "other", PACK = "pack"
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
    INVALID_PACK = "Only a Ballerina package can be packed.",
    INVALID_JSON = "Invalid JSON String",
    INVALID_JSON_RESPONSE = "JSON response is invalid.",
    INVALID_XML = "Invalid XML String",
    INVALID_XML_RESPONSE = "XML response is invalid."
}

export const CONFIG_FILE = 'Config.toml';
export const BAL_TOML = "Ballerina.toml";
const TERMINAL_NAME = 'Terminal';
const BAL_CONFIG_FILES = 'BAL_CONFIG_FILES';

let terminal: Terminal;

export function runCommand(file: BallerinaProject | string, executor: string, cmd: BALLERINA_COMMANDS,
    ...args: string[]) {
    runCommandWithConf(file, executor, cmd, '', ...args);
}

export function runCommandWithConf(file: BallerinaProject | string, executor: string, cmd: BALLERINA_COMMANDS,
    confPath: string, ...args: string[]) {
    if (terminal) {
        terminal.dispose();
    }
    let filePath = '';
    typeof file === 'string' ? filePath = file : filePath = file.path!;
    let argsList = '';
    if (args && args.length > 0) {
        args.forEach((arg) => {
            try {
                arg = arg.trim();
                arg = /\s/g.test(arg) ? `"${arg}"` : arg;
                argsList += arg.concat(' ');
            } catch (e) {
                // error
            }
        });
    }
    let commandText;
    if (cmd === BALLERINA_COMMANDS.OTHER) {
        commandText = `${executor} ${argsList}`;
        terminal = window.createTerminal({ name: TERMINAL_NAME });
    } else {
        let env = {};

        // Get launch.json configs
        const workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            const config = workspace.getConfiguration(
                'launch',
                workspaceFolders![0].uri
            );
            const values: any = config.get('configurations');

            if (values.length > 0) {
                const configurations = values[0];
                // envs
                if (configurations['env']) {
                    env = configurations['env'];
                }

                // program args
                if (configurations['programArgs'] && configurations['programArgs'].length > 0) {
                    configurations['programArgs'].forEach((arg) => {
                        try {
                            arg = arg.trim();
                            arg = /\s/g.test(arg) ? `"${arg}"` : arg;
                            argsList += arg.concat(' ');
                        } catch (e) {
                            // error
                        }
                    });
                }
            }
        }

        commandText = `${executor} ${cmd} ${argsList}`;
        if (confPath !== '') {
            const configs = env['BAL_CONFIG_FILES'] ? `${env['BAL_CONFIG_FILES']}:${confPath}` : confPath;
            Object.assign(env, { BAL_CONFIG_FILES: configs });
        }
        terminal = window.createTerminal({ name: TERMINAL_NAME, cwd: filePath, env });
    }
    terminal.sendText(isWindows() ? 'cls' : 'clear', true);
    terminal.show(true);
    if (confPath !== '') {
        terminal.sendText(isWindows() ? `echo $Env:${BAL_CONFIG_FILES}` : `echo $${BAL_CONFIG_FILES}`);
    }
    terminal.sendText(commandText, true);
}

export function runTerminalCommand(executor: string, file?: BallerinaProject | string, env? : { [key: string]:string }) {
    let filePath = '';
    typeof file === 'string' ? filePath = file : filePath = file?.path!;
    if (!terminal) {
        terminal = window.createTerminal({ name: TERMINAL_NAME, cwd: filePath, env: env });
    }
    terminal.sendText(executor);
}

export function clearTerminal(): void {
    if (terminal) {
        terminal.dispose();
    }
}

export function createTerminal(path: string, env? : { [key: string]:string }): void {
    if (terminal) {
        terminal = window.createTerminal({ name: TERMINAL_NAME, cwd: path, env: env });
    }
}

export function getRunCommand(): BALLERINA_COMMANDS {
    return ballerinaExtInstance.enabledLiveReload() ?
        BALLERINA_COMMANDS.RUN_WITH_WATCH : BALLERINA_COMMANDS.RUN;
}
