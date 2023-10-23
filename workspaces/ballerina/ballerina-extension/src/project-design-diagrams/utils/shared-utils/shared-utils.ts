/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { commands, Position, Range, Selection, TextEditorRevealType, Uri, window, workspace, WorkspaceEdit } from "vscode";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, normalize } from "path";
import toml from "toml";
import _ from "lodash";
import { Project } from "@wso2-enterprise/choreo-core";
import { ComponentModel, CMLocation as Location, GetComponentModelResponse, CMService as Service } from "@wso2-enterprise/ballerina-languageclient";
import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ExtendedLangClient } from "../../../core";
import { STResponse, terminateActivation } from "../../activator";
import { ERROR_MESSAGE, TomlPackageData } from "../../resources";
import { getChoreoExtAPI } from "../../../choreo-features/activate";
import { deleteBallerinaPackage, deleteComponentOnly } from "../component-utils";

const ballerinaToml = "Ballerina.toml";

export function getComponentModel(langClient: ExtendedLangClient, isChoreoProject: boolean): Promise<GetComponentModelResponse> {
    return new Promise(async (resolve, reject) => {
        const ballerinaFiles: string[] = [];
        let workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders !== undefined) {
            workspaceFolders.forEach(folder => {
                const isBalProject = existsSync(join(folder.uri.fsPath, ballerinaToml));
                if (isBalProject) {
                    ballerinaFiles.push(join(folder.uri.fsPath, ballerinaToml));
                }
            });
        } else {
            workspace.textDocuments.forEach(file => {
                ballerinaFiles.push(file.uri.fsPath);
            });
        }

        try {
            const choreoExt = await getChoreoExtAPI();
            const nonBalComponentsMap = await choreoExt?.getNonBalComponentModels();
            
            const response = await langClient.getPackageComponentModels({ documentUris: ballerinaFiles });
            let packageModels: Map<string, ComponentModel> = new Map(Object.entries(response.componentModels));
            if (!response.diagnostics?.length) {
                for (let [_key, packageModel] of packageModels) {
                    if (packageModel.hasCompilationErrors) {
                        response.diagnostics.push({
                            name: packageModel.id
                        });
                        break;
                    }
                }
            }

            if (packageModels.size < ballerinaFiles.length) {
                addMissingPackageData(ballerinaFiles, response);
            }

            if (packageModels.size && choreoExt && isChoreoProject) {
                packageModels = await choreoExt.enrichChoreoMetadata(packageModels);
            }

            resolve({
                diagnostics: response.diagnostics,
                componentModels: { ...response.componentModels, ...nonBalComponentsMap },
            });
        } catch(error) {
            reject(error);
            terminateActivation(ERROR_MESSAGE);
        }
    });
}

export async function checkIsChoreoProject(): Promise<boolean> {
    const choreoExt = await getChoreoExtAPI();
    if (choreoExt) {
        return await choreoExt.isChoreoProject();
    }
    return false;
}

export async function getActiveChoreoProject(): Promise<Project> {
    const choreoExt = await getChoreoExtAPI();
    if (choreoExt) {
        return await choreoExt.getChoreoProject();
    }
    return undefined;
}

export async function showChoreoProjectOverview(project: Project | undefined): Promise<void> {
    if (project && await getChoreoExtAPI()) {
        return commands.executeCommand('wso2.choreo.project.overview', project);
    }
    window.showErrorMessage('Error while loading Choreo project overview.');
}

