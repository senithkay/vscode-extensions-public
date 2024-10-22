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
    ExportOASRequest,
    ExportOASResponse,
    OpenAPISpec,
    ProjectStructureResponse,
    RecordSTRequest,
    RecordSTResponse,
    ServiceDesignerAPI,
    buildProjectStructure
} from "@wso2-enterprise/ballerina-core";
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { StateMachine } from "../../stateMachine";
import { window, workspace } from "vscode";

export class ServiceDesignerRpcManager implements ServiceDesignerAPI {

    async getRecordST(params: RecordSTRequest): Promise<RecordSTResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const res: ProjectStructureResponse = await buildProjectStructure(context.projectUri, context.langClient);
            res.directoryMap[DIRECTORY_MAP.TYPES].forEach(type => {
                if (type.name === params.recordName) {
                    resolve({ recordST: type.st as TypeDefinition });
                }
            });
            resolve(null);
        });
    }

    async exportOASFile(params: ExportOASRequest): Promise<ExportOASResponse> {
        return new Promise(async (resolve) => {
            const res: ExportOASResponse = { openSpecFile: null };
            const documentFilePath = params.documentFilePath ? params.documentFilePath : StateMachine.context().documentUri;
            const spec = await StateMachine.langClient().convertToOpenAPI({ documentFilePath }) as OpenAPISpec;
            if (spec.content) {
                // Convert the OpenAPI spec to a YAML string
                const yamlStr = yaml.dump(spec.content[0].spec);
                window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: 'Select OAS Save Location' })
                    .then(uri => {
                        if (uri && uri[0]) {
                            const projectLocation = uri[0].fsPath;
                            // Construct the correct path for the output file
                            const filePath = path.join(projectLocation, `${spec.content[0]?.serviceName}_openapi.yaml`);

                            // Save the YAML string to the file
                            fs.writeFileSync(filePath, yamlStr, 'utf8');
                            // Set the response
                            res.openSpecFile = filePath;
                            // Open the file in a new VSCode document
                            workspace.openTextDocument(filePath).then(document => {
                                window.showTextDocument(document);
                            });
                        }
                    });
            } else {
                window.showErrorMessage(spec.error);
            }
            resolve(res);
        });
    }
}
