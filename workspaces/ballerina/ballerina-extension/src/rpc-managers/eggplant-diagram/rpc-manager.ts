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
    EggplantAvailableNodesRequest,
    EggplantAvailableNodesResponse,
    EggplantDiagramAPI,
    EggplantFlowModelRequest,
    EggplantFlowModelResponse,
    EggplantModelRequest,
    EggplantModelResponse,
    EggplantNodeTemplateRequest,
    EggplantNodeTemplateResponse,
    EggplantSourceCodeRequest,
    EggplantSourceCodeResponse,
    Flow,
    Node,
    STModification,
    SyntaxTree,
    UpdateNodeRequest,
    UpdateNodeResponse
} from "@wso2-enterprise/ballerina-core";
import { writeFileSync } from "fs";
import { Uri } from "vscode";
import { StateMachine } from "../../stateMachine";

export class EggplantDiagramRpcManager implements EggplantDiagramAPI {
    async getEggplantModel(): Promise<EggplantModelResponse> {
        return new Promise((resolve) => {
            const context = StateMachine.context();
            if (!context.position) {
                // demo hack
                //@ts-ignore
                return new Promise((resolve) => {
                    //@ts-ignore
                    resolve(undefined);
                });
            }
            const params: EggplantModelRequest = {
                filePath: Uri.parse(context.documentUri!).fsPath,
                startLine: {
                    line: context.position.startLine ?? 0,
                    offset: context.position.startColumn ?? 0
                },
                endLine: {
                    line: context.position.endLine ?? 0,
                    offset: context.position.endColumn ?? 0
                }

            };

            // StateMachine.langClient().getEggplantModel(params).then((model) => {
            //     console.log("===BackEndModel", model);
            //     resolve(model);
            // }).catch((error) => {
            //     // demo hack
            //     //@ts-ignore
            //     return new Promise((resolve) => {
            //         //@ts-ignore
            //         resolve(undefined);
            //     });
            // });
        });
    }

    async updateEggplantModel(params: Flow): Promise<void> {
        return new Promise(async (resolve) => {
            //     const context = StateMachine.context();
            //     const code: CodeGeneartionData = workerCodeGen(params);
            //     const modificationList: STModification[] = [];

            //     const modification: STModification = {
            //         startLine: params.bodyCodeLocation?.start.line,
            //         startColumn: params.bodyCodeLocation?.start.offset,
            //         endLine: params.bodyCodeLocation?.end.line,
            //         endColumn: params.bodyCodeLocation?.end.offset,
            //         type: "INSERT",
            //         isImport: false,
            //         config: {
            //             "STATEMENT": code.workerBlocks
            //         }
            //     };

            //     modificationList.push(modification);

            //     if (code.transformFunctions && code.transformFunctions.length > 0) {
            //         code.transformFunctions.forEach((transformFunction) => {

            //             const modification: STModification = {
            //                 startLine: transformFunction.location ? transformFunction.location.start.line : params.fileSourceRange?.end.line,
            //                 startColumn: transformFunction.location ? transformFunction.location.start.offset : params.fileSourceRange?.end.offset,
            //                 endLine: transformFunction.location ? transformFunction.location.end.line : params.fileSourceRange?.end.line,
            //                 endColumn: transformFunction.location ? transformFunction.location.end.offset : params.fileSourceRange?.end.offset,
            //                 type: "INSERT",
            //                 isImport: false,
            //                 config: {
            //                     "STATEMENT": transformFunction.code
            //                 }
            //             };

            //             modificationList.push(modification);
            //         });

            //         // TODO: Remove this logic once verified with the LS team
            //         // const { parseSuccess, source, syntaxTree: newST } = await langClient.stModify({
            //         //     documentIdentifier: { uri: Uri.file(params.fileName).toString() },
            //         //     astModifications: [modification]
            //         // });

            //         // if (parseSuccess) {
            //         //     writeFileSync(params.fileName, source);
            //         //     await langClient.didChange({
            //         //         textDocument: { uri: Uri.file(params.fileName).toString(), version: 1 },
            //         //         contentChanges: [
            //         //             {
            //         //                 text: source
            //         //             }
            //         //         ],
            //         //     });
            //         // }
            //     }

            //     // TODO: Remove this logic once verified with the LS team
            //     // const modification: STModification = {
            //     //     startLine: params.bodyCodeLocation?.start.line,
            //     //     startColumn: params.bodyCodeLocation?.start.offset,
            //     //     endLine: params.bodyCodeLocation?.end.line,
            //     //     endColumn: params.bodyCodeLocation?.end.offset,
            //     //     type: "INSERT",
            //     //     isImport: false,
            //     //     config: {
            //     //         "STATEMENT": code.workerBlocks
            //     //     }
            //     // };

            //     // modificationList.push(modification);

            //     const { parseSuccess, source, syntaxTree: newST } = await StateMachine.langClient().stModify({
            //         documentIdentifier: { uri: Uri.file(params.fileName).toString() },
            //         astModifications: modificationList
            //     });

            //     if (parseSuccess) {
            //         writeFileSync(params.fileName, source);
            //         await StateMachine.langClient().didChange({
            //             textDocument: { uri: Uri.file(params.fileName).toString(), version: 1 },
            //             contentChanges: [
            //                 {
            //                     text: source
            //                 }
            //             ],
            //         });


            //         const st = newST as ModulePart;
            //         outerLoop: for (const member of st.members) {
            //             if (STKindChecker.isServiceDeclaration(member)) {
            //                 const service = member.absoluteResourcePath.reduce((result, obj) => result + obj.value, "");
            //                 for (const resource of member.members) {
            //                     if (STKindChecker.isResourceAccessorDefinition(resource)) {
            //                         let resourcePath = "";
            //                         resource.relativeResourcePath?.forEach((res: any) => {
            //                             resourcePath += res.source ? res.source : res.value;
            //                         })
            //                         const identifier = service + `/${resource.functionName.value}/${resourcePath}`;
            //                         if (identifier === context.identifier) {
            //                             openView("OPEN_VIEW", { position: resource.position });
            //                             break outerLoop;  // Break out of the inner loop
            //                         }
            //                     }
            //                 }
            //             } else if (STKindChecker.isFunctionDefinition(member)) {
            //                 const identifier = member.functionName.value;
            //                 if (identifier === context.identifier) {
            //                     openView("OPEN_VIEW", { position: member.position });
            //                     break outerLoop;
            //                 }
            //             }
            //         }
            //     }
            //     resolve();
        });
    }

