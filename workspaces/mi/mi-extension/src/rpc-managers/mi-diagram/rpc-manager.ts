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
    ApiDirectoryResponse,
    ApplyEditRequest,
    ApplyEditResponse,
    CommandsRequest,
    CommandsResponse,
    Connector,
    ConnectorRequest,
    ConnectorResponse,
    ConnectorsResponse,
    CreateAPIRequest,
    CreateAPIResponse,
    CreateEndpointRequest,
    CreateEndpointResponse,
    CreateProjectRequest,
    CreateProjectResponse,
    CreateSequenceRequest,
    CreateSequenceResponse,
    ESBConfigsResponse,
    EndpointDirectoryResponse,
    EndpointsAndSequencesResponse,
    FileStructure,
    MiDiagramAPI,
    OpenDiagramRequest,
    ProjectDirResponse,
    ProjectRootResponse,
    SequenceDirectoryResponse,
    ShowErrorMessageRequest,
    getSTRequest,
    getSTResponse,
} from "@wso2-enterprise/mi-core";
import * as fs from "fs";
import * as os from 'os';
import { Position, Range, Uri, WorkspaceEdit, commands, window, workspace } from "vscode";
import { StateMachine, openView } from "../../stateMachine";
import { createFolderStructure } from "../../util";
import { artifactsContent, compositePomXmlContent, compositeProjectContent, configsPomXmlContent, configsProjectContent, projectFileContent, rootPomXmlContent } from "../../util/templates";
import path = require("path");
const { XMLParser } = require("fast-xml-parser");

const connectorsPath = path.join(".metadata", ".Connectors");
export class MiDiagramRpcManager implements MiDiagramAPI {
    async executeCommand(params: CommandsRequest): Promise<CommandsResponse> {
        return new Promise(async (resolve) => {
            if (params.commands.length >= 1) {
                const cmdArgs = params.commands.length > 1 ? params.commands.slice(1) : [];
                await commands.executeCommand(params.commands[0], ...cmdArgs);
                resolve({ data: "SUCCESS" });
            }
        });
    }

