/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import { URI, Utils } from "vscode-uri";
import path from "path";
import { Artifacts, BallerinaProjectComponents, BaseArtifact, CDModel, ComponentInfo, DIRECTORY_MAP, LineRange, ProjectStructureArtifactResponse, ProjectStructureResponse, ServiceModel } from "@wso2-enterprise/ballerina-core";
import { StateMachine } from "../stateMachine";
import { ExtendedLangClient } from "../core/extended-language-client";

export async function buildProjectArtifactsStructure(projectDir: string, langClient: ExtendedLangClient): Promise<ProjectStructureResponse> {
    const result: ProjectStructureResponse = {
        projectName: "",
        directoryMap: {
            [DIRECTORY_MAP.AUTOMATION]: [],
            [DIRECTORY_MAP.SERVICE]: [],
            [DIRECTORY_MAP.LISTENER]: [],
            [DIRECTORY_MAP.FUNCTION]: [],
            [DIRECTORY_MAP.CONNECTION]: [],
            [DIRECTORY_MAP.TYPE]: [],
            [DIRECTORY_MAP.CONFIGURABLE]: [],
            [DIRECTORY_MAP.DATA_MAPPER]: [],
            [DIRECTORY_MAP.NP_FUNCTION]: [],
            [DIRECTORY_MAP.AGENTS]: [],
            [DIRECTORY_MAP.LOCAL_CONNECTORS]: [],
        }
    };
    const designArtifacts = await langClient.getProjectArtifacts({ projectPath: projectDir });
    console.log("designArtifacts", designArtifacts);
    if (designArtifacts?.artifacts) {
        await traverseComponents(designArtifacts.artifacts, result);
        // await populateLocalConnectors(projectDir, result);
    }
    return result;
}

