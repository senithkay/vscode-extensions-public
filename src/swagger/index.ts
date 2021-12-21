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

import { PALETTE_COMMANDS } from "../project";
import { commands, window } from "vscode";
import { BallerinaExtension, ExtendedLangClient } from "../core";
import { showSwaggerView } from "./swaggerViewPanel";
import { MESSAGE_TYPE, showMessage } from "../utils/showMessage";
import { log } from "../utils";
import path from "path";

let langClient: ExtendedLangClient;
export async function activate(ballerinaExtInstance: BallerinaExtension) {
    langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
    commands.registerCommand(PALETTE_COMMANDS.SWAGGER_VIEW, async (...args: any[]) => {
        const editor = window.activeTextEditor;

        if (!args) {
            return;
        }

        let serviceName;
        let documentFilePath;

        if (args.length == 1) {
            serviceName = args[0];

        } else if (args.length == 2) {
            serviceName = args[0];
            documentFilePath = args[1];
        }

        if (!documentFilePath) {
            if (!editor) {
                return;
            }
            documentFilePath = editor.document.fileName!;
        }

        await createSwaggerView(documentFilePath, serviceName);
    });
}

async function createSwaggerView(documentFilePath: string, serviceName: any) {
    const file = path.basename(documentFilePath);

    if (!langClient) {
        return;
    }
    await langClient.convertToOpenAPI({
        documentFilePath
    }).then(async (response) => {
        if (response.error) {
            showMessage(`Unable to open the swagger view. ${response.error}`,
                MESSAGE_TYPE.ERROR, false);
            return;
        }
        showMessage("Please make sure the project is already running to use the try out feature", MESSAGE_TYPE.INFO, true);
        showSwaggerView(langClient, response.content, file, serviceName);
    }).catch((err) => {
        log(err);
    });
}
