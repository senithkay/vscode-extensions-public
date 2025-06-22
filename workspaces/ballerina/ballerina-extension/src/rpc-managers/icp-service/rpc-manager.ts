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
    STModification,
    SyntaxTree,
    TestSourceEditResponse,
    ICPServiceAPI,
    ICPEnabledRequest,
    ICPEnabledResponse,
} from "@wso2-enterprise/ballerina-core";
import { ModulePart, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";
import * as fs from 'fs';
import { existsSync, writeFileSync } from "fs";
import { Uri } from "vscode";
import { StateMachine } from "../../stateMachine";
import { applyBallerinaTomlEdit } from "../common/utils";
import { updateSourceCode } from "../../utils/source-utils";
export class ICPServiceRpcManager implements ICPServiceAPI {

    async addICP(params: ICPEnabledRequest): Promise<ICPEnabledResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const projectPath: string = context.projectUri;
                const param = {projectPath};
                const res: TestSourceEditResponse = await context.langClient.addICP(param);
                await updateSourceCode({ textEdits: res.textEdits });
                const result: ICPEnabledResponse = await context.langClient.isIcpEnabled(param);
                resolve(result);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async disableICP(params: ICPEnabledRequest): Promise<ICPEnabledResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const projectPath: string = context.projectUri;
                const param = {projectPath};
                const res: TestSourceEditResponse = await context.langClient.disableICP(param);
                await updateSourceCode({ textEdits: res.textEdits });
                const result: ICPEnabledResponse = await context.langClient.isIcpEnabled(param);
                resolve(result);
            } catch (error) {
                console.log(error);
            }
        });
    }


    async isIcpEnabled(params: ICPEnabledRequest): Promise<ICPEnabledResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const projectPath: string = context.projectUri;
                const param = {projectPath};
                const res: ICPEnabledResponse = await context.langClient.isIcpEnabled(param);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }
}
