/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import {
    BalleriaLanguageClient,
    GetSyntaxTreeResponse,
    StdioConnection,
    WSConnection
} from "@wso2-enterprise/ballerina-languageclient";
import { readFileSync, writeFileSync } from "fs";
import { URI } from "vscode-uri";

export const LANG_SERVER_URL = "ws://localhost:9095"

export async function createLangClient(): Promise<BalleriaLanguageClient> {
    const wsConnection = await WSConnection.initialize(LANG_SERVER_URL);
    console.log("WS connection established");
    const langClient = new BalleriaLanguageClient(wsConnection);
    console.log("Lang client created");
    console.log("Waiting for lang client to be ready");
    await langClient.onReady();
    console.log("Waiting for lang client to be ready - done");
    return langClient;
}

// export async function createLangClient(): Promise<BalleriaLanguageClient> {
//     const connection = new StdioConnection();
//     const langClient = new BalleriaLanguageClient(connection);
//     await langClient.onReady();
//     return langClient;
// }

export async function getFileContent(filePath: string): Promise<string> {
    return readFileSync(filePath, "utf8");
}

export async function updateFileContent(filePath: string, text: string): Promise<void> {
    return writeFileSync(filePath, text, "utf8");
}

export async function getSyntaxTree(langClient: BalleriaLanguageClient, filePath: string): Promise<GetSyntaxTreeResponse> {
    await langClient.onReady();
    langClient.didOpen({
        textDocument: {
            uri: URI.file(filePath).toString(),
            languageId: "ballerina",
            version: 1,
            text: await getFileContent(filePath)
        }
    });
    return langClient.getSyntaxTree({
        documentIdentifier: {
            uri: URI.file(filePath).toString()
        }
    });
}

export async function stopLangServer(langClient: BalleriaLanguageClient): Promise<void> {
    await langClient.stop();
    // wait till all notifications are finished
    await new Promise(resolve => setTimeout(() => resolve(undefined), 2000));
}
