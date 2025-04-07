/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { URI, Utils } from "vscode-uri";
import { ARTIFACT_TYPE, Artifacts, BaseArtifact, DIRECTORY_MAP, ProjectStructureArtifactResponse, ProjectStructureResponse } from "@wso2-enterprise/ballerina-core";
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
        await populateLocalConnectors(projectDir, result);
    }
    return result;
}

export async function updateProjectArtifacts(publishedArtifacts: Artifacts) {
    // Current project structure
    const currentProjectStructure: ProjectStructureResponse = StateMachine.context().projectStructure;
    if (publishedArtifacts && currentProjectStructure) {
        await traverseUpdatedComponents(publishedArtifacts, currentProjectStructure);
        //Update the state machine context
        StateMachine.updateProjectStructure({ ...currentProjectStructure });
    }
}

async function traverseComponents(artifacts: Artifacts, response: ProjectStructureResponse) {
    response.directoryMap[DIRECTORY_MAP.AUTOMATION].push(...await getComponents(artifacts[ARTIFACT_TYPE.EntryPoints], DIRECTORY_MAP.AUTOMATION, "task"));
    response.directoryMap[DIRECTORY_MAP.SERVICE].push(...await getComponents(artifacts[ARTIFACT_TYPE.EntryPoints], DIRECTORY_MAP.SERVICE, "http-service"));
    response.directoryMap[DIRECTORY_MAP.LISTENER].push(...await getComponents(artifacts[ARTIFACT_TYPE.Listeners], DIRECTORY_MAP.LISTENER, "http-service"));
    response.directoryMap[DIRECTORY_MAP.FUNCTION].push(...await getComponents(artifacts[ARTIFACT_TYPE.Functions], DIRECTORY_MAP.FUNCTION, "function"));
    response.directoryMap[DIRECTORY_MAP.DATA_MAPPER].push(...await getComponents(artifacts[ARTIFACT_TYPE.DataMappers], DIRECTORY_MAP.DATA_MAPPER, "dataMapper"));
    response.directoryMap[DIRECTORY_MAP.CONNECTION].push(...await getComponents(artifacts[ARTIFACT_TYPE.Connections], DIRECTORY_MAP.CONNECTION, "connection"));
    response.directoryMap[DIRECTORY_MAP.TYPE].push(...await getComponents(artifacts[ARTIFACT_TYPE.Types], DIRECTORY_MAP.TYPE, "type"));
    response.directoryMap[DIRECTORY_MAP.CONFIGURABLE].push(...await getComponents(artifacts[ARTIFACT_TYPE.Configurations], DIRECTORY_MAP.CONFIGURABLE, "config"));
    response.directoryMap[DIRECTORY_MAP.NP_FUNCTION].push(...await getComponents(artifacts[ARTIFACT_TYPE.NaturalFunctions], DIRECTORY_MAP.NP_FUNCTION, "function"));
}

async function getComponents(artifacts: Record<string, BaseArtifact>, artifactType: DIRECTORY_MAP, icon: string, moduleName?: string): Promise<ProjectStructureArtifactResponse[]> {
    const entries: ProjectStructureArtifactResponse[] = [];
    if (!artifacts) {
        return entries;
    }
    // Loop though the artifact records and create the project structure artifact response
    for (const [key, artifact] of Object.entries(artifacts)) {
        // Skip the entry to the entries array if the artifact type does not match the requested artifact type
        if (artifact.type !== artifactType) {
            continue;
        }
        const entryValue = await getEntryValue(artifact, icon, moduleName);
        entries.push(entryValue);
    }
    return entries;
}

