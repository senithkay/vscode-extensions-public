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

export async function buildProjectStructure(projectDir: string, langClient: ExtendedLangClientInterface): Promise<ProjectStructureResponse> {
    const result: ProjectStructureResponse = {
        directoryMap: {
            [DIRECTORY_MAP.SERVICES]: [],
            [DIRECTORY_MAP.AUTOMATION]: [],
            [DIRECTORY_MAP.FUNCTIONS]: [],
            [DIRECTORY_MAP.TRIGGERS]: [],
            [DIRECTORY_MAP.CONNECTIONS]: [],
            [DIRECTORY_MAP.TYPES]: [],
            [DIRECTORY_MAP.CONFIGURATIONS]: [],
            [DIRECTORY_MAP.RECORDS]: []
        }
    };
    const components = await langClient.getBallerinaProjectComponents({
        documentIdentifiers: [{ uri: URI.file(projectDir).toString() }]
    });
    await traverseComponents(components, result, langClient);
    return result;
}

async function traverseComponents(components: BallerinaProjectComponents, response: ProjectStructureResponse, langClient: ExtendedLangClientInterface) {
    for (const pkg of components.packages) {
        for (const module of pkg.modules) {
            response.directoryMap[DIRECTORY_MAP.AUTOMATION].push(...await getComponents(langClient, module.automations, pkg.filePath, "scheduled-message-forwarding-processor", DIRECTORY_MAP.AUTOMATION));
            response.directoryMap[DIRECTORY_MAP.SERVICES].push(...await getComponents(langClient, module.services, pkg.filePath, "APIResource", DIRECTORY_MAP.SERVICES));
            response.directoryMap[DIRECTORY_MAP.FUNCTIONS].push(...await getComponents(langClient, module.functions, pkg.filePath, "message-processor"));
            response.directoryMap[DIRECTORY_MAP.CONNECTIONS].push(...await getComponents(langClient, module.moduleVariables, pkg.filePath, "address-endpoint", DIRECTORY_MAP.CONNECTIONS));
            response.directoryMap[DIRECTORY_MAP.TYPES].push(...await getComponents(langClient, module.types, pkg.filePath, "type-hierarchy"));
            response.directoryMap[DIRECTORY_MAP.RECORDS].push(...await getComponents(langClient, module.records, pkg.filePath, "type-hierarchy"));
            response.directoryMap[DIRECTORY_MAP.CONFIGURATIONS].push(...await getComponents(langClient, module.configurableVariables, pkg.filePath, "list-ordered"));
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

        const iconValue = comp.name.includes('-') ? `${comp.name.split('-')[0]}-api` : icon;

        const fileEntry: ProjectStructureArtifactResponse = {
            name: dtype === DIRECTORY_MAP.SERVICES ? comp.filePath.replace(".bal", "") : comp.name,
            path: componentFile,
            type: 'HTTP',
            icon: iconValue,
            context: comp.name,
            st: stNode.syntaxTree,
            resources: comp?.resources ? await getComponents(langClient, comp?.resources, projectPath, "") : [],
            position: {
                endColumn: comp.endColumn,
                endLine: comp.endLine,
                startColumn: comp.startColumn,
                startLine: comp.startLine
            }
        };
        if (dtype === DIRECTORY_MAP.AUTOMATION) {
            fileEntry.name = "automation"
        }
        if (dtype === DIRECTORY_MAP.CONNECTIONS) {
            if (stNode.syntaxTree.typeData?.isEndpoint) {
                entries.push(fileEntry);
            }
        } else {
            entries.push(fileEntry);
        }

    }
    return entries;
}