async function traverseComponents(artifacts: Artifacts, response: ProjectStructureResponse) {
    const designServices: ComponentInfo[] = [];
    const connectionServices: ComponentInfo[] = [];
    // if (designModel) {
    //     designModel.connections.forEach(connection => {
    //         const connectionInfo: ComponentInfo = {
    //             name: connection.symbol,
    //             filePath: path.basename(connection.location.filePath),
    //             startLine: connection.location.startLine.line,
    //             startColumn: connection.location.startLine.offset,
    //             endLine: connection.location.endLine.line,
    //             endColumn: connection.location.endLine.offset,
    //         }
    //         connectionServices.push(connectionInfo);
    //     });
    //     designModel?.services.forEach(service => {
    //         const resources: ComponentInfo[] = [];
    //         service.resourceFunctions.forEach(func => {
    //             const resourceInfo: ComponentInfo = {
    //                 name: service?.type === "graphql:Service" ? `${func.path}` : `${func.accessor}-${func.path}`,
    //                 filePath: path.basename(func.location.filePath),
    //                 startLine: func.location.startLine.line,
    //                 startColumn: func.location.startLine.offset,
    //                 endLine: func.location.endLine.line,
    //                 endColumn: func.location.endLine.offset,
    //             }
    //             resources.push(resourceInfo);
    //         })

    //         service.remoteFunctions.forEach(func => {
    //             const resourceInfo: ComponentInfo = {
    //                 name: func.name,
    //                 filePath: path.basename(func.location.filePath),
    //                 startLine: func.location.startLine.line,
    //                 startColumn: func.location.startLine.offset,
    //                 endLine: func.location.endLine.line,
    //                 endColumn: func.location.endLine.offset,
    //             }
    //             resources.push(resourceInfo);
    //         })

    //         const serviceInfo: ComponentInfo = {
    //             name: service.absolutePath ? service.absolutePath : service.type,
    //             filePath: path.basename(service.location.filePath),
    //             startLine: service.location.startLine.line,
    //             startColumn: service.location.startLine.offset,
    //             endLine: service.location.endLine.line,
    //             endColumn: service.location.endLine.offset,
    //             resources
    //         }
    //         designServices.push(serviceInfo);
    //     });
    // }
    response.directoryMap[DIRECTORY_MAP.AUTOMATION].push(...await getComponents(artifacts["Entry Points"], DIRECTORY_MAP.AUTOMATION, "task"));
    response.directoryMap[DIRECTORY_MAP.SERVICE].push(...await getComponents(artifacts["Entry Points"], DIRECTORY_MAP.SERVICE, "http-service"));
    response.directoryMap[DIRECTORY_MAP.LISTENER].push(...await getComponents(artifacts.Listeners, DIRECTORY_MAP.LISTENER, "http-service"));
    response.directoryMap[DIRECTORY_MAP.FUNCTION].push(...await getComponents(artifacts.Functions, DIRECTORY_MAP.FUNCTION, "function"));
    response.directoryMap[DIRECTORY_MAP.DATA_MAPPER].push(...await getComponents(artifacts["Data Mappers"], DIRECTORY_MAP.DATA_MAPPER, "dataMapper"));
    response.directoryMap[DIRECTORY_MAP.CONNECTION].push(...await getComponents(artifacts.Connections, DIRECTORY_MAP.CONNECTION, "connection"));
    response.directoryMap[DIRECTORY_MAP.TYPE].push(...await getComponents(artifacts.Types, DIRECTORY_MAP.TYPE, "type"));
    response.directoryMap[DIRECTORY_MAP.CONFIGURABLE].push(...await getComponents(artifacts.Configurations, DIRECTORY_MAP.CONFIGURABLE, "config"));
    response.directoryMap[DIRECTORY_MAP.NP_FUNCTION].push(...await getComponents(artifacts["Natural Functions"], DIRECTORY_MAP.NP_FUNCTION, "function"));
    // response.directoryMap[DIRECTORY_MAP.RECORDS].push(...await getComponents(artifacts.Types, DIRECTORY_MAP.SERVICE, "type"));
    // response.directoryMap[DIRECTORY_MAP.ENUMS].push(...await getComponents(module.enums, DIRECTORY_MAP.SERVICE, "type"));
    // response.directoryMap[DIRECTORY_MAP.CLASSES].push(...await getComponents(module.classes, DIRECTORY_MAP.SERVICE, "type"));


    // Move data mappers to a separate category
    // const functions = response.directoryMap[DIRECTORY_MAP.FUNCTIONS];
    // response.directoryMap[DIRECTORY_MAP.FUNCTIONS] = [];
    // for (const func of functions) {
    //     try {
    //         const res = await StateMachine.langClient().getSTByRange({
    //             documentIdentifier: { uri: URI.file(func.path).toString() },
    //             lineRange: {
    //                 start: {
    //                     line: func.position.startLine,
    //                     character: func.position.startColumn
    //                 },
    //                 end: {
    //                     line: func.position.endLine,
    //                     character: func.position.endColumn
    //                 }
    //             }
    //         });
    //         if (res && 'syntaxTree' in res) {
    //             const funcST = res.syntaxTree;
    //             if (funcST
    //                 && STKindChecker.isFunctionDefinition(funcST)
    //                 && STKindChecker.isExpressionFunctionBody(funcST.functionBody)
    //             ) {
    //                 func.icon = "dataMapper";
    //                 response.directoryMap[DIRECTORY_MAP.DATA_MAPPERS].push(func);
    //             } else {
    //                 response.directoryMap[DIRECTORY_MAP.FUNCTIONS].push(func);
    //             }
    //         }
    //     } catch (error) {
    //         console.log("Data mapper ST fetch failed:", error);
    //     }
    // }
}

