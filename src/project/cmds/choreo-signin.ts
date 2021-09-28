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
import vscode, { commands, window } from "vscode";
import { PALETTE_COMMANDS } from "./cmd-runner";
import { CMP_PROJECT_ADD, sendTelemetryException } from "../../telemetry";
import { ballerinaExtInstance } from "../../core";
import { Server } from "http";
import express from "express";
import * as fs from "fs";
import * as path from "path";
import keytar = require("keytar");
import { debug } from "console";

const CHOREO_LOGIN_URL = "https://id.dv.choreo.dev/oauth2/authorize";
const CHOREO_CLIENT_ID = "choreoportalapplication";
const CHOREO_REDIRECT_URL = "http://localhost:9000/";
const CHOREO_SCOPE = "openid name user";
const SERVICE_NAME = "wso2.ballerina";
const ACCOUNT_NAME = "choreo.token";

const VS_CODE_MESSAGE_COMMAND_OPEN: string = "vscode.open";
const PATH_GET_AUTH_CODE = `${CHOREO_LOGIN_URL}?response_type=code&`
    + `redirect_uri=${CHOREO_REDIRECT_URL}&client_id=${CHOREO_CLIENT_ID}&scope="${CHOREO_SCOPE}`;

export class ChoreoOAuth {
    public app: express.Express;
    public server!: Server;
    public context;

    constructor(public port: number, context) {
        this.app = express();
        this.app.use(express.json(), express.urlencoded({ extended: false }));
        this.context = context;
    }

    /**
     * Method to start the authentication process.
     *
     * @constructor
     */
    public async StartProcess() {
        const PATH_OAUTH = "/";
        this.server = this.app.listen(this.port);
        this.app.get(PATH_OAUTH, async (req, res) => {
            try {
                const requestToken = req.query.code;
                if (requestToken) {
                    keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, requestToken);
                    console.debug("Request Token for Choreo Authentication:" + requestToken);
                    const htmlFilePath = vscode.Uri.file(
                        path.join(this.context.extensionPath, "resources", "pages", "choreo-login-success.html"),
                    );
                    const successHtml = fs.readFileSync(htmlFilePath.fsPath, "utf8");
                    res.send(successHtml);

                    vscode.window.showInformationMessage(`Successfully Logged into Choreo!`);
                } else {
                    const htmlFilePath = vscode.Uri.file(
                        path.join(this.context.extensionPath, "resources", "pages", "choreo-login-fail.html"),
                    );
                    const failHtml = fs.readFileSync(htmlFilePath.fsPath, "utf8");
                    res.send(failHtml);

                    vscode.window.showErrorMessage(`Choreo Login Failed!`);
                }
            } catch (err) {
                vscode.window.showErrorMessage("Choreo Login Failed!\n" + err);
            }
            this.server.close();
        });
    }
}

async function activate(context: vscode.ExtensionContext) {
    commands.registerCommand(PALETTE_COMMANDS.CHOREO_SIGNIN, async () => {
        try {
            vscode.commands.executeCommand(
                VS_CODE_MESSAGE_COMMAND_OPEN,
                vscode.Uri.parse(PATH_GET_AUTH_CODE)
            );
            await new ChoreoOAuth(9000, context).StartProcess();
        } catch (error) {
            if (error instanceof Error) {
                sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_ADD);
                window.showErrorMessage(error.message);
            }
        }
    });
}

export { activate };