    async getSyntaxTree(params: getSTRequest): Promise<getSTResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.getSyntaxTree({
                documentIdentifier: {
                    uri: params.documentUri
                },
            });
            resolve(res);
        });
    }

    async getConnectors(): Promise<ConnectorsResponse> {
        return new Promise(async (resolve) => {
            const connectorNames: Connector[] = [];
            const workspaceFolders = workspace.workspaceFolders;

            if (!workspaceFolders) {
                return resolve({ data: connectorNames });
            }

            if (!fs.existsSync(path.join(workspaceFolders[0].uri.path, connectorsPath))) {
                return resolve({ data: connectorNames });
            }

            const connectorsRoot = path.join(workspaceFolders[0].uri.path, connectorsPath);
            const connectors = fs.readdirSync(connectorsRoot, { withFileTypes: true });
            connectors.filter(dirent => dirent.isDirectory()).forEach(connectorDir => {
                const connectorPath = path.join(connectorsRoot, connectorDir.name);
                const connectorInfoFile = path.join(connectorPath, `connector.xml`);
                const connectorIconFile = path.join(connectorPath, "icon", `icon-large.png`);
                if (fs.existsSync(connectorInfoFile)) {
                    const connectorDefinition = fs.readFileSync(connectorInfoFile, "utf8");
                    const options = {
                        ignoreAttributes: false,
                        attributeNamePrefix: "@_"
                    };
                    const parser = new XMLParser(options);
                    const connectorInfo = parser.parse(connectorDefinition);
                    const connectorName = connectorInfo["connector"]["component"]["@_name"];
                    const connectorDescription = connectorInfo["connector"]["component"]["description"];
                    const connectorIcon = Buffer.from(fs.readFileSync(connectorIconFile)).toString('base64');
                    connectorNames.push({ path: connectorPath, name: connectorName, description: connectorDescription, icon: connectorIcon });
                }
            });

            resolve({ data: connectorNames });
        });
    }

    async getConnector(params: ConnectorRequest): Promise<ConnectorResponse> {
        return new Promise(async (resolve) => {
            const connectorFiles: string[] = [];
            const uiSchemas = path.join(params.path, "uischema");
            if (fs.existsSync(uiSchemas)) {
                const connectorFilesList = fs.readdirSync(uiSchemas);
                connectorFilesList.forEach(file => {
                    const connectorFile = fs.readFileSync(path.join(uiSchemas, file), "utf8");
                    connectorFiles.push(connectorFile);
                });
            }
            resolve({ data: connectorFiles });
        });
    }

    async getAPIDirectory(): Promise<ApiDirectoryResponse> {
        return new Promise(async (resolve) => {
            let result = '';
            const findSynapseAPIPath = (startPath: string) => {
                const files = fs.readdirSync(startPath);
                for (let i = 0; i < files.length; i++) {
                    const filename = path.join(startPath, files[i]);
                    const stat = fs.lstatSync(filename);
                    if (stat.isDirectory()) {
                        if (filename.includes('synapse-config/api')) {
                            result = filename;
                            return result;
                        } else {
                            result = findSynapseAPIPath(filename);
                        }
                    }
                }
                return result;
            };

            const workspaceFolder = workspace.workspaceFolders;
            if (workspaceFolder) {
                const workspaceFolderPath = workspaceFolder[0].uri.fsPath;
                const synapseAPIPath = findSynapseAPIPath(workspaceFolderPath);
                return synapseAPIPath;
            }
            resolve({ data: "" });
        });
    }

    async createAPI(params: CreateAPIRequest): Promise<CreateAPIResponse> {
        return new Promise(async (resolve) => {
            const { directory, name, context, swaggerDef, type, version } = params;
            let versionAttributes = '';
            let swaggerAttributes = '';
            if (version && type !== 'none') {
                versionAttributes = ` version="${version}" version-type="${type}"`;
            }

            if (swaggerDef) {
                swaggerAttributes = ` publishSwagger="${swaggerDef}"`;
            }

            const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
    <api context="${context}" name="${name}" ${swaggerAttributes}${versionAttributes} xmlns="http://ws.apache.org/ns/synapse">
        <resource methods="GET" uri-template="/resource">
            <inSequence>
            </inSequence>
            <outSequence>
            </outSequence>
            <faultSequence>
            </faultSequence>
        </resource>
    </api>`;

            const filePath = path.join(directory, `${name}.xml`);
            fs.writeFileSync(filePath, xmlData);
            resolve({ path: filePath });
        });
    }

    showErrorMessage(params: ShowErrorMessageRequest): void {
        window.showErrorMessage(params.message);
    }

    closeWebViewNotification(): void {
        // if ("dispose" in view) {
        //     view.dispose();
        // }
    }

    openDiagram(params: OpenDiagramRequest): void {
        openView({ view: "Diagram", documentUri: params.path });
    }

    async getEndpointDirectory(): Promise<EndpointDirectoryResponse> {
        return new Promise(async (resolve) => {
            let result = '';
            const findSynapseEndpointPath = (startPath: string) => {
                const files = fs.readdirSync(startPath);
                for (let i = 0; i < files.length; i++) {
                    const filename = path.join(startPath, files[i]);
                    const stat = fs.lstatSync(filename);
                    if (stat.isDirectory()) {
                        if (filename.includes('synapse-config/endpoints')) {
                            result = filename;
                            return result;
                        } else {
                            result = findSynapseEndpointPath(filename);
                        }
                    }
                }
                return result;
            };

            const workspaceFolder = workspace.workspaceFolders;
            if (workspaceFolder) {
                const workspaceFolderPath = workspaceFolder[0].uri.fsPath;
                const synapseEndpointPath = findSynapseEndpointPath(workspaceFolderPath);
                return synapseEndpointPath;
            }
            resolve({ data: "" });
        });
    }

    async createEndpoint(params: CreateEndpointRequest): Promise<CreateEndpointResponse> {
        return new Promise(async (resolve) => {
            const { directory, name, address, configuration, method, type, uriTemplate } = params;
            const endpointType = type.split(" ")[0].toLowerCase();

            let endpointAttributes = `${endpointType}`;
            let otherAttributes = '';
            let closingAttributes = `</${endpointType}>`;
            if (endpointType === 'http') {
                endpointAttributes = `${endpointAttributes} method="${method.toLowerCase()}" uri-template="${uriTemplate}"`;
            } else if (endpointType === 'address') {
                endpointAttributes = `${endpointAttributes} uri="${address}"`;
            } else if (endpointType === 'fail') {
                endpointAttributes = `failover`;
                otherAttributes = `<endpoint name="endpoint_urn_uuid">
            <address uri="http://localhost">`;
                closingAttributes = `       </address>
        </endpoint>
    </failover>`;
            } else if (endpointType === 'load') {
                endpointAttributes = `loadbalance algorithm="org.apache.synapse.endpoints.algorithms.RoundRobin"`;
                otherAttributes = `<endpoint name="endpoint_urn_uuid">
            <address uri="http://localhost">`;
                closingAttributes = `       </address>
        </endpoint>
    </loadbalance>`;
            } else if (endpointType === 'recipient') {
                endpointAttributes = `recipientlist`;
                otherAttributes = `<endpoint>
            <default>`;
                closingAttributes = `       </default>
        </endpoint>
    </recipientlist>`;
            }

            const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<endpoint name="${name}" xmlns="http://ws.apache.org/ns/synapse">
    <${endpointAttributes}>
        ${otherAttributes}
        <suspendOnFailure>
            <initialDuration>-1</initialDuration>
            <progressionFactor>1.0</progressionFactor>
        </suspendOnFailure>
        <markForSuspension>
            <retriesBeforeSuspension>0</retriesBeforeSuspension>
        </markForSuspension>
    ${closingAttributes}
</endpoint>`;

            const filePath = path.join(directory, `${name}.xml`);
            fs.writeFileSync(filePath, xmlData);
            resolve({ path: filePath });
        });
    }

    async getEndpointsAndSequences(): Promise<EndpointsAndSequencesResponse> {
        return new Promise(async (resolve) => {
            const rootPath = workspace.workspaceFolders && workspace.workspaceFolders.length > 0 ?
                workspace.workspaceFolders[0].uri.fsPath
                : undefined;

            if (!!rootPath) {
                const langClient = StateMachine.context().langClient!;
                const resp = await langClient.getProjectStructure(rootPath);

                const endpoints: string[] = [];
                const sequences: string[] = [];

                for (const esbConfig of resp.directoryMap.esbConfigs) {
                    for (const endpoint of esbConfig.esbConfigs.endpoints) {
                        endpoints.push(endpoint.name);
                    }
                    for (const sequence of esbConfig.esbConfigs.sequences) {
                        sequences.push(sequence.name);
                    }
                }
                resolve({ data: [endpoints, sequences] });
            }

            resolve({ data: [] });
        });
    }

    async getSequenceDirectory(): Promise<SequenceDirectoryResponse> {
        return new Promise(async (resolve) => {
            let result = '';
            const findSynapseSequencePath = (startPath: string) => {
                const files = fs.readdirSync(startPath);
                for (let i = 0; i < files.length; i++) {
                    const filename = path.join(startPath, files[i]);
                    const stat = fs.lstatSync(filename);
                    if (stat.isDirectory()) {
                        if (filename.includes('synapse-config/sequences')) {
                            result = filename;
                            return result;
                        } else {
                            result = findSynapseSequencePath(filename);
                        }
                    }
                }
                return result;
            };

            const workspaceFolder = workspace.workspaceFolders;
            if (workspaceFolder) {
                const workspaceFolderPath = workspaceFolder[0].uri.fsPath;
                const synapseSequencePath = findSynapseSequencePath(workspaceFolderPath);
                return synapseSequencePath;
            }
            return "";
        });
    }

    async createSequence(params: CreateSequenceRequest): Promise<CreateSequenceResponse> {
        return new Promise(async (resolve) => {
            const { directory, name, endpoint, onErrorSequence } = params;

            let endpointAttributes = ``;
            let errorSequence = ``;
            if (endpoint) {
                endpointAttributes = `<send>
            <endpoint key="${endpoint.replace(".xml", "")}"/>
        </send>`;
            }

            if (onErrorSequence) {
                errorSequence = `onError="${onErrorSequence}"`;
            }

            const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<sequence name="${name}" ${errorSequence} trace="disable" xmlns="http://ws.apache.org/ns/synapse">
    ${endpointAttributes}
</sequence>`;

            const filePath = path.join(directory, `${name}.xml`);
            fs.writeFileSync(filePath, xmlData);
            resolve({ filePath: filePath });
        });
    }

    async applyEdit(params: ApplyEditRequest): Promise<ApplyEditResponse> {
        return new Promise(async (resolve) => {
            const edit = new WorkspaceEdit();
            let document = workspace.textDocuments.find(doc => doc.uri.fsPath === params.documentUri);

            if (!document) {
                document = await workspace.openTextDocument(Uri.parse(params.documentUri));
            }

            const range = new Range(new Position(params.range.start.line, params.range.start.character),
                new Position(params.range.end.line, params.range.end.character));
            const startLine = document.lineAt(range.start.line).text;
            const startLineIndentation = startLine.match(/^\s*/);
            const endLine = document.lineAt(range.end.line).text;
            const endLineIndentation = endLine.match(/^\s*/);

            const sIndentation = startLineIndentation ? startLineIndentation[0] : "";
            const eIndentation = endLineIndentation ? endLineIndentation[0] : "";
            const textEmpty = params.text.trim().length === 0;
            const textBefore = startLine.substring(0, range.start.character).trim();
            const textAfter = endLine.substring(range.end.character).trim();
            let text = params.text;
            if (!textEmpty) {
                text = `${textBefore.length > 0 ? "\n" + sIndentation : ""}${params.text.replace(/\n/g, "\n" + sIndentation)}${textAfter.length > 0 ? "\n" + eIndentation : ""}`;
            }
            edit.replace(Uri.parse(params.documentUri), range, text);
            await workspace.applyEdit(edit);
            resolve({ status: true });
        });
    }

    closeWebView(): void {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    openFile(params: OpenDiagramRequest): void {
        const uri = Uri.file(params.path);
        workspace.openTextDocument(uri).then((document) => {
            window.showTextDocument(document);
        });
    }

    onRefresh(callback: () => void): void {
        // USE THE RPC METHOD TO BROADCAST NOTIFICATIONS TO WEBVIEW
        // EX: RPCLayer._messenger.send
    }

    async getProjectRoot(): Promise<ProjectRootResponse> {
        return new Promise(async (resolve) => {
            const workspaceFolders = workspace.workspaceFolders;
            if (workspaceFolders) {
                resolve({ path: workspaceFolders[0].uri.fsPath });
            }
            resolve({ path: "" });
        });
    }

    async askProjectDirPath(): Promise<ProjectDirResponse> {
        return new Promise(async (resolve) => {
            const selectedDir = await askProjectPath();
            if (!selectedDir || selectedDir.length === 0) {
                window.showErrorMessage('A folder must be selected to create project');
                resolve({ path: "" });
            } else {
                const parentDir = selectedDir[0].fsPath;
                resolve({ path: parentDir });
            }
        });
    }

    async createProject(params: CreateProjectRequest): Promise<CreateProjectResponse> {
        return new Promise(async (resolve) => {
            const { directory, name } = params;

            const folderStructure: FileStructure = {
                [name]: { // Project folder
                    '.project': projectFileContent(name),
                    'pom.xml': rootPomXmlContent(name),
                    [`${name}CompositeExporter`]: {
                        '.project': compositeProjectContent(name),
                        'pom.xml': compositePomXmlContent(name, directory),
                    },
                    [`${name}Configs`]: {
                        'artifact.xml': artifactsContent(),
                        '.project': configsProjectContent(name),
                        'pom.xml': configsPomXmlContent(name, directory),
                        'src': {
                            'main': {
                                'resources': {
                                    'metadata': '',
                                },
                                'synapse-config': {
                                    'api': '',
                                    'endpoints': '',
                                    'inbound-endpoints': '',
                                    'local-entries': '',
                                    'message-processors': '',
                                    'message-stores': '',
                                    'proxy-services': '',
                                    'sequences': '',
                                    'tasks': '',
                                    'templates': '',
                                },
                            },
                        },
                        'test': {
                            'resources': {
                                'mock-services': '',
                            },
                        },
                    },
                },
            };

            createFolderStructure(directory, folderStructure);

            window.showInformationMessage(`Successfully created ${name} project`);

            commands.executeCommand('vscode.openFolder', Uri.file(`${directory}/${name}`));

            return `${directory}/${name}`;
        });
    }

    async getESBConfigs(): Promise<ESBConfigsResponse> {
        return new Promise(async (resolve) => {
            const rootPath = workspace.workspaceFolders && workspace.workspaceFolders.length > 0 ?
                workspace.workspaceFolders[0].uri.fsPath
                : undefined;

            if (!!rootPath) {
                const langClient = StateMachine.context().langClient!;
                const resp = await langClient.getProjectStructure(rootPath);

                const ESBConfigs: string[] = [];

                for (const esbConfig of resp.directoryMap.esbConfigs) {
					const config = esbConfig.name;
                    ESBConfigs.push(config);
                }
                resolve({ data: ESBConfigs });
            }

            resolve({ data: [] });
        });
    }
}

export async function askProjectPath() {
    return await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: Uri.file(os.homedir()),
        title: "Select a folder to create the Project"
    });
}
