/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import { ComponentInfo } from "../interfaces/ballerina";
import { DIRECTORY_MAP, ProjectStructureArtifactResponse, ProjectStructureResponse } from "../interfaces/bi";
import { BallerinaProjectComponents, ExtendedLangClientInterface, SyntaxTree } from "../interfaces/extended-lang-client";
import { URI, Utils } from "vscode-uri";
import { LineRange } from "../interfaces/common";
import { ServiceModel } from "../interfaces/service";

export async function buildProjectStructure(projectDir: string, langClient: ExtendedLangClientInterface): Promise<ProjectStructureResponse> {
    const result: ProjectStructureResponse = {
        directoryMap: {
            [DIRECTORY_MAP.SERVICES]: [],
            [DIRECTORY_MAP.AUTOMATION]: [],
            [DIRECTORY_MAP.LISTENERS]: [],
            [DIRECTORY_MAP.FUNCTIONS]: [],
            [DIRECTORY_MAP.TRIGGERS]: [],
            [DIRECTORY_MAP.CONNECTIONS]: [],
            [DIRECTORY_MAP.TYPES]: [],
            [DIRECTORY_MAP.CONFIGURATIONS]: [],
            [DIRECTORY_MAP.RECORDS]: [],
            [DIRECTORY_MAP.DATA_MAPPERS]: []
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
            response.directoryMap[DIRECTORY_MAP.AUTOMATION].push(...await getComponents(langClient, module.automations, pkg.filePath, "task", DIRECTORY_MAP.AUTOMATION));
            response.directoryMap[DIRECTORY_MAP.SERVICES].push(...await getComponents(langClient, module.services, pkg.filePath, "http-service", DIRECTORY_MAP.SERVICES));
            response.directoryMap[DIRECTORY_MAP.LISTENERS].push(...await getComponents(langClient, module.listeners, pkg.filePath, "http-service", DIRECTORY_MAP.LISTENERS));
            response.directoryMap[DIRECTORY_MAP.FUNCTIONS].push(...await getComponents(langClient, module.functions, pkg.filePath, "function"));
            response.directoryMap[DIRECTORY_MAP.CONNECTIONS].push(...await getComponents(langClient, module.moduleVariables, pkg.filePath, "connection", DIRECTORY_MAP.CONNECTIONS));
            response.directoryMap[DIRECTORY_MAP.TYPES].push(...await getComponents(langClient, module.types, pkg.filePath, "type"));
            response.directoryMap[DIRECTORY_MAP.RECORDS].push(...await getComponents(langClient, module.records, pkg.filePath, "type"));
            response.directoryMap[DIRECTORY_MAP.CONFIGURATIONS].push(...await getComponents(langClient, module.configurableVariables, pkg.filePath, "config"));
        }
    }

    // Move data mappers to a separate category
    const functions = response.directoryMap[DIRECTORY_MAP.FUNCTIONS];
    response.directoryMap[DIRECTORY_MAP.FUNCTIONS] = [];
    for (const func of functions) {
        const st = func.st;
        if (STKindChecker.isFunctionDefinition(st) && STKindChecker.isExpressionFunctionBody(st.functionBody)) {
            func.icon = "dataMapper";
            response.directoryMap[DIRECTORY_MAP.DATA_MAPPERS].push(func);
        } else {
            response.directoryMap[DIRECTORY_MAP.FUNCTIONS].push(func);
        }
    }
}

async function getComponents(langClient: ExtendedLangClientInterface, components: ComponentInfo[], projectPath: string, icon: string, dtype?: DIRECTORY_MAP): Promise<ProjectStructureArtifactResponse[]> {
    const entries: ProjectStructureArtifactResponse[] = [];
    let compType = "HTTP";
    let serviceModel: ServiceModel = undefined;
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

            // Get trigger model if available
            const lineRange: LineRange = { startLine: { line: comp.startLine, offset: comp.startColumn }, endLine: { line: comp.endLine, offset: comp.endColumn } };
            const serviceResponse = await langClient.getServiceModelFromCode({ filePath: componentFile, codedata: { lineRange } });
            if (serviceResponse?.service) {
                serviceModel = serviceResponse.service;
                const triggerType = serviceModel.displayName;
                const labelName = serviceModel.properties['name'].value;
                compType = triggerType;
                comp.name = `${triggerType} - ${labelName}`
                icon = `bi-${serviceModel.moduleName}`;
            }
        } catch (error) {
            console.log(error);
        }

        let iconValue;
        if (serviceModel?.listenerProtocol === "graphql") {
            iconValue = "bi-graphql";
        } else {
            iconValue = comp.name.includes('-') && !serviceModel ? `${comp.name.split('-')[0]}-api` : icon;
        }

        const fileEntry: ProjectStructureArtifactResponse = {
            name: dtype === DIRECTORY_MAP.SERVICES ? comp.name || comp.filePath.replace(".bal", "") : comp.name,
            path: componentFile,
            type: compType,
            icon: iconValue,
            context: comp.name,
            st: stNode.syntaxTree,
            serviceModel: serviceModel,
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
            if (stNode.syntaxTree?.typeData?.isEndpoint) {
                entries.push(fileEntry);
            }
        } else {
            entries.push(fileEntry);
        }

    }
    return entries;
}