async function getEntryValue(artifact: BaseArtifact, icon: string, moduleName?: string) {
    const targetFile = Utils.joinPath(URI.parse(StateMachine.context().projectUri), artifact.location.fileName).fsPath;
    const entryValue: ProjectStructureArtifactResponse = {
        id: artifact.id,
        name: artifact.name,
        path: targetFile,
        type: artifact.type,
        icon: artifact.module ? `bi-${artifact.module}` : icon,
        context: artifact.name,
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
            entryValue.name = `Automation`;
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
            const serviceModel = serviceResponse.service;
            if (serviceResponse?.service) {
                entryValue.serviceModel = serviceModel;
                const displayName = serviceModel.name;
                const labelName = serviceModel.properties['name']?.value || serviceModel.properties['basePath']?.value;
                // entryValue.type = serviceModel.moduleName; // graphql, http, etc
                entryValue.name = labelName ? `${displayName} - ${labelName}` : displayName; // GraphQL Service - /foo
                entryValue.icon = `bi-${serviceModel.moduleName}`;

                if (serviceModel?.listenerProtocol) {
                    entryValue.icon = getCustomEntryNodeIcon(serviceModel?.listenerProtocol);
                }

                // Get the children of the service
                const resourceFunctions = await getComponents(artifact.children, DIRECTORY_MAP.RESOURCE, icon, artifact.module);
                const remoteFunctions = await getComponents(artifact.children, DIRECTORY_MAP.REMOTE, icon, artifact.module);
                entryValue.resources = [...resourceFunctions, ...remoteFunctions];
            }
            break;
        case DIRECTORY_MAP.LISTENER:
            // Do things related to listener
            entryValue.icon = getCustomEntryNodeIcon(getTypePrefix(artifact.module));
            break;
        case DIRECTORY_MAP.CONNECTION:
            entryValue.icon = icon;
            break;
        case DIRECTORY_MAP.RESOURCE:
            // Do things related to resource
            let resourceName = `${artifact.accessor}-${artifact.name}`;
            let resourceIcon = `${artifact.accessor}-api`;
            if (moduleName && moduleName === "graphql") {
                resourceName = `${artifact.name}`;
                resourceIcon = ``;
            }
            entryValue.name = resourceName;
            entryValue.icon = resourceIcon;
            break;
        case DIRECTORY_MAP.REMOTE:
            // Do things related to remote
            entryValue.icon = ``;
            break;
    }
    return entryValue;
}

async function traverseUpdatedComponents(publishedArtifacts: Artifacts, currentProjectStructure: ProjectStructureResponse) {
    for (const [key, artifact] of Object.entries(publishedArtifacts)) { // key will be Entry Points, Listeners, Functions, etc
        for (const [actionKey, actionArtifact] of Object.entries(artifact)) { // actionKey will be deletions, creations, updates
            switch (actionKey) {
                case "deletions":
                    handleDeletions(Object.values(actionArtifact).at(0), key, currentProjectStructure);
                    break;
                case "additions":
                    handleCreations(Object.values(actionArtifact).at(0), key, currentProjectStructure);
                    break;
                case "updates":
                    handleUpdates(Object.values(actionArtifact).at(0), key, currentProjectStructure);
                    break;
            }
        }
    }
}