    async updateNode(params: UpdateNodeRequest): Promise<void> {
        const node: Node = params.diagramNode;

        const newNode: Node = { ...node };
        delete newNode?.viewState;

        const updatedNodeRequest = {
            diagramNode: newNode
        };
        // const response: UpdateNodeResponse = await StateMachine.langClient().getUpdatedNodeModifications(updatedNodeRequest);

        // if (response.textEdits && response.textEdits.length > 0) {
        //     const modificationList: STModification[] = [];

        //     for (const edit of response.textEdits) {
        //         const stModification: STModification = {
        //             startLine: edit.range.start.line,
        //             startColumn: edit.range.start.character,
        //             endLine: edit.range.end.line,
        //             endColumn: edit.range.end.character,
        //             type: "INSERT",
        //             isImport: false,
        //             config: {
        //                 "STATEMENT": edit.newText
        //             }
        //         };

        //         modificationList.push(stModification);
        //     }

        //     const context = StateMachine.context();
        //     const fileUri = Uri.parse(context.documentUri!);

        //     const { parseSuccess, source, syntaxTree: newST } =
        //         await StateMachine.langClient().stModify({
        //             documentIdentifier: { uri: fileUri.toString() },
        //             astModifications: modificationList
        //         }) as SyntaxTree;

        //     if (parseSuccess) {
        //         writeFileSync(fileUri.fsPath, source);
        //         await StateMachine.langClient().didChange({
        //             textDocument: { uri: fileUri.toString(), version: 1 },
        //             contentChanges: [
        //                 {
        //                     text: source
        //                 }
        //             ],
        //         });
        //     }
        // }
    }

    async getFlowModel(): Promise<EggplantFlowModelResponse> {
        return new Promise((resolve) => {
            const context = StateMachine.context();
            if (!context.position) {
                console.log(">>> position not found in the context");
                return new Promise((resolve) => {
                    resolve(undefined);
                });
            }

            const params: EggplantFlowModelRequest = {
                filePath: Uri.parse(context.documentUri!).fsPath,
                startLine: {
                    line: context.position.startLine ?? 0,
                    offset: context.position.startColumn ?? 0
                },
                endLine: {
                    line: context.position.endLine ?? 0,
                    offset: context.position.endColumn ?? 0
                }
            };

            StateMachine.langClient().getFlowModel(params).then((model) => {
                console.log(">>> eggplant flow model from ls", model);
                resolve(model);
            }).catch((error) => {
                console.log(">>> error fetching eggplant flow model from ls", error);
                return new Promise((resolve) => {
                    resolve(undefined);
                });
            });
        });
    }

    async getSourceCode(params: EggplantSourceCodeRequest): Promise<EggplantSourceCodeResponse> {
        console.log(">>> requesting eggplant source code from ls", params);
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getSourceCode(params)
                .then((model) => {
                    console.log(">>> eggplant source code from ls", model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching source code from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async getAvailableNodes(params: EggplantAvailableNodesRequest): Promise<EggplantAvailableNodesResponse> {
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getAvailableNodes(params)
                .then((model) => {
                    console.log(">>> eggplant available nodes from ls", model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching available nodes from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async getNodeTemplate(params: EggplantNodeTemplateRequest): Promise<EggplantNodeTemplateResponse> {
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getNodeTemplate(params)
                .then((model) => {
                    console.log(">>> eggplant node template from ls", model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching node template from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }
}