async function getComponents(artifacts: Record<string, BaseArtifact>, artifactType: DIRECTORY_MAP, icon: string): Promise<ProjectStructureArtifactResponse[]> {
    const entries: ProjectStructureArtifactResponse[] = [];
    let serviceModel: ServiceModel = undefined;

    // Loop though the artifact records and create the project structure artifact response
    for (const [key, artifact] of Object.entries(artifacts)) {

        const targetFile = Utils.joinPath(URI.parse(StateMachine.context().projectUri), artifact.location.fileName).fsPath;

        // Skip the entry to the entries array if the artifact type does not match the requested artifact type
        if (artifact.type !== artifactType) {
            continue;
        }

        const entryValue: ProjectStructureArtifactResponse = {
            name: artifact.name,
            path: targetFile,
            type: artifact.type,
            icon: artifact.module ? `bi-${artifact.module}` : icon,
            context: `${artifact.type} - ${artifact.name}`,
            resources: [],
            position: {
                endColumn: artifact.location.endLine.offset,
                endLine: artifact.location.endLine.line,
                startColumn: artifact.location.startLine.offset,
                startLine: artifact.location.startLine.line
            }
        };

        switch (artifact.type) {
            case DIRECTORY_MAP.AUTOMATION:
                // Do things related to automation
                entryValue.name = `Automation`
                break;
            case DIRECTORY_MAP.SERVICE:
                // Do things related to service
                const serviceResponse = await StateMachine.langClient().getServiceModelFromCode({
                    filePath: targetFile,
                    codedata: {
                        lineRange: {
                            startLine: artifact.location.startLine,
                            endLine: artifact.location.endLine
                        }
                    }
                });
                serviceModel = serviceResponse.service;
                if (serviceResponse?.service) {
                    serviceModel = serviceResponse.service;
                    const displayName = serviceModel.name;
                    const labelName = serviceModel.properties['name']?.value || serviceModel.properties['basePath']?.value;
                    // entryValue.type = serviceModel.moduleName; // graphql, http, etc
                    entryValue.name = `${displayName} - ${labelName}` // GraphQL Service - /foo
                    entryValue.icon = `bi-${serviceModel.moduleName}`;

                    if (serviceModel?.listenerProtocol) {
                        entryValue.icon = getCustomEntryNodeIcon(serviceModel?.listenerProtocol);
                    }

                    // Get the children of the service
                    const resourceFunctions = await getComponents(artifact.children, DIRECTORY_MAP.RESOURCE, icon);
                    const remoteFunctions = await getComponents(artifact.children, DIRECTORY_MAP.REMOTE, icon);
                    entryValue.resources = [...resourceFunctions, ...remoteFunctions];
                }
                break;
            case DIRECTORY_MAP.LISTENER:
                // Do things related to listener
                const listenerResponse = await StateMachine.langClient().getListenerFromSourceCode({
                    filePath: targetFile,
                    codedata: {
                        lineRange: {
                            startLine: artifact.location.startLine,
                            endLine: artifact.location.endLine
                        }
                    }
                });
                entryValue.icon = getCustomEntryNodeIcon(getTypePrefix(artifact.type));
                break;
            case DIRECTORY_MAP.CONNECTION:
                // entryValue.icon = getCustomEntryNodeIcon(getTypePrefix(artifact.type));
                break;
            case DIRECTORY_MAP.RESOURCE:
                // Do things related to resource
                const resourceName = `${artifact.accessor}-${artifact.name}`;
                entryValue.name = resourceName;
                entryValue.icon = `${artifact.accessor}-api`;
                break;
        }
        entries.push(entryValue);
    }
    return entries;
}

function getComponentName(name: string, serviceModel: ServiceModel) {
    if (serviceModel?.listenerProtocol === "agent") {
        return name.startsWith('/') ? name.substring(1) : name;
    }
    return name;
}

async function populateLocalConnectors(projectDir: string, response: ProjectStructureResponse) {
    const filePath = `${projectDir}/Ballerina.toml`;
    const localConnectors = (await StateMachine.langClient().getOpenApiGeneratedModules({ projectPath: projectDir })).modules;
    const mappedEntries: ProjectStructureArtifactResponse[] = localConnectors.map(moduleName => ({
        name: moduleName,
        path: filePath,
        type: "HTTP",
        icon: "connection",
        context: moduleName,
        resources: [],
        position: {
            endColumn: 61,
            endLine: 8,
            startColumn: 0,
            startLine: 5
        }
    }));

    response.directoryMap[DIRECTORY_MAP.LOCAL_CONNECTORS].push(...mappedEntries);
}

function getCustomEntryNodeIcon(type: string) {
    switch (type) {
        case "tcp":
            return "bi-tcp";
        case "agent":
            return "bi-ai-agent";
        case "kafka":
            return "bi-kafka";
        case "rabbitmq":
            return "bi-rabbitmq";
        case "nats":
            return "bi-nats";
        case "mqtt":
            return "bi-mqtt";
        case "grpc":
            return "bi-grpc";
        case "graphql":
            return "bi-graphql";
        case "java.jms":
            return "bi-java";
        case "github":
            return "bi-github";
        case "salesforce":
            return "bi-salesforce";
        case "asb":
            return "bi-asb";
        case "ftp":
            return "bi-ftp";
        case "file":
            return "bi-file";
        default:
            return "bi-http-service";
    }
}

const getTypePrefix = (type: string): string => {
    if (!type) return "";
    const parts = type.split(":");
    return parts.length > 1 ? parts[0] : type;
};
