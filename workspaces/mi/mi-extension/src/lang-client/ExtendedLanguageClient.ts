/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { GetSyntaxTreeRequest } from "@wso2-enterprise/mi-core";
import { LanguageClient } from "vscode-languageclient/node";

export interface GetSyntaxTreeParams {
    documentIdentifier: {
        uri: string;
    };
}

export interface GetSyntaxTreeResponse {
    syntaxTree: any;
    defFilePath: string;
}

export class ExtendedLanguageClient extends LanguageClient {

    async getSyntaxTree(req: GetSyntaxTreeParams): Promise<GetSyntaxTreeResponse> {
        return this.sendRequest(GetSyntaxTreeRequest.method, { uri: "file:///Users/chamupathi/Documents/projects/wso2/synapse/sample.xml" });
    }
}