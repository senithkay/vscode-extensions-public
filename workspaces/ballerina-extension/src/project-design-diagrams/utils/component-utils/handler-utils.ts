/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { Uri, window, workspace } from "vscode";
import { existsSync, readFile, rmSync, writeFile } from "fs";
import * as path from "path";
import { CMLocation as Location, CMAnnotation as Annotation, STModification } from "@wso2-enterprise/ballerina-languageclient";
import { WorkspaceConfig, WorkspaceItem } from "@wso2-enterprise/choreo-core";
import { AssignmentStatement, STKindChecker, STNode, traversNode } from "@wso2-enterprise/syntax-tree";
import { ExtendedLangClient } from "../../../core";
import { getLangClient, STResponse } from "../../activator";
import { DeleteLinkArgs, SUCCESSFUL_LINK_DELETION, UNSUPPORTED_LINK_DELETION } from "../../resources";
import { getInitFunction, go2source, updateSyntaxTree, updateSourceFile, visitor as STNodeFindingVisitor } from "../shared-utils";

export function deleteBallerinaPackage(filePath: string): void {
    let basePath: string = path.dirname(filePath);
    while (!existsSync(path.join(basePath, 'Ballerina.toml'))) {
        basePath = path.dirname(basePath);
    }
    rmSync(basePath, { recursive: true });
    updateWorkspaceFileOnDelete(basePath).then(() => {
        window.showInformationMessage('Component was deleted successfully');
    }).catch((err) => {
        console.log(err);
        window.showErrorMessage('Error: Could not update workspace file');
    });
}

export async function deleteComponentOnly(location: Location) {
    const modifications: STModification[] = [];
    modifications.push({
        startLine: location.startPosition.line,
        startColumn: location.startPosition.offset,
        endLine: location.endPosition.line,
        endColumn: location.endPosition.offset,
        type: "DELETE"
    });

    const langClient: ExtendedLangClient = getLangClient();
    const response: STResponse = (await langClient.stModify({
        astModifications: modifications,
        documentIdentifier: {
            uri: Uri.file(location.filePath).toString(),
        }
    })) as STResponse;

    if (response.parseSuccess && response.source) {
        await updateSourceFile(langClient, location.filePath, response.source).then(() => {
            window.showInformationMessage('Component was deleted successfully');
        })
    }
}

async function updateWorkspaceFileOnDelete(componentPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const workspaceFile: string = workspace.workspaceFile?.fsPath;
        readFile(workspaceFile, 'utf-8', function (err, contents) {
            if (contents) {
                const content: WorkspaceConfig = JSON.parse(contents);
                const deletedFolder: WorkspaceItem = content.folders.find(folder =>
                    componentPath === path.resolve(path.dirname(workspaceFile), folder.path));
                const folderIndex: number = content.folders.indexOf(deletedFolder);

                if (folderIndex > -1) {
                    const didDelete = workspace.updateWorkspaceFolders(folderIndex, 1);
                    if (didDelete) {
                        resolve();
                    } else {
                        reject(new Error('Could not update the workspace file'));
                    }
                } else {
                    reject(new Error('Could not find the component in the workspace file'));
                }
            } else if (err) {
                reject(err);
            }
        });
    });
}

export async function deleteLink(langClient: ExtendedLangClient, args: DeleteLinkArgs): Promise<void> {
    const { linkLocation, nodeLocation } = args;
    let userFeedback = UNSUPPORTED_LINK_DELETION;
    const stResponse: STResponse = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: Uri.file(linkLocation.filePath).toString()
        }
    }) as STResponse;
    if (stResponse.parseSuccess) {
        let modifications: STModification[] = [];
        STNodeFindingVisitor.setPosition({
            startColumn: linkLocation.startPosition.offset,
            startLine: linkLocation.startPosition.line,
            endColumn: linkLocation.endPosition.offset,
            endLine: linkLocation.endPosition.line
        });
        traversNode(stResponse.syntaxTree, STNodeFindingVisitor);
        const node: STNode = STNodeFindingVisitor.getSTNode();
        if (STKindChecker.isObjectField(node) && node.typeData.isEndpoint) {
            const identifierName: string = node.fieldName.value;
            STNodeFindingVisitor.setPosition({
                startColumn: nodeLocation.startPosition.offset,
                startLine: nodeLocation.startPosition.line,
                endColumn: nodeLocation.endPosition.offset,
                endLine: nodeLocation.endPosition.line
            });
            traversNode(stResponse.syntaxTree, STNodeFindingVisitor);
            const serviceNode: STNode = STNodeFindingVisitor.getSTNode();
            const initFunction = getInitFunction(serviceNode);
            const initStatement: AssignmentStatement = initFunction?.functionBody?.statements?.find((statement: STNode) =>
                STKindChecker.isAssignmentStatement(statement) && STKindChecker.isFieldAccess(statement.varRef) &&
                STKindChecker.isSimpleNameReference(statement.varRef.fieldName) &&
                statement.varRef.fieldName.name.value === identifierName
            );

            if (initStatement) {
                modifications = [
                    {
                        startLine: linkLocation.startPosition.line,
                        startColumn: linkLocation.startPosition.offset,
                        endLine: linkLocation.endPosition.line,
                        endColumn: linkLocation.endPosition.offset,
                        type: "DELETE"
                    },
                    {
                        type: "DELETE",
                        ...initStatement.position
                    }
                ];
            }
        } else if (STKindChecker.isLocalVarDecl(node) && node.typeData.isEndpoint) {
            modifications = [
                {
                    startLine: linkLocation.startPosition.line,
                    startColumn: linkLocation.startPosition.offset,
                    endLine: linkLocation.endPosition.line,
                    endColumn: linkLocation.endPosition.offset,
                    type: "DELETE"
                }
            ];
        }

        if (modifications.length) {
            const updatedST: STResponse = (await langClient.stModify({
                astModifications: modifications,
                documentIdentifier: {
                    uri: Uri.file(linkLocation.filePath).toString(),
                }
            })) as STResponse;

            if (updatedST.parseSuccess && updatedST.source) {
                await updateSourceFile(langClient, linkLocation.filePath, updatedST.source).then(() => {
                    userFeedback = SUCCESSFUL_LINK_DELETION;
                });
            }
        }
    }
    showActionableMessage(userFeedback, linkLocation);
}

function showActionableMessage(message: string, location: Location) {
    const action = 'Go to source';
    window.showInformationMessage(message, action).then((selection) => {
        if (action === selection) {
            go2source(location);
        }
    });
}

export async function editDisplayLabel(langClient: ExtendedLangClient, annotation: Annotation): Promise<boolean> {
    const stObject = {
        position: {
            startLine: annotation.elementLocation.startPosition.line,
            startColumn: annotation.elementLocation.startPosition.offset,
            endLine: annotation.elementLocation.endPosition.line,
            endColumn: annotation.elementLocation.endPosition.offset
        }
    }

    const displayAnnotation: string = `
        @display {
            label: "${annotation.label}",
            id: "${annotation.id}"
        }
    `;

    const response: STResponse = await updateSyntaxTree(
        langClient, annotation.elementLocation.filePath, stObject, displayAnnotation, undefined, true) as STResponse;
    if (response.parseSuccess && response.source) {
        return updateSourceFile(langClient, annotation.elementLocation.filePath, response.source);
    }
    window.showErrorMessage('Architecture View: Failed to update display annotation.');
    return false;
}
