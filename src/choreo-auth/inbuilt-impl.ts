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
import vscode from "vscode";
import axios from "axios";
import { BallerinaExtension} from "../core";
import { OAuthListener } from "./auth-listener";
import { ChoreoAuthConfig } from "./config";
import { getChoreoKeytarSession, setChoreoKeytarSession } from "./auth-session";

export async function initiateInbuiltAuth(extension: BallerinaExtension) {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(getAuthURL()));
    await new OAuthListener(9000, extension).StartProcess();
}

export class OAuthTokenHandler {
    public extension: BallerinaExtension;
    status: boolean = false;

	constructor(extension: BallerinaExtension) {
		this.extension = extension;
    }
    
	public async exchangeAuthToken(authCode: string, authIdPs: string): Promise<boolean> {
        if (!authCode || !authIdPs) {
            vscode.window.showErrorMessage(`Choreo Login Failed: Error while retreiving `
                + `the authentication code details!`);
        } else {
            const jsonPayload = JSON.stringify({
                code: authCode,
                authenticatedIdPs: authIdPs,
                ck: "",
                redirectUrl: ChoreoAuthConfig.RedirectUrl
            });
    
            // To bypass the self signed server error.
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
            await axios({
                method: "post",
                url: ChoreoAuthConfig.TokenUrl,
                headers: {
                    'Content-Type': "application/json"
                },
                data: jsonPayload
            }).then(async (response) => {
                if (response.data && response.headers) {
                    await setChoreoKeytarSession(String(response.data["token"]), String(response.data["displayName"]),
                        String(getCookie("cwatf", response.headers["set-cookie"][0])));
    
                    await getChoreoKeytarSession().then((result) => {
                        this.extension.setChoreoSession(result);
                        if (result.loginStatus) {
                            this.status = true;
                            console.debug("Choreo Authentication User: " + result.choreoUser);
                            console.debug("Choreo Authentication Token: " + result.choreoToken);
                            console.debug("Choreo Authentication Cookie: " + result.choreoCookie);
                            // Show the sucess message in vscode.
                            vscode.window.showInformationMessage(`Successfully Logged into Choreo!`);
                            this.extension.getChoreoSessionTreeProvider()?.refresh();
                        } else {
                            vscode.window.showErrorMessage(`Choreo Login Failed: Error while retrieving`
                                + ` the authentication token details!`);
                        }
                    });
                } else {
                    vscode.window.showErrorMessage(`Choreo Login Failed: Error while retreiving `
                        + `the authentication token details!`);
                }
            }).catch((err) => {
                vscode.window.showErrorMessage(`Choreo Login Failed: ` + err);
            });
        }
        return this.status;
    }
}

function getAuthURL(): string {
    return `${ChoreoAuthConfig.LoginUrl}?response_type=code&nonce=auth&prompt=login&`
        + `fidp=${ChoreoAuthConfig.GoogleFIdp}&redirect_uri=${ChoreoAuthConfig.RedirectUrl}&`
        + `client_id=${ChoreoAuthConfig.ClientId}&scope=${ChoreoAuthConfig.Scope}`;
}

function getCookie(name: string, cookie: string) {
    const value = `; ${cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return name + "=" + parts.pop()?.split(';').shift();
    }
}
