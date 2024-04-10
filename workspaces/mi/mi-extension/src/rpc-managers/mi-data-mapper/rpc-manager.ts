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
    GetFileContentResponse,
    GetFileContentRequest,
    IOTypeRequest,
    IOTypeResponse,
    MIDataMapperAPI,
    UpdateFileContentRequest
} from "@wso2-enterprise/mi-core";
import { fetchIOTypes, getSourceCode } from "../../util/dataMapper";
import { Project } from "ts-morph";
import { navigate } from "../../stateMachine";

export class MiDataMapperRpcManager implements MIDataMapperAPI {
    async getIOTypes(params: IOTypeRequest): Promise<IOTypeResponse> {
        return new Promise(async (resolve, reject) => {
            const { filePath, functionName } = params;
            try {
                const {inputTypes, outputType} = fetchIOTypes(filePath, functionName);

                if (inputTypes.length === 0 || !outputType) {
                    throw new Error("Input and/or output type not found.");
                }

                return resolve({
                    inputTrees: inputTypes,
                    outputTree: outputType
                });
            } catch (error: any) {
                console.error(error);
                reject(error);
            }
        });
    }

    async getFileContent(params: GetFileContentRequest): Promise<GetFileContentResponse> {
        return new Promise(async (resolve, reject) => {
            const { filePath } = params;
            try {
                const fileContent = getSourceCode(filePath);

                if (!fileContent) {
                    throw new Error("Failed to fetch file content.");
                }

                return resolve({fileContent});
            } catch (error: any) {
                console.error(error);
                reject(error);
            }
        });
    }

    async updateFileContent(params: UpdateFileContentRequest): Promise<void> {
        const project = new Project();
        const sourceFile = project.addSourceFileAtPath(params.filePath);
        sourceFile.replaceWithText(params.fileContent);
        sourceFile.save();
        navigate()
    }
}
