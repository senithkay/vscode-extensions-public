/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    DIRECTORY_MAP,
    ProjectStructureResponse,
    RecordSTRequest,
    RecordSTResponse,
    visitor as RecordsFinderVisitor,
    ServiceDesignerAPI,
    SyntaxTreeResponse,
    buildProjectStructure
} from "@wso2-enterprise/ballerina-core";
import { TypeDefinition, traversNode } from "@wso2-enterprise/syntax-tree";
import { Uri } from "vscode";
import { StateMachine } from "../../stateMachine";

export class ServiceDesignerRpcManager implements ServiceDesignerAPI {

    async getRecordST(params: RecordSTRequest): Promise<RecordSTResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const res: ProjectStructureResponse = await buildProjectStructure(context.projectUri, context.langClient);
            res.directoryMap[DIRECTORY_MAP.SCHEMAS].forEach(schema => {
                if (schema.name === params.recordName) {
                    resolve({ recordST: schema.st as TypeDefinition });
                }
            });
            resolve(null);
        });
    }
}
