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
    AIUserInput,
    AI_EVENT_TYPE,
    ApiDirectoryResponse,
    ApplyEditRequest,
    ApplyEditResponse,
    BrowseFileRequest,
    BrowseFileResponse,
    CommandsRequest,
    CommandsResponse,
    Connector,
    ConnectorRequest,
    ConnectorResponse,
    ConnectorsResponse,
    CreateAPIRequest,
    CreateAPIResponse,
    CreateClassMediatorRequest,
    CreateClassMediatorResponse,
    CreateConnectionRequest,
    CreateConnectionResponse,
    CreateDataSourceResponse,
    CreateEndpointRequest,
    CreateEndpointResponse,
    CreateInboundEndpointRequest,
    CreateInboundEndpointResponse,
    CreateLocalEntryRequest,
    CreateLocalEntryResponse,
    CreateMessageProcessorRequest,
    CreateMessageProcessorResponse,
    CreateMessageStoreRequest,
    CreateMessageStoreResponse,
    CreateProjectRequest,
    CreateProjectResponse,
    CreateProxyServiceRequest,
    CreateProxyServiceResponse,
    CreateRegistryResourceRequest,
    CreateRegistryResourceResponse,
    CreateSequenceRequest,
    CreateSequenceResponse,
    CreateTaskRequest,
    CreateTaskResponse,
    CreateTemplateRequest,
    CreateTemplateResponse,
    DataSourceTemplate,
    DeleteArtifactRequest,
    DownloadConnectorRequest,
    DownloadConnectorResponse,
    ESBConfigsResponse,
    EVENT_TYPE,
    EndpointDirectoryResponse,
    EndpointsAndSequencesResponse,
    ExportProjectRequest,
    FileDirResponse,
    FileStructure,
    GetAllArtifactsRequest,
    GetAllArtifactsResponse,
    GetAllRegistryPathsRequest,
    GetAllRegistryPathsResponse,
    GetAvailableConnectorRequest,
    GetAvailableConnectorResponse,
    GetAvailableResourcesRequest,
    GetAvailableResourcesResponse,
    GetBackendRootUrlResponse,
    GetConnectionFormRequest,
    GetConnectionFormResponse,
    GetConnectorConnectionsRequest,
    GetConnectorConnectionsResponse,
    GetConnectorFormRequest,
    GetConnectorFormResponse,
    GetDataSourceRequest,
    GetDefinitionRequest,
    GetDefinitionResponse,
    GetDiagnosticsReqeust,
    GetDiagnosticsResponse,
    GetFailoverEPRequest,
    GetFailoverEPResponse,
    GetIconPathUriRequest,
    GetIconPathUriResponse,
    GetInboundEndpointRequest,
    GetInboundEndpointResponse,
    GetLoadBalanceEPRequest,
    GetLoadBalanceEPResponse,
    GetLocalEntryRequest,
    GetLocalEntryResponse,
    GetMessageStoreRequest,
    GetMessageStoreResponse,
    GetProjectRootRequest,
    GetProjectUuidResponse,
    GetRecipientEPRequest,
    GetRecipientEPResponse,
    GetSelectiveWorkspaceContextResponse,
    GetTaskRequest,
    GetTaskResponse,
    GetTemplateEPRequest,
    GetTemplateEPResponse,
    GetTextAtRangeRequest,
    GetTextAtRangeResponse,
    GetUserAccessTokenResponse,
    GetWorkspaceContextResponse,
    HighlightCodeRequest,
    ImportProjectRequest,
    ImportProjectResponse,
    ListRegistryArtifactsRequest,
    MACHINE_VIEW,
    MiDiagramAPI,
    MigrateProjectRequest,
    MigrateProjectResponse,
    OpenDiagramRequest,
    POPUP_EVENT_TYPE,
    ProjectDirResponse,
    ProjectRootResponse,
    RangeFormatRequest,
    RegistryArtifactNamesResponse,
    RetrieveAddressEndpointRequest,
    RetrieveAddressEndpointResponse,
    RetrieveDefaultEndpointRequest,
    RetrieveDefaultEndpointResponse,
    RetrieveHttpEndpointRequest,
    RetrieveHttpEndpointResponse,
    RetrieveMessageProcessorRequest,
    RetrieveMessageProcessorResponse,
    RetrieveTemplateRequest,
    RetrieveTemplateResponse,
    RetrieveWsdlEndpointRequest,
    RetrieveWsdlEndpointResponse,
    SequenceDirectoryResponse,
    ShowErrorMessageRequest,
    TemplatesResponse,
    UndoRedoParams,
    UpdateAddressEndpointRequest,
    UpdateAddressEndpointResponse,
    UpdateConnectorRequest,
    UpdateDefaultEndpointRequest,
    UpdateDefaultEndpointResponse,
    UpdateFailoverEPRequest,
    UpdateFailoverEPResponse,
    UpdateHttpEndpointRequest,
    UpdateHttpEndpointResponse,
    UpdateLoadBalanceEPRequest,
    UpdateLoadBalanceEPResponse,
    UpdateRecipientEPRequest,
    UpdateRecipientEPResponse,
    UpdateTemplateEPRequest,
    UpdateTemplateEPResponse,
    UpdateWsdlEndpointRequest,
    UpdateWsdlEndpointResponse,
    WriteContentToFileRequest,
    WriteContentToFileResponse,
    getSTRequest,
    getSTResponse,
} from "@wso2-enterprise/mi-core";
import axios from 'axios';
import { error } from "console";
import * as fs from "fs";
import { copy } from 'fs-extra';
import fetch from 'node-fetch';
import * as os from 'os';
import { Transform } from 'stream';
import * as tmp from 'tmp';
import { v4 as uuidv4 } from 'uuid';
import * as vscode from 'vscode';
import { Position, Range, Selection, TextEdit, Uri, ViewColumn, WorkspaceEdit, commands, window, workspace } from "vscode";
import { extension } from '../../MIExtensionContext';
import { StateMachineAI } from '../../ai-panel/aiMachine';
import { COMMANDS, DEFAULT_PROJECT_VERSION, MI_COPILOT_BACKEND_URL } from "../../constants";
import { StateMachine, navigate, openView } from "../../stateMachine";
import { openPopupView } from "../../stateMachinePopup";
import { UndoRedoManager } from "../../undoRedoManager";
import { createFolderStructure, getAddressEndpointXmlWrapper, getDefaultEndpointXmlWrapper, getFailoverXmlWrapper, getHttpEndpointXmlWrapper, getInboundEndpointXmlWrapper, getLoadBalanceXmlWrapper, getMessageProcessorXmlWrapper, getMessageStoreXmlWrapper, getProxyServiceXmlWrapper, getRegistryResourceContent, getTaskXmlWrapper, getTemplateEndpointXmlWrapper, getTemplateXmlWrapper, getWsdlEndpointXmlWrapper } from "../../util";
import { addNewEntryToArtifactXML, addSynapseDependency, changeRootPomPackaging, createMetadataFilesForRegistryCollection, detectMediaType, getAvailableRegistryResources, getMediatypeAndFileExtension } from "../../util/fileOperations";
import { importProject } from "../../util/migrationUtils";
import { getDataserviceXml } from "../../util/template-engine/mustach-templates/Dataservice";
import { getClassMediatorContent } from "../../util/template-engine/mustach-templates/classMediator";
import { generateXmlData, writeXmlDataToFile } from "../../util/template-engine/mustach-templates/createLocalEntry";
import { getRecipientEPXml } from "../../util/template-engine/mustach-templates/recipientEndpoint";
import { rootPomXmlContent } from "../../util/templates";
import { replaceFullContentToFile } from "../../util/workspace";
import { VisualizerWebview } from "../../visualizer/webview";
import path = require("path");
import { template } from "lodash";
import { log } from "../../util/logger";

const { XMLParser, XMLBuilder } = require("fast-xml-parser");

const connectorsPath = path.join(".metadata", ".Connectors");

