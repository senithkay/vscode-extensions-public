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
    BallerinaProjectComponents,
    // CodeGeneartionData,
    EggplantDiagramAPI,
    EggplantModelRequest,
    Flow,
    STModification,
    // workerCodeGen,
} from "@wso2-enterprise/eggplant-core";
import { ModulePart, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { writeFileSync } from "fs";
import { StateMachine, openView } from "../../stateMachine";
import { Uri, workspace } from "vscode";

export class EggplantDiagramRpcManager implements EggplantDiagramAPI {
    async getEggplantModel(): Promise<Flow> {
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

        }


        return StateMachine.langClient().getEggplantModel(params).then((model) => {
            console.log("===BackEndModel", model);
            //@ts-ignore
            return model.flowDesignModel;
        }).catch((error) => {
            // demo hack
            //@ts-ignore
            return new Promise((resolve) => {
                //@ts-ignore
                resolve(undefined);
            });
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
}