function addMissingPackageData(tomlFiles: string[], retrievedModel: GetComponentModelResponse): GetComponentModelResponse {
    let workspacePkgs: Map<string, TomlPackageData> = new Map();
    tomlFiles.forEach((pkgToml) => {
        const pkgData: TomlPackageData = toml.parse(readFileSync(pkgToml, 'utf-8')).package;
        workspacePkgs.set(`${pkgData.org}/${pkgData.name}:${pkgData.version}`, pkgData);
    });

    let retrievedPkgs: string[] = Array.from(new Map(Object.entries(retrievedModel.componentModels)).keys());
    const missingPkgs = _.difference(Array.from(workspacePkgs.keys()), retrievedPkgs);

    missingPkgs.forEach((pkgId) => {
        const pkg: TomlPackageData = workspacePkgs.get(pkgId);
        const pkgServices: { [key: string]: Service } = {};
        pkgServices[pkgId] = {
            id: pkgId,
            label: pkg.name,
            type: undefined,
            annotation: {
                id: pkgId,
                label: pkg.name
            },
            dependencies: [],
            remoteFunctions: [],
            resourceFunctions: [],
            isNoData: true
        };
        retrievedModel.componentModels[pkgId] = {
            id: pkg.name,
            orgName: pkg.org,
            version: pkg.version,
            modelVersion: retrievedModel.componentModels[pkgId].modelVersion,
            hasCompilationErrors: true,
            hasModelErrors: false,
            services: pkgServices as any,
            entities: new Map(),
            connections: []
        };
    });

    return retrievedModel;
}

export async function deleteProjectComponent(projectId: string, location: Location, deletePkg: boolean): Promise<void> {
    if (deletePkg) {
        if (projectId) {
            const choreoExt = await getChoreoExtAPI();
            if (choreoExt) {
                await choreoExt.deleteComponent(projectId, location.filePath);
            }
        } else {
            deleteBallerinaPackage(location.filePath);
        }
    } else {
        await deleteComponentOnly(location);
    }
}

export function go2source(location: Location) {
    if (location && existsSync(location.filePath)) {
        workspace.openTextDocument(location.filePath).then((sourceFile) => {
            window.showTextDocument(sourceFile, { preview: false }).then((textEditor) => {
                const startPosition: Position = new Position(location.startPosition.line, location.startPosition.offset);
                const endPosition: Position = new Position(location.endPosition.line, location.endPosition.offset);
                const range: Range = new Range(startPosition, endPosition);
                textEditor.revealRange(range, TextEditorRevealType.InCenter);
                textEditor.selection = new Selection(range.start, range.start);
            });
        });
    }
}

export async function updateSyntaxTree(
    langClient: ExtendedLangClient,
    filePath: string,
    stObject: any,
    generatedCode: string,
    imports?: Set<string>,
    isReplace: boolean = false
): Promise<STResponse | {}> {
    const modifications: STModification[] = [];

    if (imports && imports?.size > 0) {
        imports.forEach(function (stmt) {
            modifications.push({
                startLine: 0,
                startColumn: 0,
                endLine: 0,
                endColumn: 0,
                type: "INSERT",
                config: {
                    STATEMENT: `import ${stmt};\n`,
                },
                isImport: true,
            });
        });
    }

    modifications.push({
        startLine: isReplace ? stObject.position.startLine : stObject.position.endLine,
        startColumn: isReplace ? stObject.position.startColumn : stObject.position.endColumn,
        endLine: stObject.position.endLine,
        endColumn: stObject.position.endColumn,
        type: "INSERT",
        config: {
            STATEMENT: generatedCode,
        }
    });

    return langClient.stModify({
        astModifications: modifications,
        documentIdentifier: {
            uri: Uri.file(filePath).toString(),
        }
    });
}

export async function updateSourceFile(langClient: ExtendedLangClient, filePath: string, fileContent: string): Promise<boolean> {
    const normalizedFilePath = normalize(filePath);
    const doc = workspace.textDocuments.find((doc) => normalize(doc.fileName) === normalizedFilePath);
    if (doc) {
        const edit = new WorkspaceEdit();
        edit.replace(Uri.file(normalizedFilePath), new Range(new Position(0, 0), doc.lineAt(doc.lineCount - 1).range.end), fileContent);
        await workspace.applyEdit(edit);
        langClient.updateStatusBar();
        return doc.save();
    } else {
        langClient.didChange({
            contentChanges: [
                {
                    text: fileContent
                }
            ],
            textDocument: {
                uri: Uri.file(normalizedFilePath).toString(),
                version: 1
            }
        });
        writeFileSync(normalizedFilePath, fileContent);
        langClient.updateStatusBar();
    }
    return false;
}

export function getInitFunction(serviceDeclaration: any): any {
    const serviceNodeMembers: any[] = serviceDeclaration.members;
    return serviceNodeMembers.find((member) =>
        (member.kind === "ObjectMethodDefinition" && member.functionName.value === "init")
    );
}
