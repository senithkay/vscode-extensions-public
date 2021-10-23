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
import { commands, window } from "vscode";
import { PALETTE_COMMANDS } from "./cmd-runner";
import { CMP_PROJECT_ADD, sendTelemetryException } from "../../telemetry";
import { BallerinaExtension, ballerinaExtInstance } from "../../core";
import keytar = require("keytar");

const CHOREO_SERVICE_NAME = "wso2.ballerina.choreo";
const CHOREO_ACCESS_TOKEN = "access.token";
const CHOREO_DISPLAY_NAME = "display.name";
const CHOREO_COOKIE = "cookie";

async function activate(extension: BallerinaExtension) {
    commands.registerCommand(PALETTE_COMMANDS.CHOREO_SIGNOUT, async () => {
        try {
            await keytar.deletePassword(CHOREO_SERVICE_NAME, CHOREO_ACCESS_TOKEN);
            await keytar.deletePassword(CHOREO_SERVICE_NAME, CHOREO_DISPLAY_NAME);
            await keytar.deletePassword(CHOREO_SERVICE_NAME, CHOREO_COOKIE);
            extension.setChoreoSession({
                loginStatus: false
            });
            extension.getChoreoSessionTreeProvider()?.refresh();
            window.showInformationMessage('Successfully signed out from Choreo!');
        } catch (error) {
            if (error instanceof Error) {
                sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_ADD);
                window.showErrorMessage(error.message);
            }
        }
    });
}

export { activate };
