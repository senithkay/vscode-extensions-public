/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    AddOrUpdateTestFunctionRequest,
    GetTestFunctionRequest,
    GetTestFunctionResponse,
    STModification,
    SourceUpdateResponse,
    SyntaxTree,
    TestManagerServiceAPI,
    TestSourceEditResponse,
} from "@wso2-enterprise/ballerina-core";
import { ModulePart, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";
import * as fs from 'fs';
import { existsSync, writeFileSync } from "fs";
import { StateMachine } from "../../stateMachine";
import { updateSourceCode } from "../../utils/source-utils";

export class TestServiceManagerRpcManager implements TestManagerServiceAPI {

    async updateTestFunction(params: AddOrUpdateTestFunctionRequest): Promise<SourceUpdateResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const targetFile = params.filePath;
                params.filePath = targetFile;
                const targetPosition: NodePosition = {
                    startLine: params.function.codedata.lineRange.startLine.line,
                    startColumn: params.function.codedata.lineRange.startLine.offset
                };
                const res: TestSourceEditResponse = await context.langClient.updateTestFunction(params);
                const position = await updateSourceCode({ textEdits: res.textEdits });
                const result: SourceUpdateResponse = {
                    filePath: targetFile,
                    position: null
                };
                resolve(result);
            } catch (error) {
                console.log(error);
            }
        });

    }

    async addTestFunction(params: AddOrUpdateTestFunctionRequest): Promise<SourceUpdateResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const targetFile = params.filePath;
                params.filePath = targetFile;
                const res: TestSourceEditResponse = await context.langClient.addTestFunction(params);
                const position = await updateSourceCode({ textEdits: res.textEdits });
                const result: SourceUpdateResponse = {
                    filePath: targetFile,
                    position: null
                };
                resolve(result);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getTestFunction(params: GetTestFunctionRequest): Promise<GetTestFunctionResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: GetTestFunctionResponse = await context.langClient.getTestFunction(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }
}
