/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { monaco } from "react-monaco-editor";

import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    DiagramEditorLangClientInterface,
    GraphqlDesignServiceRequest, GraphqlDesignServiceResponse
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode } from "@wso2-enterprise/syntax-tree";

export async function getModelForGraphqlService(
    graphqlDesignRequest: GraphqlDesignServiceRequest,
    langClientPromise: Promise<IBallerinaLangClient>): Promise<GraphqlDesignServiceResponse> {
    const langClient: DiagramEditorLangClientInterface = await langClientPromise;
    const resp = await langClient.getGraphqlModel(graphqlDesignRequest);
    return resp;
}

export async function getSyntaxTree(filePath: string, langClientPromise: Promise<IBallerinaLangClient>): Promise<STNode> {
    const langClient: DiagramEditorLangClientInterface = await langClientPromise;
    const resp = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: monaco.Uri.file(filePath).toString()
        }
    });
    return resp.syntaxTree;
}