// Handle deletions
function handleDeletions(artifact: BaseArtifact, key: string, currentProjectStructure: ProjectStructureResponse) {
    switch (key) {
        case ARTIFACT_TYPE.EntryPoints:
            if (artifact.id === "automation") {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.AUTOMATION] = currentProjectStructure.directoryMap[DIRECTORY_MAP.AUTOMATION].filter(value => value.id !== artifact.id);
            } else {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.SERVICE] = currentProjectStructure.directoryMap[DIRECTORY_MAP.SERVICE].filter(value => value.id !== artifact.id);
            }
            break;
        case ARTIFACT_TYPE.Listeners:
            currentProjectStructure.directoryMap[DIRECTORY_MAP.LISTENER] = currentProjectStructure.directoryMap[DIRECTORY_MAP.LISTENER].filter(value => value.id !== artifact.id);
            break;
        case ARTIFACT_TYPE.Functions:
            currentProjectStructure.directoryMap[DIRECTORY_MAP.FUNCTION] = currentProjectStructure.directoryMap[DIRECTORY_MAP.FUNCTION].filter(value => value.id !== artifact.id);
            break;
        case ARTIFACT_TYPE.DataMappers:
            currentProjectStructure.directoryMap[DIRECTORY_MAP.DATA_MAPPER] = currentProjectStructure.directoryMap[DIRECTORY_MAP.DATA_MAPPER].filter(value => value.id !== artifact.id);
            break;
        case ARTIFACT_TYPE.Connections:
            currentProjectStructure.directoryMap[DIRECTORY_MAP.CONNECTION] = currentProjectStructure.directoryMap[DIRECTORY_MAP.CONNECTION].filter(value => value.id !== artifact.id);
            break;
        case ARTIFACT_TYPE.Types:
            currentProjectStructure.directoryMap[DIRECTORY_MAP.TYPE] = currentProjectStructure.directoryMap[DIRECTORY_MAP.TYPE].filter(value => value.id !== artifact.id);
            break;
        case ARTIFACT_TYPE.Configurations:
            currentProjectStructure.directoryMap[DIRECTORY_MAP.CONFIGURABLE] = currentProjectStructure.directoryMap[DIRECTORY_MAP.CONFIGURABLE].filter(value => value.id !== artifact.id);
            break;
        case ARTIFACT_TYPE.NaturalFunctions:
            currentProjectStructure.directoryMap[DIRECTORY_MAP.NP_FUNCTION] = currentProjectStructure.directoryMap[DIRECTORY_MAP.NP_FUNCTION].filter(value => value.id !== artifact.id);
            break;
        default:
            break;
    }

}
//Handle creations
async function handleCreations(artifact: BaseArtifact, key: string, currentProjectStructure: ProjectStructureResponse) {
    switch (key) {
        case ARTIFACT_TYPE.EntryPoints:
            if (artifact.id === "automation") {
                const entryValue = await getEntryValue(artifact, "task");
                currentProjectStructure.directoryMap[DIRECTORY_MAP.AUTOMATION].push(entryValue);
            } else {
                const entryValue = await getEntryValue(artifact, "http-service");
                currentProjectStructure.directoryMap[DIRECTORY_MAP.SERVICE].push(entryValue);
            }
            break;
        case ARTIFACT_TYPE.Listeners:
            const listenerValue = await getEntryValue(artifact, "http-service");
            currentProjectStructure.directoryMap[DIRECTORY_MAP.LISTENER].push(listenerValue);
            break;
        case ARTIFACT_TYPE.Functions:
            const functionValue = await getEntryValue(artifact, "function");
            currentProjectStructure.directoryMap[DIRECTORY_MAP.FUNCTION].push(functionValue);
            break;
        case ARTIFACT_TYPE.DataMappers:
            const dataMapperValue = await getEntryValue(artifact, "dataMapper");
            currentProjectStructure.directoryMap[DIRECTORY_MAP.DATA_MAPPER].push(dataMapperValue);
            break;
        case ARTIFACT_TYPE.Connections:
            const connectionValue = await getEntryValue(artifact, "connection");
            currentProjectStructure.directoryMap[DIRECTORY_MAP.CONNECTION].push(connectionValue);
            break;
        case ARTIFACT_TYPE.Types:
            const typeValue = await getEntryValue(artifact, "type");
            currentProjectStructure.directoryMap[DIRECTORY_MAP.TYPE].push(typeValue);
            break;
        case ARTIFACT_TYPE.Configurations:
            const configurableValue = await getEntryValue(artifact, "config");
            currentProjectStructure.directoryMap[DIRECTORY_MAP.CONFIGURABLE].push(configurableValue);
            break;
        case ARTIFACT_TYPE.NaturalFunctions:
            const npFunctionValue = await getEntryValue(artifact, "function");
            currentProjectStructure.directoryMap[DIRECTORY_MAP.NP_FUNCTION].push(npFunctionValue);
            break;
        default:
            break;
    }
}
//Handle updates
async function handleUpdates(artifact: BaseArtifact, key: string, currentProjectStructure: ProjectStructureResponse) {
    switch (key) {
        case ARTIFACT_TYPE.EntryPoints:
            if (artifact.id === "automation") {
                const entryValue = await getEntryValue(artifact, "task");
                const index = currentProjectStructure.directoryMap[DIRECTORY_MAP.AUTOMATION].findIndex(value => value.id === artifact.id);
                if (index !== -1) {
                    currentProjectStructure.directoryMap[DIRECTORY_MAP.AUTOMATION][index] = entryValue;
                } else {
                    currentProjectStructure.directoryMap[DIRECTORY_MAP.AUTOMATION].push(entryValue);
                }
            } else {
                const entryValue = await getEntryValue(artifact, "http-service");
                const index = currentProjectStructure.directoryMap[DIRECTORY_MAP.SERVICE].findIndex(value => value.id === artifact.id);
                if (index !== -1) {
                    currentProjectStructure.directoryMap[DIRECTORY_MAP.SERVICE][index] = entryValue;
                } else {
                    currentProjectStructure.directoryMap[DIRECTORY_MAP.SERVICE].push(entryValue);
                }
            }
            break;
        case ARTIFACT_TYPE.Listeners:
            const listenerValue = await getEntryValue(artifact, "http-service");
            const listenerValueIndex = currentProjectStructure.directoryMap[DIRECTORY_MAP.LISTENER].findIndex(value => value.id === artifact.id);
            if (listenerValueIndex !== -1) {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.LISTENER][listenerValueIndex] = listenerValue;
            } else {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.LISTENER].push(listenerValue);
            }
            break;
        case ARTIFACT_TYPE.Functions:
            const functionValue = await getEntryValue(artifact, "function");
            const functionValueIndex = currentProjectStructure.directoryMap[DIRECTORY_MAP.FUNCTION].findIndex(value => value.id === artifact.id);
            if (functionValueIndex !== -1) {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.FUNCTION][functionValueIndex] = functionValue;
            } else {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.FUNCTION].push(functionValue);
            }
            break;
        case ARTIFACT_TYPE.DataMappers:
            const dataMapperValue = await getEntryValue(artifact, "dataMapper");
            const dataMapperValueIndex = currentProjectStructure.directoryMap[DIRECTORY_MAP.DATA_MAPPER].findIndex(value => value.id === artifact.id);
            if (dataMapperValueIndex !== -1) {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.DATA_MAPPER][dataMapperValueIndex] = dataMapperValue;
            } else {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.DATA_MAPPER].push(dataMapperValue);
            }
            break;
        case ARTIFACT_TYPE.Connections:
            const connectionValue = await getEntryValue(artifact, "connection");
            const connectionValueIndex = currentProjectStructure.directoryMap[DIRECTORY_MAP.CONNECTION].findIndex(value => value.id === artifact.id);
            if (connectionValueIndex !== -1) {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.CONNECTION][connectionValueIndex] = connectionValue;
            } else {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.CONNECTION].push(connectionValue);
            }
            break;
        case ARTIFACT_TYPE.Types:
            const typeValue = await getEntryValue(artifact, "type");
            const typeValueIndex = currentProjectStructure.directoryMap[DIRECTORY_MAP.TYPE].findIndex(value => value.id === artifact.id);
            if (typeValueIndex !== -1) {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.TYPE][typeValueIndex] = typeValue;
            } else {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.TYPE].push(typeValue);
            }
            break;
        case ARTIFACT_TYPE.Configurations:
            const configurableValue = await getEntryValue(artifact, "config");
            const configurableValueIndex = currentProjectStructure.directoryMap[DIRECTORY_MAP.CONFIGURABLE].findIndex(value => value.id === artifact.id);
            if (configurableValueIndex !== -1) {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.CONFIGURABLE][configurableValueIndex] = configurableValue;
            } else {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.CONFIGURABLE].push(configurableValue);
            }
            break;
        case ARTIFACT_TYPE.NaturalFunctions:
            const npFunctionValue = await getEntryValue(artifact, "function");
            const npFunctionValueIndex = currentProjectStructure.directoryMap[DIRECTORY_MAP.NP_FUNCTION].findIndex(value => value.id === artifact.id);
            if (npFunctionValueIndex !== -1) {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.NP_FUNCTION][npFunctionValueIndex] = npFunctionValue;
            } else {
                currentProjectStructure.directoryMap[DIRECTORY_MAP.NP_FUNCTION].push(npFunctionValue);
            }
            break;
        default:
            break;
    }
}

async function populateLocalConnectors(projectDir: string, response: ProjectStructureResponse) {
    const filePath = `${projectDir}/Ballerina.toml`;
    const localConnectors = (await StateMachine.langClient().getOpenApiGeneratedModules({ projectPath: projectDir })).modules;
    const mappedEntries: ProjectStructureArtifactResponse[] = localConnectors.map(moduleName => ({
        id: moduleName,
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
    if (!type) { return ""; }
    const parts = type.split(":");
    return parts.length > 1 ? parts[0] : type;
};
