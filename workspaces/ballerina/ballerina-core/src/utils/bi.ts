/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ComponentInfo } from "../interfaces/ballerina";
import { DIRECTORY_MAP, ProjectStructureArtifactResponse, ProjectStructureResponse } from "../interfaces/bi";
import { BallerinaProjectComponents, ExtendedLangClientInterface, SyntaxTree } from "../interfaces/extended-lang-client";
import { URI, Utils } from "vscode-uri";

let automation: ProjectStructureArtifactResponse = null;

export async function buildProjectStructure(projectDir: string, langClient: ExtendedLangClientInterface): Promise<ProjectStructureResponse> {
    const result: ProjectStructureResponse = {
        directoryMap: {
            [DIRECTORY_MAP.SERVICES]: [],
            [DIRECTORY_MAP.AUTOMATION]: [],
            [DIRECTORY_MAP.TASKS]: [],
            [DIRECTORY_MAP.TRIGGERS]: [],
            [DIRECTORY_MAP.CONNECTIONS]: [],
            [DIRECTORY_MAP.TYPES]: [],
            [DIRECTORY_MAP.CONFIGURATIONS]: []
        }
    };
    const components = await langClient.getBallerinaProjectComponents({
        documentIdentifiers: [{ uri: URI.file(projectDir).toString() }]
    });
    await traverseComponents(components, result, langClient);
    if (automation) {
        result.directoryMap[DIRECTORY_MAP.AUTOMATION].push(automation);
    }
    return result;
}

async function traverseComponents(components: BallerinaProjectComponents, response: ProjectStructureResponse, langClient: ExtendedLangClientInterface) {
    for (const pkg of components.packages) {
        for (const module of pkg.modules) {
            response.directoryMap[DIRECTORY_MAP.SERVICES].push(...await getComponents(langClient, module.services, pkg.filePath, "APIResource", DIRECTORY_MAP.SERVICES));
            response.directoryMap[DIRECTORY_MAP.TASKS].push(...await getComponents(langClient, module.functions, pkg.filePath, "task"));
            response.directoryMap[DIRECTORY_MAP.CONNECTIONS].push(...await getComponents(langClient, module.moduleVariables, pkg.filePath, "arrow-swap", DIRECTORY_MAP.CONNECTIONS));
            response.directoryMap[DIRECTORY_MAP.TYPES].push(...await getComponents(langClient, module.records, pkg.filePath, "template"));
        }
    }
}

async function getComponents(langClient: ExtendedLangClientInterface, components: ComponentInfo[], projectPath: string, icon: string, dtype?: DIRECTORY_MAP): Promise<ProjectStructureArtifactResponse[]> {
    const entries: ProjectStructureArtifactResponse[] = [];
    for (const comp of components) {
        const componentFile = Utils.joinPath(URI.parse(projectPath), comp.filePath).fsPath;
        let stNode: SyntaxTree;
        try {
            stNode = await langClient.getSTByRange({
                documentIdentifier: { uri: URI.file(componentFile).toString() },
                lineRange: {
                    start: {
                        line: comp.startLine,
                        character: comp.startColumn
                    },
                    end: {
                        line: comp.endLine,
                        character: comp.endColumn
                    }
                }
            }) as SyntaxTree;
        } catch (error) {
            console.log(error);
        }

        const fileEntry: ProjectStructureArtifactResponse = {
            name: dtype === DIRECTORY_MAP.SERVICES ? comp.filePath.replace(".bal", "") : comp.name,
            path: componentFile,
            type: 'HTTP',
            icon: icon,
            context: comp.name,
            st: stNode.syntaxTree,
            position: {
                endColumn: comp.endColumn,
                endLine: comp.endLine,
                startColumn: comp.startColumn,
                startLine: comp.startLine
            }
        };
        if (dtype === DIRECTORY_MAP.CONNECTIONS) {
            if (stNode.syntaxTree.typeData?.isEndpoint) {
                entries.push(fileEntry);
            }
        } else {
            if (comp.name === "main") {
                automation = fileEntry;
                automation.name = "automation"
            } else {
                entries.push(fileEntry);
            }
        }

    }
    return entries;
}