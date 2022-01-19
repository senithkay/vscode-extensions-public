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
import {window, Uri} from "vscode";
import express from "express";
import * as fs from "fs";
import * as path from "path";
import { Server } from "http";
import { BallerinaExtension } from "../core";
import { OAuthTokenHandler } from "./inbuilt-impl";

export class OAuthListener {
    public app: express.Express;
    public server!: Server;
    public extension: BallerinaExtension;

    constructor(public port: number, extension) {
        this.app = express();
        this.app.use(express.json(), express.urlencoded({ extended: false }));
        this.extension = extension;
    }

    public async StartProcess() {
        const PATH_OAUTH = "/login";
        this.server = this.app.listen(this.port);
        this.app.get(PATH_OAUTH, async (req, res) => {
            try {
                const authCode = req.query.code? req.query.code.toString() : '';
                console.debug("Choreo Authentication Code: " + authCode);

                let tokenHandler = new OAuthTokenHandler(this.extension);
                await tokenHandler.exchangeAuthToken(authCode).then((result) => {
                    let prefix: string = "fail";
                    if (result) {
                        prefix = "success";
                    }
                    const htmlFilePath = Uri.file(path.join(this.extension.context!.extensionPath,
                        "resources", "pages", "choreo-login-" + prefix + ".html"));
                    res.send(fs.readFileSync(htmlFilePath.fsPath, "utf8"));
                });
                this.server.close();
            } catch (err) {
                window.showErrorMessage(`Choreo Login Failed: ` + err);
            }
            this.server.close();
        });
    }
}
