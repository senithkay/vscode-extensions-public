/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    RecordSTRequest,
    RecordSTResponse,
    visitor as RecordsFinderVisitor,
    ServiceDesignerAPI,
} from "@wso2-enterprise/eggplant-core";
import { traversNode } from "@wso2-enterprise/syntax-tree";
import { Uri } from "vscode";
import { StateMachine } from "../../stateMachine";

export class ServiceDesignerRpcManager implements ServiceDesignerAPI {

    async getRecordST(params: RecordSTRequest): Promise<RecordSTResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const fileUri = Uri.file(context.documentUri!).toString();
            const stResponse = await StateMachine.langClient().getSyntaxTree({ documentIdentifier: { uri: fileUri } });
            traversNode(stResponse.syntaxTree, RecordsFinderVisitor);
            const records = RecordsFinderVisitor.getRecords();
            const recordST = records.get(params.recordName);
            if (recordST !== undefined) {
                resolve({ recordST });
            } else {
                // Handle the case where recordST is undefined, perhaps throw an error or return a default value
                throw new Error(`Record with name ${params.recordName} not found.`);
            }
        });
    }
}
