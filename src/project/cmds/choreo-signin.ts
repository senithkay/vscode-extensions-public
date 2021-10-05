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
import axios from "axios";

const CHOREO_LOGIN_URL = "https://id.dv.choreo.dev/oauth2/authorize";
const CHOREO_AUTH_TOKEN_URL = "https://app.dv.choreo.dev/auth/token";
const CHOREO_CLIENT_ID = "choreoportalapplication";
const CHOREO_REDIRECT_URL = "http://localhost:9000/";
const CHOREO_SCOPE = "openid name user";
const CHOREO_SERVICE_NAME = "wso2.ballerina.choreo";
const CHOREO_ACCESS_TOKEN = "access.token";
const CHOREO_DISPLAY_NAME = "display.name";
const CHOREO_COOKIE = "cookie";
const GOOGLE_FIDP = "google-choreo";
// const GITHUB_FIDP = "github-choreo";
// const ANONYMOUS_FIDP = "anonymous";

const VS_CODE_MESSAGE_COMMAND_OPEN: string = "vscode.open";
const PATH_GET_AUTH_CODE = `${CHOREO_LOGIN_URL}?response_type=code&nonce=auth&prompt=login&fidp=${GOOGLE_FIDP}`
    + `&redirect_uri=${CHOREO_REDIRECT_URL}&client_id=${CHOREO_CLIENT_ID}&scope=${CHOREO_SCOPE}`;

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
        let status: string = "fail";
        this.server = this.app.listen(this.port);
        this.app.get(PATH_OAUTH, async (req, res) => {
            try {
                const authCode = req.query.code;
                const authIdPs = req.query.AuthenticatedIdPs;
                console.debug("Choreo Authentication Code: " + authCode);
                console.debug("Choreo Authenticated IdPs: " + authIdPs);

                if (authCode && authIdPs) {
                    const jsonPayload = JSON.stringify({
                        code: authCode,
                        authenticatedIdPs: authIdPs,
                        ck: "",
                        redirectUrl: CHOREO_REDIRECT_URL
                    });

                    // To bypass the self signed server error.
                    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
                    axios({
                        method: "post",
                        url: CHOREO_AUTH_TOKEN_URL,
                        headers: {
                            'Content-Type': "application/json"
                        },
                        data: jsonPayload
                    }).then(async (response) => {
                        if (response.data && response.headers) {
                            keytar.setPassword(CHOREO_SERVICE_NAME, CHOREO_ACCESS_TOKEN,
                                String(response.data["token"]));
                            keytar.setPassword(CHOREO_SERVICE_NAME, CHOREO_DISPLAY_NAME,
                                String(response.data["displayName"]));
                            keytar.setPassword(CHOREO_SERVICE_NAME, CHOREO_COOKIE,
                                String(getCookie("cwatf", response.headers["set-cookie"][0])));

                            const choreoToken = keytar.getPassword(CHOREO_SERVICE_NAME, CHOREO_ACCESS_TOKEN);
                            choreoToken.then((result) => {
                                console.debug("Choreo Access Token: " + result);
                            });

                            const choreoDisplayName = keytar.getPassword(CHOREO_SERVICE_NAME, CHOREO_DISPLAY_NAME);
                            choreoDisplayName.then((result) => {
                                console.debug("Choreo Display Name: " + result);
                            });

                            const choreoCookie = keytar.getPassword(CHOREO_SERVICE_NAME, CHOREO_COOKIE);
                            choreoCookie.then((result) => {
                                console.debug("Choreo Cookie: " + result);
                            });

                            if (choreoToken != null && choreoDisplayName != null && choreoCookie != null) {
                                status = "success";
                                // Show the sucess message in vscode.
                                vscode.window.showInformationMessage(`Successfully Logged into Choreo!`);
                            } else {
                                vscode.window.showErrorMessage(`Choreo Login Failed: Error while retrieving`
                                    + ` the authentication token details!`);
                            }
                        } else {
                            vscode.window.showErrorMessage(`Choreo Login Failed: Error while retreiving `
                                + `the authentication token details!`);
                        }
                    }).catch((err) => {
                        vscode.window.showErrorMessage(`Choreo Login Failed: ` + err);
                    });
                } else {
                    vscode.window.showErrorMessage(`Choreo Login Failed: Error while retreiving `
                        + `the authentication code details!`);
                }
            } catch (err) {
                vscode.window.showErrorMessage(`Choreo Login Failed: ` + err);
            }
            const htmlFilePath = vscode.Uri.file(
                path.join(this.context.extensionPath, "resources", "pages", "choreo-login-" + status + ".html"),
            );
            const successHtml = fs.readFileSync(htmlFilePath.fsPath, "utf8");
            res.send(successHtml);
            this.server.close();
        });
    }
}

function getCookie(name: string, cookie: string) {
    const value = `; ${cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return name + "=" + parts.pop()?.split(';').shift();
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
