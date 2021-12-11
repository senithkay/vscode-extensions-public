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
import { PALETTE_COMMANDS } from "../project/cmds/cmd-runner";
import { CMP_PROJECT_ADD, sendTelemetryException } from "../telemetry";
import { BallerinaExtension, ballerinaExtInstance } from "../core";
import { OAuthListener } from "./auth-listener";
import { deleteChoreoKeytarSession } from "./auth-session";
import { initiateInbuiltAuth } from "./inbuilt-impl";
import { ChoreoAuthConfig } from "./config";

export let choreoAuthConfig: ChoreoAuthConfig;
async function activate(extension: BallerinaExtension) {
    choreoAuthConfig = new ChoreoAuthConfig();
    commands.registerCommand(PALETTE_COMMANDS.CHOREO_SIGNIN, async () => {
        try {
            await new OAuthListener(3000, extension).StartProcess();
            initiateInbuiltAuth(extension);
        } catch (error) {
            if (error instanceof Error) {
                sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_ADD);
                window.showErrorMessage(error.message);
            }
        }
    });

    commands.registerCommand(PALETTE_COMMANDS.CHOREO_SIGNOUT, async () => {
        try {
            deleteChoreoKeytarSession();
            extension.setChoreoSession({
                loginStatus: false
            });
            extension.getChoreoSessionTreeProvider()?.refresh();
            window.showInformationMessage('Successfully signed out from Choreo!');
            extension.getPerformanceForecastContext().infoMessageStatus.signinChoreo = true;
        } catch (error) {
            if (error instanceof Error) {
                sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_ADD);
                window.showErrorMessage(error.message);
            }
        }
    });
}

export { activate };