const undoRedo = new UndoRedoManager();

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
                const connectorIconFile = path.join(connectorPath, "icon", `icon - large.png`);
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

            const xmlData =
                `<?xml version="1.0" encoding="UTF-8" ?>
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
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');
            fs.writeFileSync(filePath, sanitizedXmlData);
            await this.rangeFormat({
                uri: filePath,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                }
            });
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
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
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Diagram, documentUri: params.path });
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
            const { directory, name, address, configuration, method, type, uriTemplate, wsdlUri, wsdlService,
                wsdlPort, targetTemplate, uri } = params;
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
            } else if (endpointType === 'wsdl') {
                endpointAttributes = `${endpointAttributes.toLowerCase()} port="${wsdlPort}" service="${wsdlService}" uri="${wsdlUri}"`;
            }

            let xmlData;

            if (endpointType === 'template') {

                xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<endpoint name="${name}" template="${targetTemplate}" uri="${uri}" xmlns="http://ws.apache.org/ns/synapse">
    <description/>
</endpoint>`;

            } else {

                xmlData = `<?xml version="1.0" encoding="UTF-8"?>
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

            }

            const filePath = path.join(directory, `${name}.xml`);
            fs.writeFileSync(filePath, xmlData);
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: filePath });
        });
    }

    async updateLoadBalanceEndpoint(params: UpdateLoadBalanceEPRequest): Promise<UpdateLoadBalanceEPResponse> {
        return new Promise(async (resolve) => {
            const { directory, ...templateParams } = params;
            const xmlData = getLoadBalanceXmlWrapper(templateParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');
            if (params.getContentOnly) {
                resolve({ path: "", content: sanitizedXmlData });
            } else {
                let filePath: string;
                if (directory.endsWith('.xml')) {
                    filePath = directory;
                } else {
                    filePath = path.join(directory, `${templateParams.name}.xml`);
                }

                fs.writeFileSync(filePath, sanitizedXmlData);
                await this.rangeFormat({
                    uri: filePath,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                    }
                });
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                openPopupView(POPUP_EVENT_TYPE.CLOSE_VIEW, { view: null, recentIdentifier: templateParams.name });
                resolve({ path: filePath, content: "" });
            }
        });
    }

    async getLoadBalanceEndpoint(params: GetLoadBalanceEPRequest): Promise<GetLoadBalanceEPResponse> {
        return new Promise(async (resolve) => {
            const endpointSyntaxTree = await this.getSyntaxTree({ documentUri: params.path });
            const filePath = params.path;

            if (filePath.includes('.xml') && fs.existsSync(filePath)) {
                const { name, loadbalance, session, property, description } = endpointSyntaxTree.syntaxTree.endpoint;
                const endpoints = await this.getEndpointsList(loadbalance.endpointOrMember, filePath, true);

                const properties = property.map((prop: any) => ({
                    name: prop.name,
                    value: prop.value,
                    scope: prop.scope ?? 'default'
                }));

                const timeout = session?.sessionTimeout ? Number(session.sessionTimeout) : 0;

                resolve({
                    name,
                    algorithm: loadbalance.algorithm === 'roundRobin' ? 'org.apache.synapse.endpoints.algorithms.RoundRobin' : loadbalance.algorithm,
                    failover: String(loadbalance.failover) ?? 'false',
                    buildMessage: String(loadbalance.buildMessage) ?? 'false',
                    sessionManagement: session?.type ?? 'none',
                    sessionTimeout: timeout,
                    description: description ?? '',
                    endpoints: endpoints.length > 0 ? endpoints : [],
                    properties: properties.length > 0 ? properties : []
                });
            }

            resolve({
                name: '',
                algorithm: 'org.apache.synapse.endpoints.algorithms.RoundRobin',
                failover: 'true',
                buildMessage: 'false',
                sessionManagement: 'none',
                sessionTimeout: 0,
                description: '',
                endpoints: [],
                properties: []
            });
        });
    }

    async updateFailoverEndpoint(params: UpdateFailoverEPRequest): Promise<UpdateFailoverEPResponse> {
        return new Promise(async (resolve) => {
            const { directory, ...templateParams } = params;
            const xmlData = getFailoverXmlWrapper(templateParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');
            if (params.getContentOnly) {
                resolve({ path: "", content: sanitizedXmlData });
            } else {
                let filePath: string;
                if (directory.endsWith('.xml')) {
                    filePath = directory;
                } else {
                    filePath = path.join(directory, `${templateParams.name}.xml`);
                }

                fs.writeFileSync(filePath, sanitizedXmlData);
                await this.rangeFormat({
                    uri: filePath,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                    }
                });
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                openPopupView(POPUP_EVENT_TYPE.CLOSE_VIEW, { view: null, recentIdentifier: templateParams.name });
                resolve({ path: filePath, content: "" });
            }
        });
    }

    async getFailoverEndpoint(params: GetFailoverEPRequest): Promise<GetFailoverEPResponse> {
        return new Promise(async (resolve) => {
            const endpointSyntaxTree = await this.getSyntaxTree({ documentUri: params.path });
            const filePath = params.path;

            if (filePath.includes('.xml') && fs.existsSync(filePath)) {
                const { name, failover, property, description } = endpointSyntaxTree.syntaxTree.endpoint;
                const endpoints = await this.getEndpointsList(failover.endpoint, filePath, false);

                const properties = property.map((prop: any) => ({
                    name: prop.name,
                    value: prop.value,
                    scope: prop.scope ?? 'default'
                }));

                resolve({
                    name,
                    buildMessage: String(failover.buildMessage) ?? 'false',
                    description: description ?? '',
                    endpoints: endpoints.length > 0 ? endpoints : [],
                    properties: properties.length > 0 ? properties : []
                });
            }

            resolve({
                name: '',
                buildMessage: 'true',
                description: '',
                endpoints: [],
                properties: []
            });
        });
    }

    async updateRecipientEndpoint(params: UpdateRecipientEPRequest): Promise<UpdateRecipientEPResponse> {
        return new Promise(async (resolve) => {
            const { directory, ...templateParams } = params;
            const xmlData = getRecipientEPXml(templateParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');
            if (params.getContentOnly) {
                resolve({ path: "", content: sanitizedXmlData });
            } else {
                let filePath: string;
                if (directory.endsWith('.xml')) {
                    filePath = directory;
                } else {
                    filePath = path.join(directory, `${templateParams.name}.xml`);
                }

                fs.writeFileSync(filePath, sanitizedXmlData);
                await this.rangeFormat({
                    uri: filePath,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                    }
                });
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                openPopupView(POPUP_EVENT_TYPE.CLOSE_VIEW, { view: null, recentIdentifier: templateParams.name });
                resolve({ path: filePath, content: "" });
            }
        });
    }

    async getRecipientEndpoint(params: GetRecipientEPRequest): Promise<GetRecipientEPResponse> {
        return new Promise(async (resolve) => {
            const endpointSyntaxTree = await this.getSyntaxTree({ documentUri: params.path });
            const filePath = params.path;

            if (filePath.includes('.xml') && fs.existsSync(filePath)) {
                const { name, recipientlist, property, description } = endpointSyntaxTree.syntaxTree.endpoint;
                const endpoints = await this.getEndpointsList(recipientlist.endpoint, filePath, false);

                const properties = property.map((prop: any) => ({
                    name: prop.name,
                    value: prop.value,
                    scope: prop.scope ?? 'default'
                }));

                resolve({
                    name,
                    description: description ?? '',
                    endpoints: endpoints.length > 0 ? endpoints : [],
                    properties: properties.length > 0 ? properties : []
                });
            }

            resolve({
                name: '',
                description: '',
                endpoints: [],
                properties: []
            });
        });
    }

    async updateTemplateEndpoint(params: UpdateTemplateEPRequest): Promise<UpdateTemplateEPResponse> {
        return new Promise(async (resolve) => {
            const { directory, ...templateParams } = params;
            const xmlData = getTemplateEndpointXmlWrapper(templateParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');
            if (params.getContentOnly) {
                resolve({ path: "", content: sanitizedXmlData });
            } else {
                let filePath: string;
                if (directory.endsWith('.xml')) {
                    filePath = directory;
                } else {
                    filePath = path.join(directory, `${templateParams.name}.xml`);
                }

                fs.writeFileSync(filePath, sanitizedXmlData);
                await this.rangeFormat({
                    uri: filePath,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                    }
                });
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                openPopupView(POPUP_EVENT_TYPE.CLOSE_VIEW, { view: null, recentIdentifier: templateParams.name });
                resolve({ path: filePath, content: "" });
            }
        });
    }

    async getTemplateEndpoint(params: GetTemplateEPRequest): Promise<GetTemplateEPResponse> {
        return new Promise(async (resolve) => {
            const endpointSyntaxTree = await this.getSyntaxTree({ documentUri: params.path });
            const filePath = params.path;

            if (filePath.includes('.xml') && fs.existsSync(filePath)) {
                const { name, uri, template, description, parameter } = endpointSyntaxTree.syntaxTree.endpoint;

                const parameters = parameter.map((prop: any) => ({
                    name: prop.name,
                    value: prop.value,
                }));

                resolve({
                    name,
                    uri: uri ?? '',
                    template,
                    description: description ?? '',
                    parameters: parameters.length > 0 ? parameters : []
                });
            }

            resolve({
                name: '',
                uri: '',
                template: '',
                description: '',
                parameters: []
            });
        });
    }

    async createLocalEntry(params: CreateLocalEntryRequest): Promise<CreateLocalEntryResponse> {
        return new Promise(async (resolve) => {
            const { directory, name, type, value, URL } = params;
            const xmlData = generateXmlData(name, type, value, URL);
            let filePath = directory;

            if (filePath.includes('localEntries')) {
                filePath = filePath.replace('localEntries', 'local-entries');
            }
            if (filePath.endsWith('.xml')) {
                filePath = directory;
            } else {
                filePath = path.join(filePath, `${name}.xml`);
            }

            if (params.getContentOnly) {
                resolve({ filePath: "", fileContent: xmlData });
            } else {
                writeXmlDataToFile(filePath, xmlData);
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                resolve({ filePath: filePath, fileContent: "" });
            }
        });
    }

    async getLocalEntry(params: GetLocalEntryRequest): Promise<GetLocalEntryResponse> {
        const options = {
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            attributeNamePrefix: "",
            attributesGroupName: "@_",
            indentBy: '    ',
            format: true,
        };
        const parser = new XMLParser(options);

        return new Promise(async (resolve) => {
            const filePath = params.path;
            if (fs.existsSync(filePath)) {
                const xmlData = fs.readFileSync(filePath, "utf8");
                const jsonData = parser.parse(xmlData);
                const response: GetLocalEntryResponse = {
                    name: jsonData.localEntry["@_"]["key"],
                    type: "",
                    inLineTextValue: "",
                    inLineXmlValue: "",
                    sourceURL: ""
                };
                if (jsonData && jsonData.localEntry) {
                    const firstEntryKey = Object.keys(jsonData.localEntry)[0];
                    if (jsonData.localEntry["#text"] ) {
                        response.type = "In-Line Text Entry";
                        response.inLineTextValue = jsonData.localEntry["#text"];
                    } else if (firstEntryKey) {
                        response.type = "In-Line XML Entry";
                        const firstEntryKey = Object.keys(jsonData.localEntry)[0];
                        if(firstEntryKey){
                            const xmlObj = {
                                [firstEntryKey]: {
                                    ...jsonData.localEntry[firstEntryKey]
                                }
                            }
                            const builder = new XMLBuilder(options);
                            let xml = builder.build(xmlObj).replace(/&apos;/g, "'");
                            response.inLineXmlValue = xml;
                        }
                    } else if (jsonData.localEntry["@_"]["src"]) {
                        response.type = "Source URL Entry";
                        response.sourceURL = jsonData.localEntry["@_"]["src"];
                    }
                }
                resolve(response);
            }
            else {
                return error("File not found");
            }
        });
    }

    async createMessageStore(params: CreateMessageStoreRequest): Promise<CreateMessageStoreResponse> {
        return new Promise(async (resolve) => {

            const getTemplateParams = params;

            const xmlData = getMessageStoreXmlWrapper(getTemplateParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');
            let filePath = params.directory;

            if (filePath.includes('messageStores')) {
                filePath = filePath.replace('messageStores', 'message-stores');
            }
            if (filePath.endsWith('.xml')) {
                filePath = params.directory;
            } else {
                filePath = path.join(filePath, `${params.name}.xml`);
            }

            fs.writeFileSync(filePath, sanitizedXmlData);
            await this.rangeFormat({
                uri: filePath,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                }
            });
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: filePath });
        });
    }

    async getMessageStore(params: GetMessageStoreRequest): Promise<GetMessageStoreResponse> {
        const options = {
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            attributeNamePrefix: "@_",
            attributesGroupName: "@_"
        };
        interface Parameter {
            name: string,
            value: string
        }
        const parser = new XMLParser(options);
        return new Promise(async (resolve) => {
            const filePath = params.path;
            if (fs.existsSync(filePath)) {
                const xmlData = fs.readFileSync(filePath, "utf8");
                const jsonData = parser.parse(xmlData);
                let parameters: Parameter[] = [];
                let customParameters: Parameter[] = [];
                const className = jsonData.messageStore["@_"]["@_class"];
                const response: GetMessageStoreResponse = {
                    name: jsonData.messageStore["@_"]["@_name"],
                    type: '',
                    initialContextFactory: '',
                    connectionFactory: '',
                    providerURL: '',
                    jndiQueueName: '',
                    userName: '',
                    password: '',
                    cacheConnection: false,
                    jmsAPIVersion: '',
                    enableProducerGuaranteedDelivery: false,
                    rabbitMQServerHostName: '',
                    rabbitMQServerPort: '',
                    sslEnabled: false,
                    rabbitMQQueueName: '',
                    rabbitMQExchangeName: '',
                    routineKey: '',
                    virtualHost: '',
                    trustStoreLocation: '',
                    trustStorePassword: '',
                    trustStoreType: '',
                    keyStoreLocation: '',
                    keyStorePassword: '',
                    keyStoreType: '',
                    dataBaseTable: '',
                    driver: '',
                    url: '',
                    user: '',
                    dataSourceName: '',
                    queueConnectionFactory: '',
                    pollingCount: '',
                    xPath: '',
                    providerClass: '',
                    customParameters: [] as Parameter[],
                    sslVersion: "",
                    failOverMessageStore: "",
                    namespaces: []
                };
                switch (className) {
                    case 'org.apache.synapse.message.store.impl.jms.JmsStore':
                        response.type = 'JMS Message Store';
                        break;
                    case 'org.apache.synapse.message.store.impl.jdbc.JDBCMessageStore':
                        response.type = 'JDBC Message Store';
                        break;
                    case 'org.apache.synapse.message.store.impl.rabbitmq.RabbitMQStore':
                        response.type = 'RabbitMQ Message Store';
                        break;
                    case 'org.apache.synapse.message.store.impl.resequencer.ResequenceMessageStore':
                        response.type = 'Resequence Message Store';
                        break;
                    case 'org.apache.synapse.message.store.impl.memory.InMemoryStore':
                        response.type = 'In Memory Message Store';
                        break;
                    default:
                        response.type = 'Custom Message Store';
                        break;
                }
                if (jsonData && jsonData.messageStore && jsonData.messageStore.parameter) {

                    const xmlnsValues: { prefix: string, uri: string }[] = [];
                    if (Array.isArray(jsonData.messageStore.parameter)) {
                        jsonData.messageStore.parameter.forEach((element) => {
                            if (element["@_"]['@_name'] === 'store.resequence.id.path') {
                                for (const key in element["@_"]) {
                                    if (key.startsWith('@_xmlns')) {
                                        const [_, prefix, value] = key.split(':');
                                        const xmlnsValue = element["@_"][key];
                                        xmlnsValues.push({ prefix, uri: xmlnsValue });
                                    }
                                }
                            }
                        });
                    }
                    response.namespaces = xmlnsValues;

                    parameters = Array.isArray(jsonData.messageStore.parameter)
                        ? jsonData.messageStore.parameter.map((param: any) => ({
                            name: param["@_"]['@_name'],
                            value: param['#text'] ?? param["@_"]["@_expression"]
                        }))
                        : [{
                            name: jsonData.messageStore.parameter["@_"]['@_name'],
                            value: jsonData.messageStore.parameter['#text']
                        }];
                    const MessageStoreModel = {
                        'java.naming.factory.initial': 'initialContextFactory',
                        'java.naming.provider.url': 'providerURL',
                        'store.jms.connection.factory': 'connectionFactory',
                        'connectionfactory.QueueConnectionFactory': 'queueConnectionFactory',
                        'store.jms.destination': 'jndiQueueName',
                        'store.jms.username': 'userName',
                        'store.jms.password': 'password',
                        'store.jms.cache.connection': 'cacheConnection',
                        'store.jms.JMSSpecVersion': 'jmsAPIVersion',
                        'store.producer.guaranteed.delivery.enable': 'enableProducerGuaranteedDelivery',
                        'rabbitmq.connection.ssl.truststore.location': 'trustStoreLocation',
                        'rabbitmq.connection.ssl.truststore.password': 'trustStorePassword',
                        'rabbitmq.connection.ssl.truststore.type': 'trustStoreType',
                        'rabbitmq.connection.ssl.keystore.location': 'keyStoreLocation',
                        'rabbitmq.connection.ssl.keystore.password': 'keyStorePassword',
                        'rabbitmq.connection.ssl.keystore.type': 'keyStoreType',
                        'rabbitmq.connection.ssl.version': 'sslVersion',
                        'rabbitmq.connection.ssl.enabled': 'sslEnabled',
                        'store.jdbc.table': 'dataBaseTable',
                        'store.jdbc.driver': 'driver',
                        'store.jdbc.connection.url': 'url',
                        'store.jdbc.username': 'user',
                        'store.jdbc.password': 'password',
                        'store.jdbc.dsName': 'dataSourceName',
                        'store.rabbitmq.username': 'userName',
                        'store.rabbitmq.password': 'password',
                        'store.rabbitmq.host.name': 'rabbitMQServerHostName',
                        'store.rabbitmq.host.port': 'rabbitMQServerPort',
                        'store.rabbitmq.exchange.name': 'rabbitMQExchangeName',
                        'store.rabbitmq.queue.name': 'rabbitMQQueueName',
                        'store.rabbitmq.route.key': 'routineKey',
                        'store.rabbitmq.virtual.host': 'virtualHost',
                        'store.resequence.timeout': 'pollingCount',
                        'store.resequence.id.path': 'xPath',
                        'store.failover.message.store.name': 'failOverMessageStore'
                    }
                    if (response.type !== 'Custom Message Store') {
                        parameters.forEach((param: Parameter) => {
                            if (MessageStoreModel.hasOwnProperty(param.name)) {
                                response[MessageStoreModel[param.name]] = param.value;
                            }
                        });
                        if (response.queueConnectionFactory) {
                            response.type = 'WSO2 MB Message Store';
                        }
                    } else {
                        parameters.forEach((param: Parameter) => {
                            customParameters.push({ name: param.name, value: param.value });
                        });
                        response.providerClass = className;
                        response.customParameters = customParameters;
                    }
                }
                resolve(response);
            }
            else {
                return error("File not found");
            }
        });
    }

    async createInboundEndpoint(params: CreateInboundEndpointRequest): Promise<CreateInboundEndpointResponse> {
        return new Promise(async (resolve) => {
            const { directory, ...templateParams } = params;

            let filePath: string = directory;
            templateParams.type = templateParams.type.toLowerCase();

            if (filePath.includes('inboundEndpoints')) {
                filePath = filePath.replace('inboundEndpoints', 'inbound-endpoints');
            }

            if (filePath.endsWith('.xml')) {
            } else {
                filePath = path.join(filePath, `${templateParams.name}.xml`);
            }

            const xmlData = getInboundEndpointXmlWrapper(templateParams);

            fs.writeFileSync(filePath, xmlData);
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: filePath });
        });
    }

    async getInboundEndpoint(params: GetInboundEndpointRequest): Promise<GetInboundEndpointResponse> {
        const options = {
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            attributeNamePrefix: "@_",
        };
        const parser = new XMLParser(options);
        return new Promise(async (resolve) => {
            const filePath = params.path;

            if (filePath.includes('.xml') && fs.existsSync(filePath)) {
                const xmlData = fs.readFileSync(filePath, "utf8");
                const jsonData = parser.parse(xmlData);

                let isWso2Mb = false;
                const params: { [key: string]: string | number | boolean } = {};
                if (Array.isArray(jsonData.inboundEndpoint.parameters.parameter)) {
                    jsonData.inboundEndpoint.parameters.parameter.map((param: any) => {
                        if (param["@_name"] === 'rabbitmq.channel.consumer.qos') {
                            params["rabbitmq.channel.consumer.qos.type"] = param["@_key"] ? 'registry' : 'inline';
                        }
                        if (param["@_name"] === 'connectionfactory.TopicConnectionFactory' || param["@_name"] === 'connectionfactory.QueueConnectionFactory') {
                            params["mb.connection.url"] = param["#text"];
                            isWso2Mb = true;
                        }
                        if (jsonData.inboundEndpoint["@_protocol"] === 'kafka' && (param["@_name"] === 'topics' || param["@_name"] === 'topic.filter')) {
                            params["topics"] = param["@_name"];
                            params["topic.name"] = param["#text"];
                        }
                        params[param["@_name"]] = param["#text"] ?? param["@_key"];
                    });
                } else {
                    params[jsonData.inboundEndpoint.parameters.parameter["@_name"]] = jsonData.inboundEndpoint.parameters.parameter["#text"];
                }

                if (jsonData.inboundEndpoint["@_class"]) {
                    params["class"] = jsonData.inboundEndpoint["@_class"];
                }

                const response: GetInboundEndpointResponse = {
                    name: jsonData.inboundEndpoint["@_name"],
                    type: isWso2Mb ? 'wso2_mb' : jsonData.inboundEndpoint["@_protocol"] ?? 'custom',
                    sequence: jsonData.inboundEndpoint["@_sequence"],
                    errorSequence: jsonData.inboundEndpoint["@_onError"],
                    parameters: params,
                    suspend: jsonData.inboundEndpoint["@_suspend"] === 'true',
                    trace: jsonData.inboundEndpoint["@_trace"] ? true : false,
                    statistics: jsonData.inboundEndpoint["@_statistics"] ? true : false,
                };

                resolve(response);
            }

            resolve({
                name: '',
                type: '',
                sequence: '',
                errorSequence: '',
                parameters: {},
                suspend: false,
                trace: false,
                statistics: false,
            });
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
                const artifacts = (resp.directoryMap as any).src.main.wso2mi.artifacts;

                const endpoints: string[] = [];
                const sequences: string[] = [];

                for (const endpoint of artifacts.endpoints) {
                    endpoints.push(endpoint.name);
                }

                for (const sequence of artifacts.sequences) {
                    sequences.push(sequence.name);
                }

                resolve({ data: [endpoints, sequences] });
            }

            resolve({ data: [] });
        });
    }

    async getTemplates(): Promise<TemplatesResponse> {
        return new Promise(async (resolve) => {
            const rootPath = workspace.workspaceFolders && workspace.workspaceFolders.length > 0 ?
                workspace.workspaceFolders[0].uri.fsPath
                : undefined;

            if (!!rootPath) {
                const langClient = StateMachine.context().langClient!;
                const resp = await langClient.getProjectStructure(rootPath);
                const artifacts = (resp.directoryMap as any).src.main.wso2mi.artifacts;

                const templates: string[] = [];

                for (const template of artifacts.templates) {
                    templates.push(template.name);
                }

                resolve({ data: templates });
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
            const { directory, name, endpoint, onErrorSequence, statistics, trace } = params;

            let endpointAttributes = ``;
            let errorSequence = ``;
            let statisticsAttribute = ``;
            let traceAttribute = ``;
            if (endpoint) {
                endpointAttributes = `<send>
          <endpoint key="${endpoint.replace(".xml", "")}"/>
      </send>`;
            }

            if (onErrorSequence) {
                errorSequence = `onError="${onErrorSequence}"`;
            }
            if (statistics) {
                statisticsAttribute = `statistics="enable"`;
            }
            if (trace) {
                traceAttribute = `trace="enable"`;
            } else {
                traceAttribute = `trace="disable"`;
            }

            const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<sequence name="${name}" ${errorSequence} ${traceAttribute} ${statisticsAttribute} xmlns="http://ws.apache.org/ns/synapse">
  ${endpointAttributes}
</sequence>`;

            if (params.getContentOnly) {
                resolve({ filePath: "", fileContent: xmlData });
            } else {
                const filePath = path.join(directory, `${name}.xml`);
                fs.writeFileSync(filePath, xmlData);
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                resolve({ filePath: filePath, fileContent: "" });
            }
        });
    }

    async createProxyService(params: CreateProxyServiceRequest): Promise<CreateProxyServiceResponse> {
        return new Promise(async (resolve) => {
            const { directory, proxyServiceName, proxyServiceType, selectedTransports, endpointType, endpoint,
                requestLogLevel, responseLogLevel, securityPolicy, requestXslt, responseXslt, transformResponse,
                wsdlUri, wsdlService, wsdlPort, publishContract } = params;

            const getTemplateParams = {
                proxyServiceName, proxyServiceType, selectedTransports, endpointType, endpoint,
                requestLogLevel, responseLogLevel, securityPolicy, requestXslt, responseXslt, transformResponse,
                wsdlUri, wsdlService, wsdlPort, publishContract
            };

            const xmlData = getProxyServiceXmlWrapper(getTemplateParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

            const filePath = path.join(directory, `${proxyServiceName}.xml`);
            fs.writeFileSync(filePath, sanitizedXmlData);
            await this.rangeFormat({
                uri: filePath,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                }
            });
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: filePath });
        });
    }

    async createTask(params: CreateTaskRequest): Promise<CreateTaskResponse> {
        return new Promise(async (resolve) => {
            const { directory, ...templateParams } = params;
            // limit saving default values
            const tempParams = templateParams.taskProperties.filter((prop: any) =>
                prop.value !== '' && prop.value !== undefined && prop.value !== false);
            const mustacheParams = {
                ...templateParams,
                taskProperties: tempParams
            };
            const xmlData = getTaskXmlWrapper(mustacheParams);

            let filePath: string;

            if (directory.endsWith('.xml')) {
                filePath = directory;
            } else {
                filePath = path.join(directory, `${templateParams.name}.xml`);
            }

            fs.writeFileSync(filePath, xmlData);
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: filePath });
        });
    }

    async getTask(params: GetTaskRequest): Promise<GetTaskResponse> {
        const options = {
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            attributeNamePrefix: "@_",
            attributesGroupName: "@_"
        };
        const parser = new XMLParser(options);
        return new Promise(async (resolve) => {
            const filePath = params.path;

            if (filePath.includes('.xml') && fs.existsSync(filePath)) {
                const xmlData = fs.readFileSync(filePath, "utf8");
                const jsonData = parser.parse(xmlData);

                const response: GetTaskResponse = {
                    name: jsonData.task["@_"]["@_name"],
                    group: jsonData.task["@_"]["@_group"],
                    implementation: jsonData.task["@_"]["@_class"],
                    pinnedServers: jsonData.task["@_"]["@_pinnedServers"],
                    triggerType: 'simple',
                    triggerCount: 1,
                    triggerInterval: 1,
                    triggerCron: '',
                    taskProperties: []
                };

                if (jsonData.task.trigger["@_"]["@_count"] !== undefined) {
                    response.triggerCount = Number(jsonData.task.trigger["@_"]["@_count"]);
                    response.triggerInterval = Number(jsonData.task.trigger["@_"]["@_interval"]);
                }
                else if (jsonData.task.trigger["@_"]["@_cron"] !== undefined) {
                    response.triggerType = 'cron';
                    response.triggerCron = jsonData.task.trigger["@_"]["@_cron"];
                }
                if (jsonData.task.property) {
                    response.taskProperties = Array.isArray(jsonData.task.property) ?
                        jsonData.task.property.map((prop: any) => ({
                            key: prop["@_"]["@_name"],
                            value: prop["@_"]["@_value"],
                            isLiteral: true
                        })) :
                        [{
                            key: jsonData.task.property["@_"]["@_name"],
                            value: jsonData.task.property["@_"]["@_value"],
                            isLiteral: true
                        }];
                    const builder = new XMLBuilder(options);
                    const message = jsonData.task.property.filter((prop: any) => prop["@_"]["@_name"] === "message");
                    if (message.length > 0) {
                        response.taskProperties = response.taskProperties.filter(prop => prop.key !== "message");
                        if (message[0]["@_"]["@_value"] === undefined) {
                            delete message[0]["@_"];
                            let xml = builder.build(message[0]);
                            response.taskProperties.push({
                                key: "message",
                                value: xml,
                                isLiteral: false
                            });
                        } else {
                            response.taskProperties.push({
                                key: "message",
                                value: message[0]["@_"]["@_value"],
                                isLiteral: true
                            });
                        }
                    }
                    resolve(response);
                }

                resolve({
                    name: '',
                    group: '',
                    implementation: '',
                    pinnedServers: '',
                    triggerType: 'simple',
                    triggerCount: 1,
                    triggerInterval: 1,
                    triggerCron: '',
                    taskProperties: []
                });
            }
        });
    }

    async createTemplate(params: CreateTemplateRequest): Promise<CreateTemplateResponse> {
        return new Promise(async (resolve) => {
            const {
                directory, templateName, templateType, address, uriTemplate, httpMethod,
                wsdlUri, wsdlService, wsdlPort, traceEnabled, statisticsEnabled, parameters } = params;

            const getTemplateParams = {
                templateName, templateType, address, uriTemplate, httpMethod,
                wsdlUri, wsdlService, wsdlPort, traceEnabled, statisticsEnabled, parameters
            };

            const xmlData = getTemplateXmlWrapper(getTemplateParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

            if (params.getContentOnly) {
                resolve({ path: "", content: sanitizedXmlData });
            } else {
                let filePath: string;
                if (directory.endsWith('.xml')) {
                    filePath = directory;
                } else {
                    filePath = path.join(directory, `${templateName}.xml`);
                }
                fs.writeFileSync(filePath, sanitizedXmlData);
                await this.rangeFormat({
                    uri: filePath,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                    }
                });
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                resolve({ path: filePath, content: "" });
            }
        });
    }

    async getTemplate(params: RetrieveTemplateRequest): Promise<RetrieveTemplateResponse> {
        const options = {
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            attributeNamePrefix: "@_",
            attributesGroupName: "@_"
        };
        const parser = new XMLParser(options);

        interface Parameter {
            name: string;
            value: string;
        }

        return new Promise(async (resolve) => {
            const filePath = params.path;

            if (fs.existsSync(filePath)) {
                const xmlData = fs.readFileSync(filePath, "utf8");
                const jsonData = parser.parse(xmlData);
                let response: RetrieveTemplateResponse = {
                    templateName: jsonData.template["@_"]["@_name"],
                    templateType: '',
                    address: '',
                    uriTemplate: '',
                    httpMethod: '',
                    wsdlUri: '',
                    wsdlService: '',
                    wsdlPort: null,
                    traceEnabled: false,
                    statisticsEnabled: false,
                    parameters: []
                };

                if (jsonData.template.endpoint?.address) {
                    response.templateType = 'Address Endpoint Template';
                    response.address = jsonData.template.endpoint.address["@_"]["@_uri"];
                } else if (jsonData.template.endpoint?.default) {
                    response.templateType = 'Default Endpoint Template';
                } else if (jsonData.template.endpoint?.http) {
                    response.templateType = 'HTTP Endpoint Template';
                    if (jsonData.template.endpoint.http["@_"]["@_method"] !== undefined) {
                        response.httpMethod = jsonData.template.endpoint.http["@_"]["@_method"].toUpperCase();
                    } else {
                        response.httpMethod = 'leave_as_is';
                    }
                    response.uriTemplate = jsonData.template.endpoint.http["@_"]["@_uri-template"];
                } else if (jsonData.template.endpoint?.wsdl) {
                    response.templateType = 'WSDL Endpoint Template';
                    response.wsdlUri = jsonData.template.endpoint.wsdl["@_"]["@_uri"];
                    response.wsdlService = jsonData.template.endpoint.wsdl["@_"]["@_service"];
                    response.wsdlPort = jsonData.template.endpoint.wsdl["@_"]["@_port"];
                } else {
                    response.templateType = 'Sequence Template';
                    if (jsonData.template.sequence["@_"] !== undefined) {
                        response.traceEnabled = jsonData.template.sequence["@_"]["@_trace"] !== undefined;
                        response.statisticsEnabled = jsonData.template.sequence["@_"]["@_statistics"] !== undefined;
                    }
                    if (jsonData.template.parameter != undefined) {
                        const params = jsonData.template.parameter;
                        if (Array.isArray(params)) {
                            params.forEach((param: any) => {
                                response.parameters.push(param["@_"]["@_name"]);
                            });
                        } else {
                            response.parameters.push(params["@_"]["@_name"]);
                        }
                    }
                }

                resolve(response);
            }
        });
    }

    async updateHttpEndpoint(params: UpdateHttpEndpointRequest): Promise<UpdateHttpEndpointResponse> {
        return new Promise(async (resolve) => {
            const { directory, ...getHttpEndpointParams } = params;

            const xmlData = getHttpEndpointXmlWrapper(getHttpEndpointParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

            if (params.getContentOnly) {
                resolve({ path: "", content: sanitizedXmlData });
            } else {
                const { templateName, endpointName } = getHttpEndpointParams;
                const fileName = templateName?.length > 0 ? templateName : endpointName;
                let filePath: string;
                if (directory.endsWith('.xml')) {
                    filePath = directory;
                } else {
                    filePath = path.join(directory, `${fileName}.xml`);
                }

                fs.writeFileSync(filePath, sanitizedXmlData);
                await this.rangeFormat({
                    uri: filePath,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                    }
                });
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                openPopupView(POPUP_EVENT_TYPE.CLOSE_VIEW, { view: null, recentIdentifier: fileName });
                resolve({ path: filePath, content: "" });
            }
        });
    }

    async getHttpEndpoint(params: RetrieveHttpEndpointRequest): Promise<RetrieveHttpEndpointResponse> {

        const endpointSyntaxTree = await this.getSyntaxTree({ documentUri: params.path });
        const templateParams = endpointSyntaxTree.syntaxTree.template != undefined ? endpointSyntaxTree.syntaxTree.template : null;
        const endpointParams = endpointSyntaxTree.syntaxTree.template?.endpoint ?? endpointSyntaxTree.syntaxTree.endpoint;
        const httpParams = endpointParams.http;
        const endpointOverallParams = httpParams?.enableSecAndEnableRMAndEnableAddressing;
        const authenticationParams = endpointOverallParams?.authentication;
        const suspensionParams = endpointOverallParams?.markForSuspension;
        const failureParams = endpointOverallParams?.suspendOnFailure;
        const timeoutParams = endpointOverallParams?.timeout;

        return new Promise(async (resolve) => {
            const filePath = params.path;

            if (fs.existsSync(filePath)) {
                let response: RetrieveHttpEndpointResponse = {
                    endpointName: endpointParams.name,
                    traceEnabled: httpParams?.trace != undefined ? httpParams?.trace : 'disable',
                    statisticsEnabled: httpParams?.statistics != undefined ? httpParams?.statistics : 'disable',
                    uriTemplate: httpParams?.uriTemplate,
                    httpMethod: httpParams?.method != undefined ? httpParams?.method.toUpperCase() : 'leave_as_is',
                    description: endpointParams?.description,
                    requireProperties: false,
                    properties: [],
                    authType: "",
                    basicAuthUsername: "",
                    basicAuthPassword: "",
                    authMode: "",
                    grantType: "",
                    clientId: "",
                    clientSecret: "",
                    refreshToken: "",
                    tokenUrl: "",
                    username: "",
                    password: "",
                    requireOauthParameters: false,
                    oauthProperties: [],
                    addressingEnabled: endpointOverallParams?.enableAddressing != undefined ? 'enable' : 'disable',
                    addressingVersion: endpointOverallParams?.enableAddressing != undefined ? endpointOverallParams?.enableAddressing?.version : '',
                    addressListener: (endpointOverallParams?.enableAddressing != undefined && endpointOverallParams?.enableAddressing?.separateListener) ? 'enable' : 'disable',
                    securityEnabled: endpointOverallParams?.enableSec != undefined ? 'enable' : 'disable',
                    seperatePolicies: endpointOverallParams?.enableSec != undefined ? endpointOverallParams?.enableSec?.policy !== undefined ? false : true : false,
                    policyKey: endpointOverallParams?.enableSec != undefined ? endpointOverallParams?.enableSec?.policy ?? '' : '',
                    inboundPolicyKey: endpointOverallParams?.enableSec != undefined ? endpointOverallParams?.enableSec?.inboundPolicy ?? '' : '',
                    outboundPolicyKey: endpointOverallParams?.enableSec != undefined ? endpointOverallParams?.enableSec?.outboundPolicy ?? '' : '',
                    suspendErrorCodes: failureParams?.errorCodes != undefined ? failureParams?.errorCodes.textNode : '',
                    initialDuration: failureParams?.initialDuration != undefined ? failureParams?.initialDuration.textNode : -1,
                    maximumDuration: failureParams?.maximumDuration != undefined ? failureParams?.maximumDuration.textNode : Number.MAX_SAFE_INTEGER,
                    progressionFactor: failureParams?.progressionFactor != undefined ? failureParams?.progressionFactor.textNode : 1.0,
                    retryErrorCodes: suspensionParams?.errorCodes != undefined ? suspensionParams?.errorCodes.textNode : '',
                    retryCount: suspensionParams?.retriesBeforeSuspension != undefined ? suspensionParams?.retriesBeforeSuspension.textNode : 0,
                    retryDelay: suspensionParams?.retryDelay != undefined ? suspensionParams?.retryDelay.textNode : 0,
                    timeoutDuration: (timeoutParams != undefined && timeoutParams?.content[0] != undefined) ? timeoutParams?.content[0].textNode : Number.MAX_SAFE_INTEGER,
                    timeoutAction: (timeoutParams != undefined && timeoutParams?.content[1] != undefined) ? timeoutParams?.content[1].textNode : '',
                    templateName: templateParams != null || templateParams != undefined ? templateParams.name : '',
                    requireTemplateParameters: false,
                    templateParameters: []
                };

                if (authenticationParams != undefined) {
                    if (authenticationParams.oauth != undefined) {
                        response.authType = 'OAuth';
                        if (authenticationParams.oauth.authorizationCode != undefined) {
                            response.grantType = 'Authorization Code';
                            response.refreshToken = authenticationParams.oauth.authorizationCode.refreshToken.textNode;
                            response.clientId = authenticationParams.oauth.authorizationCode.clientId.textNode;
                            response.clientSecret = authenticationParams.oauth.authorizationCode.clientSecret.textNode;
                            response.tokenUrl = authenticationParams.oauth.authorizationCode.tokenUrl.textNode;
                            response.authMode = authenticationParams.oauth.authorizationCode.authMode.textNode;
                            if (authenticationParams.oauth.authorizationCode.requestParameters != undefined) {
                                let oauthParams: any[];
                                oauthParams = authenticationParams.oauth.authorizationCode.requestParameters.parameter;
                                oauthParams.forEach((element) => {
                                    response.oauthProperties.push({ key: element.name, value: element.textNode });
                                });
                            }
                        } else if (authenticationParams.oauth.clientCredentials != undefined) {
                            response.grantType = 'Client Credentials';
                            response.clientId = authenticationParams.oauth.clientCredentials.clientId.textNode;
                            response.clientSecret = authenticationParams.oauth.clientCredentials.clientSecret.textNode;
                            response.tokenUrl = authenticationParams.oauth.clientCredentials.tokenUrl.textNode;
                            response.authMode = authenticationParams.oauth.clientCredentials.authMode.textNode;
                            if (authenticationParams.oauth.clientCredentials.requestParameters != undefined) {
                                let oauthParams: any[];
                                oauthParams = authenticationParams.oauth.clientCredentials.requestParameters.parameter;
                                oauthParams.forEach((element) => {
                                    response.oauthProperties.push({ key: element.name, value: element.textNode });
                                });
                            }
                        } else {
                            response.grantType = 'Password';
                            response.username = authenticationParams.oauth.passwordCredentials.username.textNode;
                            response.password = authenticationParams.oauth.passwordCredentials.password.textNode;
                            response.clientId = authenticationParams.oauth.passwordCredentials.clientId.textNode;
                            response.clientSecret = authenticationParams.oauth.passwordCredentials.clientSecret.textNode;
                            response.tokenUrl = authenticationParams.oauth.passwordCredentials.tokenUrl.textNode;
                            response.authMode = authenticationParams.oauth.passwordCredentials.authMode.textNode;
                            if (authenticationParams.oauth.passwordCredentials.requestParameters != undefined) {
                                let oauthParams: any[];
                                oauthParams = authenticationParams.oauth.passwordCredentials.requestParameters.parameter;
                                oauthParams.forEach((element) => {
                                    response.oauthProperties.push({ key: element.name, value: element.textNode });
                                });
                            }
                        }
                    } else if (authenticationParams.basicAuth != undefined) {
                        response.authType = 'Basic Auth';
                        response.basicAuthUsername = authenticationParams.basicAuth.username.textNode;
                        response.basicAuthPassword = authenticationParams.basicAuth.password.textNode;
                    } else {
                        response.authType = 'None';
                    }
                } else {
                    response.authType = 'None';
                }

                if (endpointParams.property != undefined) {
                    let params: any[];
                    params = endpointParams.property;
                    params.forEach((element) => {
                        response.properties.push({ name: element.name, value: element.value, scope: element.scope ?? 'default' });
                    });
                }

                if (templateParams != null && templateParams.parameter != undefined && templateParams.parameter.length > 0) {
                    let params: any[];
                    params = templateParams.parameter;
                    params.forEach((element) => {
                        response.templateParameters.push(element.name);
                    });
                }

                response.requireProperties = response.properties.length > 0;
                response.requireOauthParameters = response.oauthProperties.length > 0;
                response.requireTemplateParameters = response.templateParameters.length > 0;

                resolve(response);
            }
        });
    }

    async updateAddressEndpoint(params: UpdateAddressEndpointRequest): Promise<UpdateAddressEndpointResponse> {
        return new Promise(async (resolve) => {
            const {
                directory, ...getAddressEndpointParams
            } = params;

            const xmlData = getAddressEndpointXmlWrapper(getAddressEndpointParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

            if (params.getContentOnly) {
                resolve({ path: "", content: sanitizedXmlData });
            } else {
                const { templateName, endpointName } = getAddressEndpointParams;
                const fileName = templateName?.length > 0 ? templateName : endpointName;
                let filePath: string;
                if (directory.endsWith('.xml')) {
                    filePath = directory;
                } else {
                    filePath = path.join(directory, `${fileName}.xml`);
                }

                fs.writeFileSync(filePath, sanitizedXmlData);
                await this.rangeFormat({
                    uri: filePath,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                    }
                });
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                openPopupView(POPUP_EVENT_TYPE.CLOSE_VIEW, { view: null, recentIdentifier: fileName });
                resolve({ path: filePath, content: "" });
            }
        });
    }

    async getAddressEndpoint(params: RetrieveAddressEndpointRequest): Promise<RetrieveAddressEndpointResponse> {

        const endpointSyntaxTree = await this.getSyntaxTree({ documentUri: params.path });
        const templateParams = endpointSyntaxTree.syntaxTree.template != undefined ? endpointSyntaxTree.syntaxTree.template : null;
        const endpointParams = endpointSyntaxTree.syntaxTree.template?.endpoint ?? endpointSyntaxTree.syntaxTree.endpoint;
        const addressParams = endpointParams.address;
        const suspensionParams = addressParams?.markForSuspension;
        const failureParams = addressParams?.suspendOnFailure;
        const timeoutParams = addressParams?.timeout;

        return new Promise(async (resolve) => {
            const filePath = params.path;

            if (fs.existsSync(filePath)) {
                let response: RetrieveAddressEndpointResponse = {
                    endpointName: endpointParams.name,
                    format: addressParams?.format != undefined ? addressParams?.format.toUpperCase() : 'LEAVE_AS_IS',
                    traceEnabled: addressParams?.trace != undefined ? addressParams?.trace : 'disable',
                    statisticsEnabled: addressParams?.statistics != undefined ? addressParams?.statistics : 'disable',
                    uri: addressParams?.uri,
                    optimize: addressParams?.optimize != undefined ? addressParams?.optimize.toUpperCase() : 'LEAVE_AS_IS',
                    description: endpointParams?.description,
                    requireProperties: false,
                    properties: [],
                    addressingEnabled: addressParams?.enableAddressing != undefined ? 'enable' : 'disable',
                    addressingVersion: addressParams?.enableAddressing != undefined ? addressParams?.enableAddressing.version : '',
                    addressListener: (addressParams?.enableAddressing != undefined && addressParams?.enableAddressing.separateListener) ? 'enable' : 'disable',
                    securityEnabled: addressParams?.enableSec != undefined ? 'enable' : 'disable',
                    seperatePolicies: addressParams?.enableSec != undefined ? addressParams?.enableSec.policy !== undefined ? false : true : false,
                    policyKey: addressParams?.enableSec != undefined ? addressParams?.enableSec.policy ?? '' : '',
                    inboundPolicyKey: addressParams?.enableSec != undefined ? addressParams?.enableSec.inboundPolicy ?? '' : '',
                    outboundPolicyKey: addressParams?.enableSec != undefined ? addressParams?.enableSec.outboundPolicy ?? '' : '',
                    suspendErrorCodes: failureParams?.errorCodes != undefined ? failureParams?.errorCodes.textNode : '',
                    initialDuration: failureParams?.initialDuration != undefined ? failureParams?.initialDuration.textNode : -1,
                    maximumDuration: failureParams?.maximumDuration != undefined ? failureParams?.maximumDuration.textNode : Number.MAX_SAFE_INTEGER,
                    progressionFactor: failureParams?.progressionFactor != undefined ? failureParams?.progressionFactor.textNode : 1.0,
                    retryErrorCodes: suspensionParams?.errorCodes != undefined ? suspensionParams?.errorCodes.textNode : '',
                    retryCount: suspensionParams?.retriesBeforeSuspension != undefined ? suspensionParams?.retriesBeforeSuspension.textNode : 0,
                    retryDelay: suspensionParams?.retryDelay != undefined ? suspensionParams?.retryDelay.textNode : 0,
                    timeoutDuration: (timeoutParams != undefined && timeoutParams?.content[0] != undefined) ? timeoutParams?.content[0].textNode : Number.MAX_SAFE_INTEGER,
                    timeoutAction: (timeoutParams != undefined && timeoutParams?.content[1] != undefined) ? timeoutParams?.content[1].textNode : '',
                    templateName: templateParams != null || templateParams != undefined ? templateParams.name : '',
                    requireTemplateParameters: false,
                    templateParameters: []
                };

                if (response.format === 'SOAP11') {
                    response.format = 'SOAP 1.1';
                } else if (response.format === 'SOAP12') {
                    response.format = 'SOAP 1.2';
                }

                if (endpointParams.property != undefined) {
                    let params: any[];
                    params = endpointParams.property;
                    params.forEach((element) => {
                        response.properties.push({ name: element.name, value: element.value, scope: element.scope ?? 'default' });
                    });
                }

                if (templateParams != null && templateParams.parameter != undefined && templateParams.parameter.length > 0) {
                    let params: any[];
                    params = templateParams.parameter;
                    params.forEach((element) => {
                        response.templateParameters.push(element.name);
                    });
                }

                response.requireProperties = response.properties.length > 0;
                response.requireTemplateParameters = response.templateParameters.length > 0;

                resolve(response);
            }
        });
    }

    async updateWsdlEndpoint(params: UpdateWsdlEndpointRequest): Promise<UpdateWsdlEndpointResponse> {
        return new Promise(async (resolve) => {
            const { directory, ...getWsdlEndpointParams } = params;

            const xmlData = getWsdlEndpointXmlWrapper(getWsdlEndpointParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

            if (params.getContentOnly) {
                resolve({ path: "", content: sanitizedXmlData });
            } else {
                const { templateName, endpointName } = getWsdlEndpointParams;
                const fileName = templateName?.length > 0 ? templateName : endpointName;
                let filePath: string;
                if (directory.endsWith('.xml')) {
                    filePath = directory;
                } else {
                    filePath = path.join(directory, `${fileName}.xml`);
                }

                fs.writeFileSync(filePath, sanitizedXmlData);
                await this.rangeFormat({
                    uri: filePath,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                    }
                });
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                openPopupView(POPUP_EVENT_TYPE.CLOSE_VIEW, { view: null, recentIdentifier: fileName });
                resolve({ path: filePath, content: "" });
            }
        });
    }

    async getWsdlEndpoint(params: RetrieveWsdlEndpointRequest): Promise<RetrieveWsdlEndpointResponse> {

        const endpointSyntaxTree = await this.getSyntaxTree({ documentUri: params.path });
        const templateParams = endpointSyntaxTree.syntaxTree.template != undefined ? endpointSyntaxTree.syntaxTree.template : null;
        const endpointParams = endpointSyntaxTree.syntaxTree.template?.endpoint ?? endpointSyntaxTree.syntaxTree.endpoint;
        const wsdlParams = endpointParams.wsdl;
        const suspensionParams = wsdlParams?.markForSuspension;
        const failureParams = wsdlParams?.suspendOnFailure;
        const timeoutParams = wsdlParams?.timeout;

        return new Promise(async (resolve) => {
            const filePath = params.path;

            if (fs.existsSync(filePath)) {
                let response: RetrieveWsdlEndpointResponse = {
                    endpointName: endpointParams.name,
                    format: wsdlParams?.format != undefined ? wsdlParams?.format.toUpperCase() : 'LEAVE_AS_IS',
                    traceEnabled: wsdlParams?.trace != undefined ? wsdlParams?.trace : 'disable',
                    statisticsEnabled: wsdlParams?.statistics != undefined ? wsdlParams?.statistics : 'disable',
                    optimize: wsdlParams?.optimize != undefined ? wsdlParams?.optimize.toUpperCase() : 'LEAVE_AS_IS',
                    description: endpointParams?.description,
                    wsdlUri: wsdlParams?.uri,
                    wsdlService: wsdlParams?.service,
                    wsdlPort: wsdlParams?.port,
                    requireProperties: false,
                    properties: [],
                    addressingEnabled: wsdlParams?.enableAddressing != undefined ? 'enable' : 'disable',
                    addressingVersion: wsdlParams?.enableAddressing != undefined ? wsdlParams?.enableAddressing.version : '',
                    addressListener: (wsdlParams?.enableAddressing != undefined && wsdlParams?.enableAddressing.separateListener) ? 'enable' : 'disable',
                    securityEnabled: wsdlParams?.enableSec != undefined ? 'enable' : 'disable',
                    seperatePolicies: wsdlParams?.enableSec != undefined ? wsdlParams?.enableSec.policy !== undefined ? false : true : false,
                    policyKey: wsdlParams?.enableSec != undefined ? wsdlParams?.enableSec.policy ?? '' : '',
                    inboundPolicyKey: wsdlParams?.enableSec != undefined ? wsdlParams?.enableSec.inboundPolicy ?? '' : '',
                    outboundPolicyKey: wsdlParams?.enableSec != undefined ? wsdlParams?.enableSec.outboundPolicy ?? '' : '',
                    suspendErrorCodes: failureParams?.errorCodes != undefined ? failureParams?.errorCodes.textNode : '',
                    initialDuration: failureParams?.initialDuration != undefined ? failureParams?.initialDuration.textNode : -1,
                    maximumDuration: failureParams?.maximumDuration != undefined ? failureParams?.maximumDuration.textNode : Number.MAX_SAFE_INTEGER,
                    progressionFactor: failureParams?.progressionFactor != undefined ? failureParams?.progressionFactor.textNode : 1.0,
                    retryErrorCodes: suspensionParams?.errorCodes != undefined ? suspensionParams?.errorCodes.textNode : '',
                    retryCount: suspensionParams?.retriesBeforeSuspension != undefined ? suspensionParams?.retriesBeforeSuspension.textNode : 0,
                    retryDelay: suspensionParams?.retryDelay != undefined ? suspensionParams?.retryDelay.textNode : 0,
                    timeoutDuration: (timeoutParams != undefined && timeoutParams?.content[0] != undefined) ? timeoutParams?.content[0].textNode : Number.MAX_SAFE_INTEGER,
                    timeoutAction: (timeoutParams != undefined && timeoutParams?.content[1] != undefined) ? timeoutParams?.content[1].textNode : '',
                    templateName: templateParams != null || templateParams != undefined ? templateParams.name : '',
                    requireTemplateParameters: false,
                    templateParameters: []
                };

                if (response.format === 'SOAP11') {
                    response.format = 'SOAP 1.1';
                } else if (response.format === 'SOAP12') {
                    response.format = 'SOAP 1.2';
                }

                if (endpointParams.property != undefined) {
                    let params: any[];
                    params = endpointParams.property;
                    params.forEach((element) => {
                        response.properties.push({ name: element.name, value: element.value, scope: element.scope ?? 'default' });
                    });
                }

                if (templateParams != null && templateParams.parameter != undefined && templateParams.parameter.length > 0) {
                    let params: any[];
                    params = templateParams.parameter;
                    params.forEach((element) => {
                        response.templateParameters.push(element.name);
                    });
                }

                response.requireProperties = response.properties.length > 0;
                response.requireTemplateParameters = response.templateParameters.length > 0;

                resolve(response);
            }
        });
    }

    async updateDefaultEndpoint(params: UpdateDefaultEndpointRequest): Promise<UpdateDefaultEndpointResponse> {
        return new Promise(async (resolve) => {
            const { directory, ...getDefaultEndpointParams } = params;

            const xmlData = getDefaultEndpointXmlWrapper(getDefaultEndpointParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

            if (params.getContentOnly) {
                resolve({ path: "", content: sanitizedXmlData });
            } else {
                const { templateName, endpointName } = getDefaultEndpointParams;
                const fileName = templateName?.length > 0 ? templateName : endpointName;
                let filePath: string;
                if (directory.endsWith('.xml')) {
                    filePath = directory;
                } else {
                    filePath = path.join(directory, `${fileName}.xml`);
                }

                fs.writeFileSync(filePath, sanitizedXmlData);
                await this.rangeFormat({
                    uri: filePath,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                    }
                });
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                openPopupView(POPUP_EVENT_TYPE.CLOSE_VIEW, { view: null, recentIdentifier: fileName });
                resolve({ path: filePath, content: "" });
            }
        });
    }

    async getDefaultEndpoint(params: RetrieveDefaultEndpointRequest): Promise<RetrieveDefaultEndpointResponse> {

        const endpointSyntaxTree = await this.getSyntaxTree({ documentUri: params.path });
        const templateParams = endpointSyntaxTree.syntaxTree.template != undefined ? endpointSyntaxTree.syntaxTree.template : null;
        const endpointParams = endpointSyntaxTree.syntaxTree.template?.endpoint ?? endpointSyntaxTree.syntaxTree.endpoint;
        const defaultParams = endpointParams._default;
        const suspensionParams = defaultParams?.markForSuspension;
        const failureParams = defaultParams?.suspendOnFailure;
        const timeoutParams = defaultParams?.timeout;

        return new Promise(async (resolve) => {
            const filePath = params.path;

            if (fs.existsSync(filePath)) {
                let response: RetrieveDefaultEndpointResponse = {
                    endpointName: endpointParams.name,
                    format: defaultParams?.format != undefined ? defaultParams?.format.toUpperCase() : 'LEAVE_AS_IS',
                    traceEnabled: defaultParams?.trace != undefined ? defaultParams?.trace : 'disable',
                    statisticsEnabled: defaultParams?.statistics != undefined ? defaultParams?.statistics : 'disable',
                    optimize: defaultParams?.optimize != undefined ? defaultParams?.optimize.toUpperCase() : 'LEAVE_AS_IS',
                    description: endpointParams?.description,
                    requireProperties: false,
                    properties: [],
                    addressingEnabled: defaultParams?.enableAddressing != undefined ? 'enable' : 'disable',
                    addressingVersion: defaultParams?.enableAddressing != undefined ? defaultParams?.enableAddressing.version : '',
                    addressListener: (defaultParams?.enableAddressing != undefined && defaultParams?.enableAddressing.separateListener) ? 'enable' : 'disable',
                    securityEnabled: defaultParams?.enableSec != undefined ? 'enable' : 'disable',
                    seperatePolicies: defaultParams?.enableSec != undefined ? defaultParams?.enableSec.policy !== undefined ? false : true : false,
                    policyKey: defaultParams?.enableSec != undefined ? defaultParams?.enableSec.policy ?? '' : '',
                    inboundPolicyKey: defaultParams?.enableSec != undefined ? defaultParams?.enableSec.inboundPolicy ?? '' : '',
                    outboundPolicyKey: defaultParams?.enableSec != undefined ? defaultParams?.enableSec.outboundPolicy ?? '' : '',
                    suspendErrorCodes: failureParams?.errorCodes != undefined ? failureParams?.errorCodes.textNode : '',
                    initialDuration: failureParams?.initialDuration != undefined ? failureParams?.initialDuration.textNode : -1,
                    maximumDuration: failureParams?.maximumDuration != undefined ? failureParams?.maximumDuration.textNode : Number.MAX_SAFE_INTEGER,
                    progressionFactor: failureParams?.progressionFactor != undefined ? failureParams?.progressionFactor.textNode : 1.0,
                    retryErrorCodes: suspensionParams?.errorCodes != undefined ? suspensionParams?.errorCodes.textNode : '',
                    retryCount: suspensionParams?.retriesBeforeSuspension != undefined ? suspensionParams?.retriesBeforeSuspension.textNode : 0,
                    retryDelay: suspensionParams?.retryDelay != undefined ? suspensionParams?.retryDelay.textNode : 0,
                    timeoutDuration: (timeoutParams != undefined && timeoutParams?.content[0] != undefined) ? timeoutParams?.content[0].textNode : Number.MAX_SAFE_INTEGER,
                    timeoutAction: (timeoutParams != undefined && timeoutParams?.content[1] != undefined) ? timeoutParams?.content[1].textNode : '',
                    templateName: templateParams != null || templateParams != undefined ? templateParams.name : '',
                    requireTemplateParameters: false,
                    templateParameters: []
                };

                if (response.format === 'SOAP11') {
                    response.format = 'SOAP 1.1';
                } else if (response.format === 'SOAP12') {
                    response.format = 'SOAP 1.2';
                }

                if (endpointParams.property != undefined) {
                    let params: any[];
                    params = endpointParams.property;
                    params.forEach((element) => {
                        response.properties.push({ name: element.name, value: element.value, scope: element.scope ?? 'default' });
                    });
                }

                if (templateParams != null && templateParams.parameter != undefined && templateParams.parameter.length > 0) {
                    let params: any[];
                    params = templateParams.parameter;
                    params.forEach((element) => {
                        response.templateParameters.push(element.name);
                    });
                }

                response.requireProperties = response.properties.length > 0;
                response.requireTemplateParameters = response.templateParameters.length > 0;

                resolve(response);
            }
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

            if (!params.disableFormatting) {
                const formatRange = this.getFormatRange(range, text);
                await this.rangeFormat({ uri: params.documentUri, range: formatRange });
            }
            const content = document.getText();
            undoRedo.addModification(content);

            resolve({ status: true });
        });
    }

    getFormatRange(range: Range, text: string): Range {
        const editSplit = text.split('\n');
        const addedLine = editSplit.length;
        const lastLineLength = editSplit[editSplit.length - 1].length;
        const formatStart = range.start;
        const formatend = new Position(range.start.line + addedLine - 1, lastLineLength);
        const formatRange = new Range(formatStart, formatend);
        return formatRange;
    }

    async rangeFormat(req: RangeFormatRequest): Promise<ApplyEditResponse> {
        return new Promise(async (resolve) => {
            const uri = Uri.parse(req.uri);
            const edits: TextEdit[] = await commands.executeCommand("vscode.executeFormatRangeProvider", uri, req.range,
                { tabSize: 4, insertSpaces: false, trimTrailingWhitespace: false });
            const workspaceEdit = new WorkspaceEdit();
            workspaceEdit.set(uri, edits);
            await workspace.applyEdit(workspaceEdit);
            resolve({ status: true });
        });
    }

    async createMessageProcessor(params: CreateMessageProcessorRequest): Promise<CreateMessageProcessorResponse> {
        return new Promise(async (resolve) => {
            const { directory, messageProcessorName, messageProcessorType, messageStoreType, failMessageStoreType,
                sourceMessageStoreType, targetMessageStoreType, processorState, dropMessageOption, quartzConfigPath,
                cron, forwardingInterval, retryInterval, maxRedeliveryAttempts, maxConnectionAttempts,
                connectionAttemptInterval, taskCount, statusCodes, clientRepository, axis2Config, endpointType,
                sequenceType, replySequenceType, faultSequenceType, deactivateSequenceType, endpoint, sequence, replySequence,
                faultSequence, deactivateSequence, samplingInterval, samplingConcurrency,
                providerClass, properties } = params;

            const getTemplateParams = {
                messageProcessorName, messageProcessorType, messageStoreType, failMessageStoreType, sourceMessageStoreType,
                targetMessageStoreType, processorState, dropMessageOption, quartzConfigPath, cron, forwardingInterval,
                retryInterval, maxRedeliveryAttempts, maxConnectionAttempts, connectionAttemptInterval, taskCount,
                statusCodes, clientRepository, axis2Config, endpointType, sequenceType, replySequenceType, faultSequenceType,
                deactivateSequenceType, endpoint, sequence, replySequence, faultSequence,
                deactivateSequence, samplingInterval, samplingConcurrency, providerClass, properties
            };

            const xmlData = getMessageProcessorXmlWrapper(getTemplateParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

            let filePath: string;

            if (directory.endsWith('.xml')) {
                filePath = directory;
            } else {
                filePath = path.join(directory, `${messageProcessorName}.xml`);
            }

            if (filePath.includes('messageProcessors')) {
                filePath = filePath.replace('messageProcessors', 'message-processors');
            }

            fs.writeFileSync(filePath, sanitizedXmlData);
            await this.rangeFormat({
                uri: filePath,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                }
            });
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: filePath });
        });
    }

    async getMessageProcessor(params: RetrieveMessageProcessorRequest): Promise<RetrieveMessageProcessorResponse> {
        const options = {
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            attributeNamePrefix: "@_",
            attributesGroupName: "@_"
        };
        const parser = new XMLParser(options);

        interface Parameter {
            name: string;
            value: string;
        }

        return new Promise(async (resolve) => {
            const filePath = params.path;

            if (fs.existsSync(filePath)) {
                const xmlData = fs.readFileSync(filePath, "utf8");
                const jsonData = parser.parse(xmlData);
                let parameters: Parameter[];
                const className = jsonData.messageProcessor["@_"]["@_class"];
                let response: RetrieveMessageProcessorResponse = {
                    messageProcessorName: jsonData.messageProcessor["@_"]["@_name"],
                    messageProcessorType: '',
                    messageStoreType: jsonData.messageProcessor["@_"]["@_messageStore"],
                    failMessageStoreType: '',
                    sourceMessageStoreType: '',
                    targetMessageStoreType: '',
                    processorState: 'true',
                    dropMessageOption: 'Disabled',
                    quartzConfigPath: '',
                    cron: '',
                    forwardingInterval: 1000,
                    retryInterval: 1000,
                    maxRedeliveryAttempts: 4,
                    maxConnectionAttempts: -1,
                    connectionAttemptInterval: 1000,
                    taskCount: null,
                    statusCodes: '',
                    clientRepository: '',
                    axis2Config: '',
                    endpointType: '',
                    sequenceType: '',
                    replySequenceType: '',
                    faultSequenceType: '',
                    deactivateSequenceType: '',
                    endpoint: '',
                    sequence: '',
                    replySequence: '',
                    faultSequence: '',
                    deactivateSequence: '',
                    samplingInterval: 1000,
                    samplingConcurrency: 1,
                    providerClass: '',
                    properties: [],
                    hasCustomProperties: false
                };

                let sourceMsgStore = '';
                if (jsonData.messageProcessor["@_"]["@_messageStore"] !== undefined) {
                    sourceMsgStore = jsonData.messageProcessor["@_"]["@_messageStore"];
                }

                if (jsonData.messageProcessor["@_"]["@_targetEndpoint"] !== undefined) {
                    response.endpoint = jsonData.messageProcessor["@_"]["@_targetEndpoint"];
                }

                if (jsonData && jsonData.messageProcessor && jsonData.messageProcessor.parameter) {
                    parameters = Array.isArray(jsonData.messageProcessor.parameter)
                        ? jsonData.messageProcessor.parameter.map((param: any) => ({
                            name: param["@_"]['@_name'],
                            value: param['#text']
                        }))
                        : [{
                            name: jsonData.messageProcessor.parameter["@_"]['@_name'],
                            value: jsonData.messageProcessor.parameter['#text']
                        }];

                    const ScheduledMessageForwardingProcessor = {
                        'client.retry.interval': 'retryInterval',
                        'member.count': 'taskCount',
                        'message.processor.reply.sequence': 'replySequence',
                        'axis2.config': 'axis2Config',
                        'quartz.conf': 'quartzConfigPath',
                        'non.retry.status.codes': 'statusCodes',
                        'message.processor.deactivate.sequence': 'deactivateSequence',
                        'is.active': 'processorState',
                        'axis2.repo': 'clientRepository',
                        cronExpression: 'cron',
                        'max.delivery.attempts': 'maxRedeliveryAttempts',
                        'message.processor.fault.sequence': 'faultSequence',
                        'store.connection.retry.interval': 'connectionAttemptInterval',
                        'max.store.connection.attempts': 'maxConnectionAttempts',
                        'max.delivery.drop': 'dropMessageOption',
                        interval: 'forwardingInterval',
                        'message.processor.failMessagesStore': 'failMessageStoreType'
                    },
                        ScheduledFailoverMessageForwardingProcessor = {
                            'client.retry.interval': 'retryInterval',
                            cronExpression: 'cron',
                            'max.delivery.attempts': 'maxRedeliveryAttempts',
                            'member.count': 'taskCount',
                            'message.processor.fault.sequence': 'faultSequence',
                            'quartz.conf': 'quartzConfigPath',
                            'max.delivery.drop': 'dropMessageOption',
                            interval: 'forwardingInterval',
                            'store.connection.retry.interval': 'connectionAttemptInterval',
                            'max.store.connection.attempts': 'maxConnectionAttempts',
                            'message.processor.deactivate.sequence': 'deactivateSequence',
                            'is.active': 'processorState',
                            'message.target.store.name': 'targetMessageStoreType'
                        },
                        MessageSamplingProcessor = {
                            cronExpression: 'cron',
                            sequence: 'sequence',
                            'quartz.conf': 'quartzConfigPath',
                            interval: 'samplingInterval',
                            'is.active': 'processorState',
                            concurrency: 'samplingConcurrency',
                        };

                    const customProperties: { key: string, value: any }[] = [];
                    if (className === 'org.apache.synapse.message.processor.impl.forwarder.ScheduledMessageForwardingProcessor') {
                        response.messageProcessorType = 'Scheduled Message Forwarding Processor';
                        parameters.forEach((param: Parameter) => {
                            if (ScheduledMessageForwardingProcessor.hasOwnProperty(param.name)) {
                                response[ScheduledMessageForwardingProcessor[param.name]] = param.value;
                            } else {
                                customProperties.push({ key: param.name, value: param.value });
                            }
                        });
                        response.messageStoreType = sourceMsgStore;
                    } else if (className === 'org.apache.synapse.message.processor.impl.sampler.SamplingProcessor') {
                        response.messageProcessorType = 'Message Sampling Processor';
                        parameters.forEach((param: Parameter) => {
                            if (MessageSamplingProcessor.hasOwnProperty(param.name)) {
                                response[MessageSamplingProcessor[param.name]] = param.value;
                            } else {
                                customProperties.push({ key: param.name, value: param.value });
                            }
                        });
                    } else if (className === 'org.apache.synapse.message.processor.impl.failover.FailoverScheduledMessageForwardingProcessor') {
                        response.messageProcessorType = 'Scheduled Failover Message Forwarding Processor';
                        parameters.forEach((param: Parameter) => {
                            if (ScheduledFailoverMessageForwardingProcessor.hasOwnProperty(param.name)) {
                                response[ScheduledFailoverMessageForwardingProcessor[param.name]] = param.value;
                            } else {
                                customProperties.push({ key: param.name, value: param.value });
                            }
                        });
                        response.sourceMessageStoreType = sourceMsgStore;
                    } else {
                        response.messageProcessorType = 'Custom Message Processor';
                        response.providerClass = className;
                        response.properties = parameters.map(pair => ({ key: pair.name, value: pair.value }));
                    }

                    if (customProperties.length > 0) {
                        response.hasCustomProperties = true;
                        response.properties = customProperties;
                    }
                } else {
                    response.messageProcessorType = 'Custom Message Processor';
                    response.providerClass = className;
                }

                resolve(response);
            }
        });
    }

    closeWebView(): void {
        if (VisualizerWebview.currentPanel) {
            VisualizerWebview.currentPanel.dispose();
        }
    }

    openFile(params: OpenDiagramRequest): void {
        if (!fs.lstatSync(params.path).isDirectory()) {
            const uri = Uri.file(params.path);
            workspace.openTextDocument(uri).then((document) => {
                window.showTextDocument(document);
            });
        }
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

    async askProjectImportDirPath(): Promise<ProjectDirResponse> {
        return new Promise(async (resolve) => {
            const selectedDir = await askImportProjectPath();
            if (!selectedDir || selectedDir.length === 0) {
                window.showErrorMessage('The root directory of the project must be selected to import project');
                resolve({ path: "" });
            } else {
                const parentDir = selectedDir[0].fsPath;
                resolve({ path: parentDir });
            }
        });
    }

    async askFileDirPath(): Promise<FileDirResponse> {
        return new Promise(async (resolve) => {
            const selectedFile = await askFilePath();
            if (!selectedFile || selectedFile.length === 0) {
                window.showErrorMessage('A folder must be selected to create project');
                resolve({ path: "" });
            } else {
                const parentDir = selectedFile[0].fsPath;
                resolve({ path: parentDir });
            }
        });
    }

    async createProject(params: CreateProjectRequest): Promise<CreateProjectResponse> {
        return new Promise(async (resolve) => {
            const projectUuid = uuidv4();
            const { directory, name, open, groupID, artifactID, version } = params;
            const folderStructure: FileStructure = {
                [name]: { // Project folder
                    'pom.xml': rootPomXmlContent(name, groupID ?? "com.example", artifactID ?? name, projectUuid, version ?? DEFAULT_PROJECT_VERSION),
                    'src': {
                        'main': {
                            'java': '',
                            'wso2mi': {
                                'artifacts': {
                                    'apis': '',
                                    'endpoints': '',
                                    'inbound-endpoints': '',
                                    'local-entries': '',
                                    'message-processors': '',
                                    'message-stores': '',
                                    'proxy-services': '',
                                    'sequences': '',
                                    'tasks': '',
                                    'templates': '',
                                    //TODO: will add again once the feature is implemented
                                    // 'data-services': '',
                                    // 'data-sources': '',
                                },
                                'resources': {
                                    'connectors': '',
                                    'metadata': '',
                                    'registry': {
                                        'gov': '',
                                        'conf': '',
                                    },
                                },
                            },
                            'test': ''
                        },
                    },
                },
            };

            createFolderStructure(directory, folderStructure);

            window.showInformationMessage(`Successfully created ${name} project`);
            const projectOpened = StateMachine.context().projectOpened;

            if (open) {
                if (projectOpened) {
                    const answer = await window.showInformationMessage(
                        "Do you want to open the created project in the current window or new window?",
                        "Current Window",
                        "New Window"
                    );

                    if (answer === "Current Window") {
                        const folderUri = Uri.file(path.join(directory, name));

                        // Get the currently opened workspaces
                        const workspaceFolders = workspace.workspaceFolders || [];

                        // Check if the folder is not already part of the workspace
                        if (!workspaceFolders.some(folder => folder.uri.fsPath === folderUri.fsPath)) {
                            workspace.updateWorkspaceFolders(workspaceFolders.length, 0, { uri: folderUri });
                        }
                    } else {
                        commands.executeCommand('vscode.openFolder', Uri.file(path.join(directory, name)));
                        resolve({ filePath: path.join(directory, name) });
                    }

                } else {
                    commands.executeCommand('vscode.openFolder', Uri.file(path.join(directory, name)));
                    resolve({ filePath: path.join(directory, name) });
                }
            }

            resolve({ filePath: path.join(directory, name) });
        });
    }

    async importProject(params: ImportProjectRequest): Promise<ImportProjectResponse> {
        return new Promise(async (resolve) => {
            resolve(importProject(params));
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

    async getProjectRoot(params: GetProjectRootRequest): Promise<ProjectRootResponse> {
        return new Promise(async (resolve) => {
            const fileUri = Uri.file(params.path);
            const workspaceFolder = workspace.getWorkspaceFolder(fileUri);

            if (workspaceFolder) {
                resolve({ path: workspaceFolder.uri.fsPath });
            }
            resolve({ path: "" });
        });
    }

    async getWorkspaceRoot(): Promise<ProjectRootResponse> {
        return new Promise(async (resolve) => {
            const workspaceFolders = workspace.workspaceFolders;
            if (workspaceFolders) {
                resolve({ path: workspaceFolders[0].uri.fsPath });
            }
            resolve({ path: "" });
        });
    }

    async getAIResponse(params: AIUserInput): Promise<string> {
        let result = '';
        try {
            const response = await axios.post(MI_COPILOT_BACKEND_URL, {
                chat_history: params.chat_history,
            }, { responseType: 'stream' });

            response.data.pipe(new Transform({
                transform(chunk, encoding, callback) {
                    const chunkAsString = chunk.toString();
                    result += chunkAsString;
                    callback();
                }
            }));

            return new Promise((resolve, reject) => {
                response.data.on('end', () => resolve(result));
                response.data.on('error', (err: Error) => reject(err));
            });

        } catch (error) {
            console.error('Error calling the AI endpoint:', error);
            throw new Error('Failed to call AI endpoint');
        }
    }

    async writeContentToFile(params: WriteContentToFileRequest): Promise<WriteContentToFileResponse> {
        let status = true;
        //if file exists, overwrite if not, create new file and write content.  if successful, return true, else false
        const { content } = params;

        //get current workspace folder 
        const directoryPath = StateMachine.context().projectUri;
        console.log('Directory path:', directoryPath);

        const length = content.length;
        console.log('Content length:', length);
        for (let i = 0; i < length; i++) {
            //remove starting '''xml and ending '''
            content[i] = content[i].replace(/```xml/g, '');
            content[i] = content[i].replace(/```/g, '');
            //name of file is in the code somewhere in the format name="example", extract the name
            const match = content[i].match(/(name|key)="([^"]+)"/);
            if (match) {
                const name = match[2]; // get the name
                //identify type of the file from the first tag of the content
                const tagMatch = content[i].match(/<(\w+)/);
                let fileType = '';
                if (tagMatch) {
                    const tag = tagMatch[1];
                    switch (tag) {
                        case 'api':
                            fileType = 'apis';
                            break;
                        case 'endpoint':
                            fileType = 'endpoints';
                            break;
                        case 'sequence':
                            fileType = 'sequences'
                            break;
                        case 'proxy':
                            fileType = 'proxy-services';
                            break;
                        case 'inboundEndpoint':
                            fileType = 'inbound-endpoints';
                            break;
                        case 'messageStore':
                            fileType = 'message-stores';
                            break;
                        case 'messageProcessor':
                            fileType = 'message-processors';
                            break;
                        case 'task':
                            fileType = 'tasks';
                            break;
                        case 'localEntry':
                            fileType = 'local-entries';
                            break;
                        case 'template':
                            fileType = 'templates';
                            break;
                        case 'registry':
                            fileType = 'registry';
                            break;
                        default:
                            fileType = '';
                    }
                    console.log("File type - ", fileType)
                }

                const connectorMatch = content[i].match(/<(\w+\.\w+)>/);
                if (connectorMatch) {
                    const tagParts = connectorMatch[1].split('.');
                    console.log('Connector match:', tagParts[0]);
                    
                }
                //write the content to a file, if file exists, overwrite else create new file
                const fullPath = path.join(directoryPath ?? '', '/src/main/wso2mi/artifacts/', fileType, '/', `${name}.xml`);
                console.log('Full path:', fullPath);
                try {
                    console.log('Writing content to file:', fullPath);
                    content[i] = content[i].trimStart();
                    console.log('Content:', content[i]);
                    await replaceFullContentToFile(fullPath, content[i]);

                } catch (error) {
                    console.error('Error writing content to file:', error);
                    status = false;
                }
            }
        }

        if (status) {
            window.showInformationMessage('Content written to file successfully');
            return { status: true };
        } else {
            return { status: false };
        }


    }
    async highlightCode(params: HighlightCodeRequest) {
        const documentUri = StateMachine.context().documentUri;
        let editor = window.visibleTextEditors.find(editor => editor.document.uri.fsPath === documentUri);
        if (!editor && params.force && documentUri) {
            const document = await workspace.openTextDocument(Uri.parse(documentUri));
            editor = await window.showTextDocument(document, ViewColumn.Beside);
        }

        if (editor) {
            const range = new Range(params.range.start.line, params.range.start.character, params.range.end.line, params.range.end.character);
            editor.selection = new Selection(range.start, range.end);
            editor.revealRange(range);
        }
    }

    async getWorkspaceContext(): Promise<GetWorkspaceContextResponse> {
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace is currently open');
        }

        var rootPath = workspaceFolders[0].uri.fsPath;
        rootPath += '/src/main/wso2mi/artifacts';
        const fileContents: string[] = [];
        var resourceFolders = ['apis', 'endpoints', 'inbound-endpoints', 'local-entries', 'message-processors', 'message-stores', 'proxy-services', 'sequences', 'tasks', 'templates'];
        for (const folder of resourceFolders) {
            const folderPath = path.join(rootPath, folder);
            const files = await fs.promises.readdir(folderPath);

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const stats = await fs.promises.stat(filePath);

                if (stats.isFile()) {
                    const content = await fs.promises.readFile(filePath, 'utf-8');
                    fileContents.push(content);
                }
            }
        }

        return { context: fileContents };
    }

    async getProjectUuid(): Promise<GetProjectUuidResponse> {
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace is currently open');
        }
        var rootPath = workspaceFolders[0].uri.fsPath;
        const pomPath = path.join(rootPath, 'pom.xml');

        return new Promise((resolve, reject) => {
            fs.readFile(pomPath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    //get the part within <uuid> and <uuid> tags
                    const uuid = data.match(/<uuid>(.*?)<\/uuid>/s);
                    if (uuid) {
                        resolve({ uuid: uuid[1] });
                    } else {
                        resolve({ uuid: '' });
                    }
                }
            });
        });
    }

    async downloadConnector(params: DownloadConnectorRequest): Promise<DownloadConnectorResponse> {
        const { url } = params;
        try {
            const workspaceFolders = workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error('No workspace is currently open');
            }
            const rootPath = workspaceFolders[0].uri.fsPath;

            const connectorDirectory = path.join(rootPath, 'src', 'main', 'wso2mi', 'resources', 'connectors');

            if (!fs.existsSync(connectorDirectory)) {
                fs.mkdirSync(connectorDirectory, { recursive: true });
            }

            // Extract the zip name from the URL
            const zipName = path.basename(url);

            const connectorPath = path.join(connectorDirectory, zipName);

            if (!fs.existsSync(connectorPath)) {
                const response = await axios.get(url, {
                    responseType: 'stream',
                    headers: {
                        'User-Agent': 'My Client'
                    }
                });
    
                // Create a temporary file
                const tmpobj = tmp.fileSync();
                const writer = fs.createWriteStream(tmpobj.name);
    
                response.data.pipe(writer);
    
                return new Promise((resolve, reject) => {
                    writer.on('finish', async () => {
                        writer.close();
                        // Copy the file from the temp location to the connectorPath
                        await copy(tmpobj.name, connectorPath);
                        // Remove the temporary file
                        tmpobj.removeCallback();
                        resolve({ path: connectorPath });
                    });
                    writer.on('error', reject);
                });
            }

            return new Promise((resolve, reject) => {
                resolve({ path: connectorPath });
            });
        } catch (error) {
            console.error('Error downloading connector:', error);
            throw new Error('Failed to download connector');
        }
    }

    async getConnectorForm(params: GetConnectorFormRequest): Promise<GetConnectorFormResponse> {
        const { uiSchemaPath, operation } = params;
        const operationSchema = path.join(uiSchemaPath, `${operation}.json`);

        if (!fs.existsSync(operationSchema)) {
            return { formJSON: '' };
        }

        const rawData = fs.readFileSync(operationSchema, 'utf-8');
        const formJSON = JSON.parse(rawData);

        return { formJSON: formJSON };
    }

    async getConnectionForm(params: GetConnectionFormRequest): Promise<GetConnectionFormResponse> {
        const { uiSchemaPath } = params;

        if (!fs.existsSync(uiSchemaPath)) {
            return { formJSON: '' };
        }

        const rawData = fs.readFileSync(uiSchemaPath, 'utf-8');
        const formJSON = JSON.parse(rawData);

        return { formJSON: formJSON };
    }

    undo(params: UndoRedoParams): void {
        const lastsource = undoRedo.undo();
        if (lastsource) {
            fs.writeFileSync(params.path, lastsource);
        }
    }

    redo(params: UndoRedoParams): void {
        const lastsource = undoRedo.redo();
        if (lastsource) {
            fs.writeFileSync(params.path, lastsource);
        }
    }

    async initUndoRedoManager(params: UndoRedoParams): Promise<void> {
        let document = workspace.textDocuments.find(doc => doc.uri.fsPath === params.path);

        if (!document) {
            document = await workspace.openTextDocument(Uri.parse(params.path));
        }

        if (document) {
            // Access the content of the document
            const content = document.getText();
            undoRedo.updateContent(params.path, content);
        }
    }

    async getDefinition(params: GetDefinitionRequest): Promise<GetDefinitionResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const definition = await langClient.getDefinition(params);

            resolve(definition);
        });
    }

    async getTextAtRange(params: GetTextAtRangeRequest): Promise<GetTextAtRangeResponse> {
        return new Promise(async (resolve) => {
            const file = fs.readFileSync(params.documentUri, "utf8");

            const start = params.range.start;
            const end = params.range.end;
            const lines = file.split("\n");
            const text = lines.slice(start.line, end.line + 1).map((line, index) => {
                if (index === 0 && start.line === end.line) {
                    return line.substring(start.character, end.character);
                } else if (index === 0) {
                    return line.substring(start.character);
                } else if (index === end.line - start.line) {
                    return line.substring(0, end.character);
                } else {
                    return line;
                }
            }).join("\n");
            resolve({ text });
        });
    }

    async getDiagnostics(params: GetDiagnosticsReqeust): Promise<GetDiagnosticsResponse> {
        return StateMachine.context().langClient!.getDiagnostics(params);
    }

    async getAvailableResources(params: GetAvailableResourcesRequest): Promise<GetAvailableResourcesResponse> {
        return StateMachine.context().langClient!.getAvailableResources(params);
    }

    async browseFile(params: BrowseFileRequest): Promise<BrowseFileResponse> {
        return new Promise(async (resolve) => {
            const selectedFile = await window.showOpenDialog({
                canSelectFiles: params.canSelectFiles,
                canSelectFolders: params.canSelectFolders,
                canSelectMany: params.canSelectMany,
                defaultUri: Uri.file(os.homedir()),
                title: params.title,
                ...params.openLabel && { openLabel: params.openLabel },
            });
            if (selectedFile) {
                resolve({ filePath: selectedFile[0].fsPath });
            }
        });
    }

    async createRegistryResource(params: CreateRegistryResourceRequest): Promise<CreateRegistryResourceResponse> {
        return new Promise(async (resolve) => {
            let projectDir = params.projectDirectory;
            const fileUri = Uri.file(params.projectDirectory);
            const workspaceFolder = workspace.getWorkspaceFolder(fileUri);
            if (workspaceFolder) {
                params.projectDirectory = workspaceFolder?.uri.fsPath;
                projectDir = path.join(workspaceFolder.uri.fsPath, 'src', 'main', 'wso2mi', 'resources', 'registry');
            }
            let registryDir = path.join(projectDir, params.registryRoot);
            let transformedPath = params.registryRoot === "gov" ? "/_system/governance" : "/_system/config";
            if (params.createOption === "import") {
                if (fs.existsSync(params.filePath)) {
                    const fileName = path.basename(params.filePath);
                    const registryPath = path.join(registryDir, params.registryPath);
                    const destPath = path.join(registryPath, fileName);
                    if (!fs.existsSync(registryPath)) {
                        fs.mkdirSync(registryPath, { recursive: true });
                    }
                    if (fs.statSync(params.filePath).isDirectory()) {
                        fs.cpSync(params.filePath, destPath, { recursive: true });
                        transformedPath = path.join(transformedPath, params.registryPath, fileName);
                        createMetadataFilesForRegistryCollection(destPath, transformedPath);
                        addNewEntryToArtifactXML(params.projectDirectory, params.artifactName, fileName, transformedPath, "", true);
                    } else {
                        fs.copyFileSync(params.filePath, destPath);
                        transformedPath = path.join(transformedPath, params.registryPath);
                        const mediaType = await detectMediaType(params.filePath);
                        addNewEntryToArtifactXML(params.projectDirectory, params.artifactName, fileName, transformedPath, mediaType, false);
                    }
                    commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                    resolve({ path: destPath });
                }
            } else {
                let fileName = params.resourceName;
                const fileData = getMediatypeAndFileExtension(params.templateType);
                fileName = fileName + "." + fileData.fileExtension;
                let fileContent = params.content ? params.content : getRegistryResourceContent(params.templateType, params.resourceName);
                const registryPath = path.join(registryDir, params.registryPath);
                const destPath = path.join(registryPath, fileName);
                if (!fs.existsSync(registryPath)) {
                    fs.mkdirSync(registryPath, { recursive: true });
                }
                fs.writeFileSync(destPath, fileContent ? fileContent : "");
                //add the new entry to artifact.xml
                transformedPath = path.join(transformedPath, params.registryPath);
                addNewEntryToArtifactXML(params.projectDirectory, params.artifactName, fileName, transformedPath, fileData.mediaType, false);
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                resolve({ path: destPath });
            }
        });
    }

    async createClassMediator(params: CreateClassMediatorRequest): Promise<CreateClassMediatorResponse> {
        return new Promise(async (resolve) => {
            const content = getClassMediatorContent({ name: params.className, package: params.packageName });
            const packagePath = params.packageName.replace(/\./g, path.sep);
            const fullPath = path.join(params.projectDirectory, packagePath);
            fs.mkdirSync(fullPath, { recursive: true });
            const filePath = path.join(fullPath, `${params.className}.java`);
            fs.writeFileSync(filePath, content);
            const fileUri = Uri.file(params.projectDirectory);
            const workspaceFolder = workspace.getWorkspaceFolder(fileUri)?.uri.fsPath ?? workspace.getWorkspaceFolder[0].uri.fsPath;
            changeRootPomPackaging(workspaceFolder, "jar");
            addSynapseDependency(workspaceFolder);
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: filePath });
        });
    }

    async getSelectiveWorkspaceContext(): Promise<GetSelectiveWorkspaceContextResponse> {
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace is currently open');
        }

        var currentFile = StateMachine.context().documentUri;
        //get the current file's content
        let currentFileContent = '';
        if (currentFile) {
            currentFileContent = fs.readFileSync(currentFile, 'utf8');
        }
        var rootPath = workspaceFolders[0].uri.fsPath;
        rootPath += '/src/main/wso2mi/artifacts';
        const fileContents: string[] = [];
        fileContents.push(currentFileContent);
        var resourceFolders = ['apis', 'endpoints', 'inbound-endpoints', 'local-entries', 'message-processors', 'message-stores', 'proxy-services', 'sequences', 'tasks', 'templates'];
        for (const folder of resourceFolders) {
            const folderPath = path.join(rootPath, folder);
            const files = await fs.promises.readdir(folderPath);

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                if (filePath === currentFile) {
                    continue;
                }
                const stats = await fs.promises.stat(filePath);

                if (stats.isFile()) {
                    const content = await fs.promises.readFile(filePath, 'utf-8');
                    fileContents.push(content);
                }
            }
        }


        return { context: fileContents };
    }

    async getBackendRootUrl(): Promise<GetBackendRootUrlResponse> {

        const config = vscode.workspace.getConfiguration('integrationStudio');
        const ROOT_URL = config.get('rootUrl') as string;
        return { url: ROOT_URL };
    }

    async getAvailableRegistryResources(params: ListRegistryArtifactsRequest): Promise<RegistryArtifactNamesResponse> {
        return new Promise(async (resolve) => {
            const response = await getAvailableRegistryResources(params.path);
            const artifacts = response.artifacts;
            var tempArtifactNames: string[] = [];
            for (let i = 0; i < artifacts.length; i++) {
                tempArtifactNames.push(artifacts[i].name);
            }
            resolve({ artifacts: tempArtifactNames });
        });
    }

    async migrateProject({ source }: MigrateProjectRequest): Promise<MigrateProjectResponse> {
        return new Promise(async (resolve) => {
            const selection = await vscode.window.showQuickPick(
                [
                    {
                        label: "Select Destination",
                        description: "Select a destination folder to migrate the project",
                    },
                ],
                {
                    placeHolder: "Migration Options",
                }
            );

            let target;
            switch (selection?.label) {
                case "Select Destination":
                    target = await vscode.commands.executeCommand(COMMANDS.SELECT_DESTINATION, { sourceDir: source });
                    break;
            }

            if (source && target) {
                importProject({ source, directory: target, open: true });
                resolve({ filePath: target });
            }
        });
    }

    async getAvailableConnectors(params: GetAvailableConnectorRequest): Promise<GetAvailableConnectorResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.getAvailableConnectors({
                documentUri: params.documentUri,
                connectorName: params.connectorName
            });

            resolve(res);
        });
    }

    async updateConnectors(params: UpdateConnectorRequest): Promise<void> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.updateConnectors({
                documentUri: params.documentUri
            });

            resolve(res);
        })
    }

    async createDataSource(params: DataSourceTemplate): Promise<CreateDataSourceResponse> {
        return new Promise(async (resolve) => {
            const xmlData = await getDataserviceXml(params);
            const dsPath = path.join(params.projectDirectory, 'src', 'main', 'wso2mi', 'artifacts', 'Data-Sources', params.name + '.xml');
            fs.writeFileSync(dsPath, xmlData);
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: dsPath });
        });
    }

    async getDataSource(params: GetDataSourceRequest): Promise<DataSourceTemplate> {
        const options = {
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            attributeNamePrefix: "@",
        };
        const parser = new XMLParser(options);
        return new Promise(async (resolve) => {
            const filePath = params.path;
            if (filePath.includes('.xml') && fs.existsSync(filePath)) {
                const xmlData = fs.readFileSync(filePath, "utf8");
                const jsonData = parser.parse(xmlData);
                var response: DataSourceTemplate = {
                    projectDirectory: '',
                    type: jsonData.datasource.definition['@type'] === 'RDBMS' ? 'RDBMS' : 'Custom',
                    name: jsonData.datasource.name,
                    description: jsonData.datasource.description ?? '',
                };
                if (jsonData.datasource.definition['@type'] === 'RDBMS') {
                    if (jsonData.datasource.definition.configuration) {
                        response.driverClassName = jsonData.datasource.definition.configuration.driverClassName ?? '';
                        response.url = jsonData.datasource.definition.configuration.url ?? '';
                        response.driverClassName = jsonData.datasource.definition.configuration.driverClassName ?? '';
                        response.username = jsonData.datasource.definition.configuration.username ?? '';
                        response.password = jsonData.datasource.definition.configuration.password ?? '';
                        const params: { [key: string]: string | number | boolean } = {};
                        if (jsonData.datasource.definition.configuration) {
                            Object.entries(jsonData.datasource.definition.configuration).forEach(([key, value]) => {
                                params[key] = value as string | number | boolean;
                            });
                        }
                        // remove duplicates
                        delete params.driverClassName;
                        delete params.url;
                        delete params.username;
                        delete params.password;
                        delete params.dataSourceClassName;
                        delete params.dataSourceProps;
                        response.dataSourceConfigParameters = params;
                    }
                    if (jsonData.datasource.jndiConfig) {
                        response.jndiConfig = {
                            JNDIConfigName: jsonData.datasource.jndiConfig.name,
                            useDataSourceFactory: jsonData.datasource.jndiConfig['@useDataSourceFactory'],
                        };
                        if (jsonData.datasource.jndiConfig.environment.property) {
                            const params: { [key: string]: string | number | boolean } = {};
                            jsonData.datasource.jndiConfig.environment.property.forEach((item) => {
                                const key = item['@name'].toString();
                                const val = item['#text'];
                                params[key] = val;
                            });
                            response.jndiConfig.properties = params;
                        }
                    }
                    if (jsonData.datasource.definition.configuration.dataSourceClassName) {
                        response.externalDSClassName = jsonData.datasource.definition.configuration.dataSourceClassName;
                        if (jsonData.datasource.definition.configuration.dataSourceProps.property) {
                            const params: { [key: string]: string | number | boolean } = {};
                            jsonData.datasource.definition.configuration.dataSourceProps.property.forEach((item) => {
                                const key = item['@name'].toString();
                                const val = item['#text'];
                                params[key] = val;
                            });
                            response.dataSourceProperties = params;
                        }
                    }
                }
                if (jsonData.datasource.definition['@type'] !== 'RDBMS') {
                    response.customDSType = jsonData.datasource.definition['@type'];
                    response.customDSConfiguration = jsonData.datasource.definition['#text'];
                }
                return resolve(response);
            }
            resolve(Promise.reject(new Error('Invalid data source')));
        });
    }

    async getIconPathUri(params: GetIconPathUriRequest): Promise<GetIconPathUriResponse> {
        return new Promise(async (resolve) => {
            if (VisualizerWebview.currentPanel) {
                let iconUri = VisualizerWebview.currentPanel.getIconPath(params.path, params.name);
                resolve({ uri: iconUri });
            }
        });
    }

    async getUserAccessToken(): Promise<GetUserAccessTokenResponse> {
        const token = await extension.context.secrets.get('MIAIUser');
        if (token) {
            return { token: token };
        } else {
            throw new Error('User access token not found');
        }

    }

    async createConnection(params: CreateConnectionRequest): Promise<CreateConnectionResponse> {
        return new Promise(async (resolve) => {
            const { connectionName, keyValuesXML, directory } = params;
            const localEntryPath = directory;

            const xmlData =
                `<?xml version="1.0" encoding="UTF-8"?>
    <localEntry key="${connectionName}" xmlns="http://ws.apache.org/ns/synapse">
        ${keyValuesXML}
    </localEntry>`;

            const filePath = path.join(localEntryPath, `${connectionName}.xml`);
            if (!fs.existsSync(localEntryPath)) {
                fs.mkdirSync(localEntryPath);
            }

            fs.writeFileSync(filePath, xmlData);
            resolve({ name: connectionName });
        });
    }

    async getConnectorConnections(params: GetConnectorConnectionsRequest): Promise<GetConnectorConnectionsResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.getConnectorConnections({
                documentUri: params.documentUri,
                connectorName: params.connectorName
            });

            resolve(res);
        });
    }

    async logoutFromMIAccount(): Promise<void> {
        const confirm = await window.showInformationMessage('Are you sure you want to logout?', 'Yes', 'No');
        if (confirm === 'Yes') {
            const token = await extension.context.secrets.get('MIAIUser');
            const clientId = 'i42PUygaucczvuPmhZFw5x8Lmswa';

            let response = await fetch('https://api.asgardeo.io/t/wso2midev/oauth2/revoke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `token=${token}&client_id=${clientId}`
            });

            await extension.context.secrets.delete('MIAIUser');
            await extension.context.secrets.delete('MIAIRefreshToken');
            StateMachineAI.sendEvent(AI_EVENT_TYPE.LOGOUT);
        } else {
            return;
        }
    }

    async getAllRegistryPaths(params: GetAllRegistryPathsRequest): Promise<GetAllRegistryPathsResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.getRegistryFiles(params.path);
            resolve({ registryPaths: res });
        });
    }

    async getAllArtifacts(params: GetAllArtifactsRequest): Promise<GetAllArtifactsResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.getArifactFiles(params.path);
            resolve({ artifacts: res });
        });
    }

    async getEndpointsList(endpointList: any, filePath: string, isLoadBalanceEp: boolean): Promise<any[]> {
        return new Promise(async (resolve) => {
            const endpoints: any[] = [];
            const endpointRegex = /<endpoint(.*?)>(.*?)<\/endpoint>/gs;
            const options = {
                ignoreAttributes: false,
                allowBooleanAttributes: true,
                attributeNamePrefix: "",
                attributesGroupName: "@_",
                indentBy: '    ',
                format: true,
            };
            const parser = new XMLParser(options);
            const builder = new XMLBuilder(options);

            endpointList.map((member: any) => {
                if (isLoadBalanceEp) {
                    if (member.endpoint?.key) {
                        endpoints.push({ type: 'static', value: member.endpoint.key });
                    }
                } else {
                    if (member.key) {
                        endpoints.push({ type: 'static', value: member.key });
                    }
                }
            });

            let xmlString = fs.readFileSync(filePath, "utf8");
            xmlString = xmlString.slice(0, xmlString.indexOf("<endpoint")) +
                xmlString.slice(xmlString.indexOf(">", xmlString.indexOf("<endpoint")) + 1);
            xmlString = xmlString.replace(/<endpoint\s+[^>]*\/>/ig, "");

            let match;
            while ((match = endpointRegex.exec(xmlString)) !== null) {
                endpoints.push({ type: 'inline', value: builder.build(parser.parse(match[0])) as string });
            }
            resolve(endpoints);
        });
    }

    async deleteArtifact(params: DeleteArtifactRequest): Promise<void> {
        return new Promise(async (resolve) => {
            // Initialize undo redo manager with the file content
            if (params.enableUndo) {
                await this.initUndoRedoManager({ path: params.path });
            }

            await workspace.fs.delete(Uri.file(params.path));
            await vscode.commands.executeCommand(COMMANDS.REFRESH_COMMAND); // Refresh the project explore view
            navigate();

            if (params.enableUndo) {
                undoRedo.addModification('');
                const selection = await vscode.window.showInformationMessage('Do you want to undo the deletion?', 'Undo');
                if (selection === 'Undo') {
                    this.undo({ path: params.path });
                    await vscode.commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                    navigate();
                }
            }

            resolve();
        });
    }

    async refreshAccessToken(): Promise<void> {
        const CommonReqHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf8',
            'Accept': 'application/json'
        };
        const refresh_token = await extension.context.secrets.get('MIAIRefreshToken');
        const config = vscode.workspace.getConfiguration('integrationStudio');
        const AUTH_ORG = config.get('authOrg') as string;
        const AUTH_CLIENT_ID = config.get('authClientID') as string;
        if (!refresh_token) {
            throw new Error("Refresh token is not available.");
        } else {
            try {
                console.log("Refreshing token...");
                const params = new URLSearchParams({
                    client_id: AUTH_CLIENT_ID,
                    refresh_token: refresh_token,
                    grant_type: 'refresh_token',
                    scope: 'openid email'
                });
                const response = await axios.post(`https://api.asgardeo.io/t/${AUTH_ORG}/oauth2/token`, params.toString(), { headers: CommonReqHeaders });
                const newAccessToken = response.data.access_token;
                const newRefreshToken = response.data.refresh_token;
                await extension.context.secrets.store('MIAIUser', newAccessToken);
                await extension.context.secrets.store('MIAIRefreshToken', newRefreshToken);
                console.log("Token refreshed successfully!");
            } catch (error: any) {
                const errMsg = "Error while refreshing token! " + error?.message;
                throw new Error(errMsg);
            }
        }
    }

    async buildProject(): Promise<void> {
        return new Promise(async (resolve) => {
            await commands.executeCommand(COMMANDS.BUILD_PROJECT, false);
            resolve();
        });
    }

    async exportProject(params: ExportProjectRequest): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const carFile = await vscode.workspace.findFiles(
                new vscode.RelativePattern(params.projectPath, 'target/*.car'),
                null,
                1
            );
            if (carFile.length === 0) {
                const errorMessage = 
                    'Error: No .car file found in the target directory. Please build the project before exporting.';
                window.showErrorMessage(errorMessage);
                log(errorMessage);
                return reject(errorMessage);
            }

            const selection = await vscode.window.showQuickPick(
                [
                    {
                        label: "Select Destination",
                        description: "Select a destination folder to export .car file",
                    },
                ],
                {
                    placeHolder: "Export Options",
                }
            );

            if (selection) {
                // Get the destination folder
                const { filePath: destination } = await this.browseFile({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    defaultUri: params.projectPath,
                    title: "Select a folder to export the project",
                    openLabel: "Select Folder"
                });
                if (destination) {
                    const destinationPath = path.join(destination, path.basename(carFile[0].fsPath));
                    fs.copyFileSync(carFile[0].fsPath, destinationPath);
                    log(`Project exported to: ${destination}`);
                    resolve();
                }
            }
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

export async function askImportProjectPath() {
    return await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        defaultUri: Uri.file(os.homedir()),
        title: "Select the root directory of the project to import"
    });
}

export async function askFilePath() {
    return await window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        defaultUri: Uri.file(os.homedir()),
        title: "Select a file",
    });
}
