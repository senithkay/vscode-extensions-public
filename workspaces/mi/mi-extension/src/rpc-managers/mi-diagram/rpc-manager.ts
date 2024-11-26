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
    APIContextsResponse,
    AddDriverRequest,
    AddDriverToLibRequest,
    AddDriverToLibResponse,
    ApiDirectoryResponse,
    ApplyEditRequest,
    ApplyEditResponse,
    BrowseFileRequest,
    BrowseFileResponse,
    CommandsRequest,
    CommandsResponse,
    CompareSwaggerAndAPIResponse,
    Configuration,
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
    CreateDataServiceRequest,
    CreateDataServiceResponse,
    CreateDataSourceResponse,
    CreateDssDataSourceRequest,
    CreateDssDataSourceResponse,
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
    DSSFetchTablesRequest,
    DSSFetchTablesResponse,
    DataSourceTemplate,
    Datasource,
    DeleteArtifactRequest,
    Dependency,
    DownloadConnectorRequest,
    DownloadConnectorResponse,
    DownloadInboundConnectorRequest,
    DownloadInboundConnectorResponse,
    ESBConfigsResponse,
    EVENT_TYPE,
    EditAPIRequest,
    EditAPIResponse,
    EndpointDirectoryResponse,
    EndpointsAndSequencesResponse,
    ExportProjectRequest,
    ExtendedDSSQueryGenRequest,
    ExpressionCompletionsRequest,
    ExpressionCompletionsResponse,
    FileDirResponse,
    FileRenameRequest,
    FileStructure,
    GenerateAPIResponse,
    GetAllArtifactsRequest,
    GetAllArtifactsResponse,
    GetAllDependenciesResponse,
    GetAllMockServicesResponse,
    GetAllRegistryPathsRequest,
    GetAllRegistryPathsResponse,
    GetAllTestSuitsResponse,
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
    GetInboundEPUischemaRequest,
    GetInboundEPUischemaResponse,
    GetInboundEndpointRequest,
    GetInboundEndpointResponse,
    GetLoadBalanceEPRequest,
    GetLoadBalanceEPResponse,
    GetLocalEntryRequest,
    GetLocalEntryResponse,
    GetMediatorRequest,
    GetMediatorResponse,
    GetMediatorsRequest,
    GetMediatorsResponse,
    GetMessageStoreRequest,
    GetMessageStoreResponse,
    GetProjectRootRequest,
    GetProjectUuidResponse,
    GetRecipientEPRequest,
    GetRecipientEPResponse,
    GetRegistryMetadataRequest,
    GetRegistryMetadataResponse,
    GetSTFromUriRequest,
    GetSelectiveArtifactsRequest,
    GetSelectiveArtifactsResponse,
    GetSelectiveWorkspaceContextResponse,
    GetSubFoldersRequest,
    GetSubFoldersResponse,
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
    MarkAsDefaultSequenceRequest,
    MiDiagramAPI,
    MigrateProjectRequest,
    MigrateProjectResponse,
    OpenDependencyPomRequest,
    OpenDiagramRequest,
    POPUP_EVENT_TYPE,
    ProjectDirResponse,
    ProjectRootResponse,
    Property,
    RangeFormatRequest,
    RegistryArtifact,
    RegistryArtifactNamesResponse,
    RetrieveAddressEndpointRequest,
    RetrieveAddressEndpointResponse,
    RetrieveDataServiceRequest,
    RetrieveDataServiceResponse,
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
    SaveInboundEPUischemaRequest,
    SequenceDirectoryResponse,
    ShowErrorMessageRequest,
    StoreConnectorJsonResponse,
    SwaggerData,
    SwaggerFromAPIResponse,
    SwaggerTypeRequest,
    TemplatesResponse,
    TestDbConnectionRequest,
    TestDbConnectionResponse,
    UndoRedoParams,
    UpdateAPIFromSwaggerRequest,
    UpdateAddressEndpointRequest,
    UpdateAddressEndpointResponse,
    UpdateConnectorRequest,
    UpdateDefaultEndpointRequest,
    UpdateDefaultEndpointResponse,
    UpdateDependencyInPomRequest,
    UpdateFailoverEPRequest,
    UpdateFailoverEPResponse,
    UpdateHttpEndpointRequest,
    UpdateHttpEndpointResponse,
    UpdateLoadBalanceEPRequest,
    UpdateLoadBalanceEPResponse,
    UpdateMediatorRequest,
    UpdateMockServiceRequest,
    UpdateMockServiceResponse,
    UpdateRecipientEPRequest,
    UpdateRecipientEPResponse,
    UpdateRegistryMetadataRequest,
    UpdateRegistryMetadataResponse,
    UpdateTemplateEPRequest,
    UpdateTemplateEPResponse,
    UpdateTestCaseRequest,
    UpdateTestCaseResponse,
    UpdateTestSuiteRequest,
    UpdateTestSuiteResponse,
    UpdateWsdlEndpointRequest,
    UpdateWsdlEndpointResponse,
    WriteContentToFileRequest,
    WriteContentToFileResponse,
    getAllDependenciesRequest,
    getSTRequest,
    getSTResponse,
    onDownloadProgress,
    MediatorTryOutRequest,
    MediatorTryOutResponse,
    SavePayloadRequest,
    GetPayloadRequest,
    GetPayloadResponse,
    onSwaggerSpecReceived
} from "@wso2-enterprise/mi-core";
import axios from 'axios';
import { error } from "console";
import * as fs from "fs";
import { copy, remove } from 'fs-extra';
import { isEqual, reject } from "lodash";
import * as os from 'os';
import { getPortPromise } from "portfinder";
import { Transform } from 'stream';
import * as tmp from 'tmp';
import { v4 as uuidv4 } from 'uuid';
import * as vscode from 'vscode';
import { Position, Range, Selection, TextEdit, Uri, ViewColumn, WorkspaceEdit, commands, window, workspace } from "vscode";
import { parse, stringify } from "yaml";
import { UnitTest } from "../../../../syntax-tree/lib/src";
import { extension } from '../../MIExtensionContext';
import { RPCLayer } from "../../RPCLayer";
import { StateMachineAI } from '../../ai-panel/aiMachine';
import { APIS, COMMANDS, DEFAULT_PROJECT_VERSION, LAST_EXPORTED_CAR_PATH, MI_COPILOT_BACKEND_URL, SWAGGER_REL_DIR } from "../../constants";
import { StateMachine, navigate, openView } from "../../stateMachine";
import { openPopupView } from "../../stateMachinePopup";
import { openSwaggerWebview } from "../../swagger/activate";
import { testFileMatchPattern } from "../../test-explorer/discover";
import { mockSerivesFilesMatchPattern } from "../../test-explorer/mock-services/activator";
import { UndoRedoManager } from "../../undoRedoManager";
import { copyDockerResources, copyMavenWrapper, createFolderStructure, getAPIResourceXmlWrapper, getAddressEndpointXmlWrapper, getDataServiceXmlWrapper, getDefaultEndpointXmlWrapper, getDssDataSourceXmlWrapper, getFailoverXmlWrapper, getHttpEndpointXmlWrapper, getInboundEndpointXmlWrapper, getLoadBalanceXmlWrapper, getMessageProcessorXmlWrapper, getMessageStoreXmlWrapper, getProxyServiceXmlWrapper, getRegistryResourceContent, getTaskXmlWrapper, getTemplateEndpointXmlWrapper, getTemplateXmlWrapper, getWsdlEndpointXmlWrapper, createGitignoreFile } from "../../util";
import { addNewEntryToArtifactXML, addSynapseDependency, changeRootPomPackaging, createMetadataFilesForRegistryCollection, deleteRegistryResource, detectMediaType, getAvailableRegistryResources, getMediatypeAndFileExtension, getRegistryResourceMetadata, updateRegistryResourceMetadata } from "../../util/fileOperations";
import { log } from "../../util/logger";
import { importProject } from "../../util/migrationUtils";
import { getResourceInfo, isEqualSwaggers, mergeSwaggers } from "../../util/swagger";
import { getDataSourceXml } from "../../util/template-engine/mustach-templates/DataSource";
import { getClassMediatorContent } from "../../util/template-engine/mustach-templates/classMediator";
import { generateXmlData, writeXmlDataToFile } from "../../util/template-engine/mustach-templates/createLocalEntry";
import { getRecipientEPXml } from "../../util/template-engine/mustach-templates/recipientEndpoint";
import { dockerfileContent, rootPomXmlContent } from "../../util/templates";
import { replaceFullContentToFile } from "../../util/workspace";
import { VisualizerWebview } from "../../visualizer/webview";
import path = require("path");
import { importCapp } from "../../util/importCapp";
import { getDefaultProjectPath } from "../../util/onboardingUtils";
const AdmZip = require('adm-zip');

const { XMLParser, XMLBuilder } = require("fast-xml-parser");

const connectorsPath = path.join(".metadata", ".Connectors");

const undoRedo = new UndoRedoManager();

const connectorCache = new Map<string, any>();

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

    async saveInputPayload(params: SavePayloadRequest): Promise<boolean> {
        return new Promise((resolve) => {

            const projectUri = StateMachine.context().projectUri!;
            const tryout = path.join(projectUri, ".tryout");
            if (!fs.existsSync(tryout)) {
                fs.mkdirSync(tryout);
            }
            fs.writeFileSync(path.join(tryout, "input.json"), params.payload);
            resolve(true);
        });
    }

    async getInputPayload(params: GetPayloadRequest): Promise<GetPayloadResponse> {
        return new Promise((resolve) => {
            const projectUri = StateMachine.context().projectUri!;
            const tryout = path.join(projectUri, ".tryout", "input.json");
            if (fs.existsSync(tryout)) {
                const payload = fs.readFileSync(tryout, "utf8");
                resolve({ hasPayload: true, payload });
            } else {
                resolve({ hasPayload: false })
            }
        });
    }

    async tryOutMediator(params: MediatorTryOutRequest): Promise<MediatorTryOutResponse> {
        return new Promise(async (resolve) => {
            const projectUri = StateMachine.context().projectUri!;
            const payloadPath = path.join(projectUri, ".tryout", "input.json");
            const payload = fs.readFileSync(payloadPath, "utf8");
            // const payloadJson = JSON.parse(payload);
            params.inputPayload = payload
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.tryOutMediator(params);
            resolve(res);
        });
    }

    async getMediatorInputOutputSchema(params: MediatorTryOutRequest): Promise<MediatorTryOutResponse> {
        return new Promise(async (resolve) => {
            const projectUri = StateMachine.context().projectUri!;
            const payloadPath = path.join(projectUri, ".tryout", "input.json");
            const payload = fs.readFileSync(payloadPath, "utf8");
            params.inputPayload = payload
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.getMediatorInputOutputSchema(params);
            resolve(res);
        });
    }

    async getSyntaxTree(params: getSTRequest): Promise<getSTResponse> {
        const isGetSTFromUriRequest = (params: any): params is GetSTFromUriRequest => {
            return (params as GetSTFromUriRequest).documentUri !== undefined;
        };

        let documentUri = '';
        if (isGetSTFromUriRequest(params)) {
            documentUri = params.documentUri;
        } else {
            const projectUri = StateMachine.context().projectUri!;
            documentUri = path.join(
                projectUri,
                'src',
                'main',
                'wso2mi',
                'artifacts',
                params.artifactType,
                params.artifactName
            );
        }


        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.getSyntaxTree({
                documentIdentifier: {
                    uri: documentUri
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
            const {
                artifactDir,
                xmlData,
                name,
                version,
                saveSwaggerDef,
                swaggerDefPath,
                wsdlType,
                wsdlDefPath,
                wsdlEndpointName
            } = params;

            const getSwaggerName = (swaggerDefPath: string) => {
                const ext = path.extname(swaggerDefPath);
                return `${name}${ext}`;
            };
            let fileName: string;
            let response: GenerateAPIResponse = { apiXml: "", endpointXml: "" };
            if (!xmlData) {
                const langClient = StateMachine.context().langClient!;
                if (swaggerDefPath) {
                    response = await langClient.generateAPI({
                        apiName: name,
                        swaggerOrWsdlPath: swaggerDefPath,
                        publishSwaggerPath:
                            saveSwaggerDef ? `gov:swaggerFiles/${getSwaggerName(swaggerDefPath)}` : undefined,
                        mode: "create.api.from.swagger"
                    });
                } else if (wsdlDefPath) {
                    const filePath = wsdlType === "file" && Uri.file(wsdlDefPath).toString();
                    response = await langClient.generateAPI({
                        apiName: name,
                        swaggerOrWsdlPath: filePath || wsdlDefPath,
                        mode: "create.api.from.wsdl",
                        wsdlEndpointName
                    });
                }
                fileName = name;
            } else {
                fileName = `${name}${version ? `_v${version}` : ''}`;
            }

            const sanitizedXmlData = (xmlData || response.apiXml).replace(/^\s*[\r\n]/gm, '');
            const filePath = path.join(artifactDir, 'apis', `${fileName}.xml`);
            await replaceFullContentToFile(filePath, sanitizedXmlData);
            await this.rangeFormat({
                uri: filePath,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                }
            });

            // If WSDL is used, create an Endpoint
            if (response.endpointXml) {
                const sanitizedEndpointXml = response.endpointXml.replace(/^\s*[\r\n]/gm, '');
                const endpointFilePath = path.join(artifactDir, 'endpoints', `${name}_SOAP_ENDPOINT.xml`);
                await replaceFullContentToFile(endpointFilePath, sanitizedEndpointXml);
                await this.rangeFormat({
                    uri: endpointFilePath,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: sanitizedEndpointXml.split('\n').length + 1, character: 0 }
                    }
                });
            }

            // Save swagger file
            if (saveSwaggerDef && swaggerDefPath) {
                const workspacePath = workspace.workspaceFolders![0].uri.fsPath;
                const swaggerRegPath = path.join(
                    workspacePath,
                    SWAGGER_REL_DIR,
                    getSwaggerName(swaggerDefPath)
                );
                if (!fs.existsSync(path.dirname(swaggerRegPath))) {
                    fs.mkdirSync(path.dirname(swaggerRegPath), { recursive: true });
                }
                fs.copyFileSync(swaggerDefPath, swaggerRegPath);
            }

            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: filePath });
        });
    }

    async editAPI(params: EditAPIRequest): Promise<EditAPIResponse> {
        return new Promise(async (resolve) => {
            let { documentUri, apiName, version, xmlData, handlersXmlData, apiRange, handlersRange } = params;

            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');
            const sanitizedHandlersXmlData = handlersXmlData.replace(/^\s*[\r\n]/gm, '');

            let expectedFileName = `${apiName}${version ? `_v${version}` : ''}`;
            if (path.basename(documentUri).split('.')[0] !== expectedFileName) {
                await this.renameFile({ existingPath: documentUri, newPath: path.join(path.dirname(documentUri), `${expectedFileName}.xml`) });
                documentUri = path.join(path.dirname(documentUri), `${expectedFileName}.xml`);
            }

            await this.applyEdit({ text: sanitizedXmlData, documentUri, range: apiRange });
            await this.rangeFormat({ uri: documentUri, range: apiRange });

            if (sanitizedHandlersXmlData) {
                await this.applyEdit({ text: sanitizedHandlersXmlData, documentUri, range: handlersRange });
                await this.rangeFormat({ uri: documentUri, range: handlersRange });
            }

            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: documentUri });
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
            await replaceFullContentToFile(filePath, xmlData);
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
                const filePath = await this.getFilePath(directory, templateParams.name);
                await replaceFullContentToFile(filePath, sanitizedXmlData);
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
                const filePath = await this.getFilePath(directory, templateParams.name);
                await replaceFullContentToFile(filePath, sanitizedXmlData);
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
                const filePath = await this.getFilePath(directory, templateParams.name);
                await replaceFullContentToFile(filePath, sanitizedXmlData);
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
                const filePath = await this.getFilePath(directory, templateParams.name);
                await replaceFullContentToFile(filePath, sanitizedXmlData);
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
            let { directory, name, type, value, URL } = params;
            const xmlData = generateXmlData(name, type, value, URL);

            if (directory.includes('localEntries')) {
                directory = directory.replace('localEntries', 'local-entries');
            }
            const filePath = await this.getFilePath(directory, name);

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
                    if (jsonData.localEntry["#text"]) {
                        response.type = "In-Line Text Entry";
                        response.inLineTextValue = jsonData.localEntry["#text"];
                    } else if (jsonData.localEntry["@_"]["src"]) {
                        response.type = "Source URL Entry";
                        response.sourceURL = jsonData.localEntry["@_"]["src"];
                    } else if (firstEntryKey) {
                        response.type = "In-Line XML Entry";
                        const xmlObj = {
                            [firstEntryKey]: {
                                ...jsonData.localEntry[firstEntryKey]
                            }
                        }
                        const builder = new XMLBuilder(options);
                        let xml = builder.build(xmlObj).replace(/&apos;/g, "'");
                        response.inLineXmlValue = xml;
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

            let getTemplateParams = params;

            const xmlData = getMessageStoreXmlWrapper(getTemplateParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

            if (getTemplateParams.directory.includes('messageStores')) {
                getTemplateParams.directory = getTemplateParams.directory.replace('messageStores', 'message-stores');
            }
            const filePath = await this.getFilePath(getTemplateParams.directory, getTemplateParams.name);

            await replaceFullContentToFile(filePath, sanitizedXmlData);
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
                                if (MessageStoreModel[param.name] === "jmsAPIVersion") {
                                    response.jmsAPIVersion = Number(param.value).toFixed(1);
                                } else {
                                    if (param.value != null) {
                                        response[MessageStoreModel[param.name]] = param.value;
                                    }
                                }
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
            let { attributes, parameters, directory } = params;

            if (directory.includes('inboundEndpoints')) {
                directory = directory.replace('inboundEndpoints', 'inbound-endpoints');
            }
            const filePath = await this.getFilePath(directory, attributes.name as string);

            const xmlData = getInboundEndpointXmlWrapper({ attributes, parameters });

            const endpointsAndSequences = await this.getEndpointsAndSequences();

            const sequenceList = endpointsAndSequences.data[1];
            const projectDir = (await this.getProjectRoot({ path: directory })).path;

            if (attributes.sequence) {
                if (!(sequenceList.includes(attributes.sequence as string))) {

                    const sequenceDir = path.join(projectDir, 'src', 'main', 'wso2mi', 'artifacts', 'sequences').toString();
                    const sequenceRequest: CreateSequenceRequest = {
                        name: attributes.sequence as string,
                        directory: sequenceDir,
                        endpoint: "",
                        onErrorSequence: "",
                        getContentOnly: false,
                        statistics: false,
                        trace: false
                    };
                    const response = await this.createSequence(sequenceRequest);
                }
            }

            if (attributes.onError) {
                if (!(sequenceList.includes(attributes.onError as string))) {

                    const sequenceDir = path.join(projectDir, 'src', 'main', 'wso2mi', 'artifacts', 'sequences').toString();
                    const sequenceRequest: CreateSequenceRequest = {
                        name: attributes.onError as string,
                        directory: sequenceDir,
                        endpoint: "",
                        onErrorSequence: "",
                        getContentOnly: false,
                        statistics: false,
                        trace: false
                    };
                    await this.createSequence(sequenceRequest);
                }
            }

            await replaceFullContentToFile(filePath, xmlData);
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

    async getAllAPIcontexts(): Promise<APIContextsResponse> {
        return new Promise(async (resolve) => {
            const rootPath = workspace.workspaceFolders && workspace.workspaceFolders.length > 0 ?
                workspace.workspaceFolders[0].uri.fsPath
                : undefined;

            if (!!rootPath) {
                const langClient = StateMachine.context().langClient!;
                const resp = await langClient.getProjectStructure(rootPath);
                const artifacts = (resp.directoryMap as any).src.main.wso2mi.artifacts;

                const contexts: string[] = [];

                for (const api of artifacts.apis) {
                    contexts.push(api.context);
                }

                resolve({ contexts: contexts });
            }

            resolve({ contexts: [] });
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
                endpointAttributes = `\t<send>\n\t\t<endpoint key="${endpoint.replace(".xml", "")}"/>\n\t</send>`;
            }

            if (onErrorSequence) {
                errorSequence = `onError="${onErrorSequence}" `;
            }
            if (statistics) {
                statisticsAttribute = `statistics="enable" `;
            }
            if (trace) {
                traceAttribute = `trace="enable" `;
            } else {
                traceAttribute = `trace="disable" `;
            }

            const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<sequence name="${name}" ${errorSequence}${traceAttribute}${statisticsAttribute}xmlns="http://ws.apache.org/ns/synapse">
${endpointAttributes}
</sequence>`;

            if (params.getContentOnly) {
                resolve({ filePath: "", fileContent: xmlData });
            } else {
                const filePath = path.join(directory, `${name}.xml`);
                await replaceFullContentToFile(filePath, xmlData);
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
            await replaceFullContentToFile(filePath, sanitizedXmlData);
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
                taskProperties: tempParams,
                customProperties: params.customProperties
            };
            const xmlData = getTaskXmlWrapper(mustacheParams);

            const filePath = await this.getFilePath(directory, templateParams.name);
            if (params.sequence) {
                await this.createSequence(params.sequence);
            }
            await replaceFullContentToFile(filePath, xmlData);
            openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TaskView, documentUri: filePath });
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
                    triggerCount: null,
                    triggerInterval: 1,
                    triggerCron: '',
                    taskProperties: []
                };

                if (jsonData.task.trigger["@_"]["@_once"] !== undefined) {
                    response.triggerCount = 1;
                } else if (jsonData.task.trigger["@_"]["@_interval"] !== undefined) {
                    response.triggerInterval = Number(jsonData.task.trigger["@_"]["@_interval"]);
                    response.triggerCount = jsonData.task.trigger["@_"]?.["@_count"] != null ?
                        Number(jsonData.task.trigger["@_"]["@_count"]) : null;
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
                const filePath = await this.getFilePath(directory, templateName);
                await replaceFullContentToFile(filePath, sanitizedXmlData);
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
                                const templateProperty = {
                                    name: param["@_"]["@_name"],
                                    isMandatory: param["@_"]["@_isMandatory"],
                                    default: param["@_"]["@_defaultValue"] ?? ""
                                };
                                response.parameters.push(templateProperty);
                            });
                        } else {
                            const templateProperty = {
                                name: params["@_"]["@_name"],
                                isMandatory: params["@_"]["@_isMandatory"],
                                default: params["@_"]["@_defaultValue"] ?? ""
                            };
                            response.parameters.push(templateProperty);
                        }
                    }
                }

                resolve(response);
            }
        });
    }

    // XXXX
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
                const filePath = await this.getFilePath(directory, fileName);
                await replaceFullContentToFile(filePath, sanitizedXmlData);
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
                const filePath = await this.getFilePath(directory, fileName);
                await replaceFullContentToFile(filePath, sanitizedXmlData);
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
                const filePath = await this.getFilePath(directory, fileName);
                await replaceFullContentToFile(filePath, sanitizedXmlData);
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
                const filePath = await this.getFilePath(directory, fileName);
                await replaceFullContentToFile(filePath, sanitizedXmlData);
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

    async createDataService(params: CreateDataServiceRequest): Promise<CreateDataServiceResponse> {
        return new Promise(async (resolve) => {
            let filePath;
            if (params.directory.endsWith('.dbs')) {
                filePath = params.directory;
                const data = await fs.readFileSync(filePath);
                const resourcePattern = /<resource[\s\S]*?<\/resource>/g;
                const operationPattern = /<operation[\s\S]*?<\/operation>/g;
                const queryPattern = /<query[\s\S]*?<\/query>/g;
                const resources: any[] = [];
                const operations: any[] = [];
                const queries: any[] = [];
                let match;

                while ((match = resourcePattern.exec(data.toString())) !== null) {
                    resources.push(match[0]);
                }
                while ((match = operationPattern.exec(data.toString())) !== null) {
                    operations.push(match[0]);
                }
                while ((match = queryPattern.exec(data.toString())) !== null) {
                    queries.push(match[0]);
                }

                params.resources = resources;
                params.operations = operations;
                params.queries = queries;
                await this.updateDataService(params);
            } else {
                const {
                    directory, dataServiceName, dataServiceNamespace, serviceGroup, selectedTransports, publishSwagger, jndiName,
                    enableBoxcarring, enableBatchRequests, serviceStatus, disableLegacyBoxcarringMode, enableStreaming,
                    description, datasources, authProviderClass, authProperties, queries, operations, resources
                } = params;

                const getDataServiceParams = {
                    dataServiceName, dataServiceNamespace, serviceGroup, selectedTransports, publishSwagger, jndiName,
                    enableBoxcarring, enableBatchRequests, serviceStatus, disableLegacyBoxcarringMode, enableStreaming,
                    description, datasources, authProviderClass, authProperties, queries, operations, resources
                };

                const xmlData = getDataServiceXmlWrapper({ ...getDataServiceParams, writeType: "create" });
                const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

                filePath = path.join(directory, `${dataServiceName}.dbs`);
                if (filePath.includes('dataServices')) {
                    filePath = filePath.replace('dataServices', 'data-services');
                }

                await replaceFullContentToFile(filePath, sanitizedXmlData);
                await this.rangeFormat({
                    uri: filePath,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                    }
                });
            }

            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: filePath });
        });
    }

    async updateDataService(params: CreateDataServiceRequest): Promise<CreateDataServiceResponse> {
        return new Promise(async (resolve) => {
            const {
                dataServiceName, dataServiceNamespace, serviceGroup, selectedTransports, publishSwagger, jndiName,
                enableBoxcarring, enableBatchRequests, serviceStatus, disableLegacyBoxcarringMode, enableStreaming,
                description, datasources, authProviderClass, authProperties, queries, operations, resources
            } = params;

            const getDataServiceParams = {
                dataServiceName, dataServiceNamespace, serviceGroup, selectedTransports, publishSwagger, jndiName,
                enableBoxcarring, enableBatchRequests, serviceStatus, disableLegacyBoxcarringMode, enableStreaming,
                description, datasources, authProviderClass, authProperties, queries, operations, resources
            };

            let filePath = params.directory;
            if (filePath.includes('dataServices')) {
                filePath = filePath.replace('dataServices', 'data-services');
            }

            const xmlData = getDataServiceXmlWrapper({ ...getDataServiceParams, writeType: "edit" });
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

            if (path.basename(filePath).split('.')[0] !== dataServiceName) {
                fs.unlinkSync(filePath);
                filePath = path.join(path.dirname(filePath), `${dataServiceName}.dbs`);
            }

            await replaceFullContentToFile(filePath, sanitizedXmlData);
            await this.rangeFormat({
                uri: filePath,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: sanitizedXmlData.split('\n').length + 1, character: 0 }
                }
            });

            resolve({ path: filePath });
        });
    }

    async createDssDataSource(params: CreateDssDataSourceRequest): Promise<CreateDssDataSourceResponse> {
        return new Promise(async (resolve) => {
            const {
                directory, type, dataSourceName, enableOData, dynamicUserAuthClass, datasourceProperties,
                datasourceConfigurations, dynamicUserAuthMapping
            } = params;

            const getDssDataSourceParams = {
                dataSourceName, enableOData, dynamicUserAuthClass, datasourceProperties,
                datasourceConfigurations, dynamicUserAuthMapping
            };

            const dataServiceSyntaxTree = await this.getSyntaxTree({ documentUri: params.directory });
            const dataServiceParams = dataServiceSyntaxTree.syntaxTree.data;

            let startRange, endRange;

            if (type === 'create') {
                startRange = dataServiceParams.range.endTagRange.start;
                endRange = dataServiceParams.range.endTagRange.start;
            } else {
                let datasource;
                dataServiceParams.configs.forEach((element) => {
                    if (element.id === dataSourceName) {
                        datasource = element;
                    }
                });
                startRange = datasource.range.startTagRange.start;
                endRange = datasource.range.endTagRange.end;
            }

            let filePath = directory;
            if (filePath.includes('dataServices')) {
                filePath = filePath.replace('dataServices', 'data-services');
            }

            const xmlData = getDssDataSourceXmlWrapper(getDssDataSourceParams);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

            await this.applyEdit({
                documentUri: filePath,
                range: {
                    start: startRange,
                    end: endRange
                },
                text: sanitizedXmlData
            });
            openPopupView(POPUP_EVENT_TYPE.CLOSE_VIEW, { view: null, recentIdentifier: getDssDataSourceParams.dataSourceName });
            resolve({ path: filePath });
        });
    }

    async getDataService(params: RetrieveDataServiceRequest): Promise<RetrieveDataServiceResponse> {

        const dataServiceSyntaxTree = await this.getSyntaxTree({ documentUri: params.path });
        const dataServiceParams = dataServiceSyntaxTree.syntaxTree.data;

        return new Promise(async (resolve) => {
            const filePath = params.path;

            if (fs.existsSync(filePath)) {
                let response: RetrieveDataServiceResponse = {
                    dataServiceName: dataServiceParams.name,
                    dataServiceNamespace: dataServiceParams.serviceNamespace,
                    serviceGroup: dataServiceParams.serviceGroup,
                    selectedTransports: dataServiceParams.transports,
                    publishSwagger: dataServiceParams.publishSwagger != undefined ? dataServiceParams.publishSwagger : '',
                    jndiName: dataServiceParams.txManagerJNDIName != undefined ? dataServiceParams.txManagerJNDIName : '',
                    enableBoxcarring: dataServiceParams.enableBoxcarring != undefined ? dataServiceParams.enableBoxcarring : false,
                    enableBatchRequests: dataServiceParams.enableBatchRequests != undefined ? dataServiceParams.enableBatchRequests : false,
                    serviceStatus: dataServiceParams.serviceStatus != undefined ? dataServiceParams.serviceStatus === "active" ? true : false : false,
                    disableLegacyBoxcarringMode: dataServiceParams.disableLegacyBoxcarringMode != undefined ? dataServiceParams.disableLegacyBoxcarringMode : false,
                    enableStreaming: dataServiceParams.disableStreaming != undefined ? !dataServiceParams.disableStreaming : true,
                    description: dataServiceParams.description != undefined ? dataServiceParams.description.textNode : '',
                    datasources: [] as Datasource[],
                    authProviderClass: dataServiceParams.authorizationProvider != undefined ? dataServiceParams.authorizationProvider.clazz : '',
                    http: dataServiceParams.transports != undefined ? dataServiceParams.transports.split(' ').includes('http') : false,
                    https: dataServiceParams.transports != undefined ? dataServiceParams.transports.split(' ').includes('https') : false,
                    jms: dataServiceParams.transports != undefined ? dataServiceParams.transports.split(' ').includes('jms') : false,
                    local: dataServiceParams.transports != undefined ? dataServiceParams.transports.split(' ').includes('local') : false,
                    authProperties: [] as Property[],
                };

                if (dataServiceParams.configs != undefined) {
                    let datasources: any[];
                    datasources = dataServiceParams.configs;
                    datasources.forEach((datasource) => {
                        let datasourceObject: Datasource = {
                            dataSourceName: datasource.id,
                            enableOData: datasource.enableOData != undefined ? datasource.enableOData : false,
                            dynamicUserAuthClass: '',
                            datasourceProperties: [] as Property[],
                            datasourceConfigurations: [] as Configuration[]
                        }
                        let params = datasource.property;
                        params.forEach((element) => {
                            if (element.name === 'dynamicUserAuthMapping') {
                                let configs = element.configuration;
                                configs.forEach((config) => {
                                    let entries = config.entry;
                                    entries.forEach((entry) => {
                                        datasourceObject.datasourceConfigurations.push({ carbonUsername: entry.request, username: entry.username.textNode, password: entry.password.textNode });
                                    });
                                });
                            } else {
                                if (element.name === 'dynamicUserAuthClass') {
                                    datasourceObject.dynamicUserAuthClass = element.textNode;
                                } else {
                                    if (element.name === 'password' && Object.keys(element.namespaces).length !== 0) {
                                        datasourceObject.datasourceProperties.push({ key: "useSecretAlias", value: true });
                                        datasourceObject.datasourceProperties.push({ key: "secretAlias", value: element.textNode });
                                    } else {
                                        datasourceObject.datasourceProperties.push({ key: element.name, value: element.textNode });
                                    }
                                }
                            }
                        });
                        if (!datasourceObject.datasourceProperties.some(element => element.key === "secretAlias")) {
                            datasourceObject.datasourceProperties.push({ key: "useSecretAlias", value: false });
                        }
                        response.datasources.push(datasourceObject);
                    });
                }

                if (dataServiceParams.authorizationProvider != undefined) {
                    const params = dataServiceParams.authorizationProvider.property;
                    params.forEach(element => {
                        response.authProperties.push({ key: element.name, value: element.value });
                    });
                }
                resolve(response);
            }
        });
    }

    async applyEdit(params: ApplyEditRequest): Promise<ApplyEditResponse> {
        return new Promise(async (resolve) => {
            const edit = new WorkspaceEdit();
            const uri = params.documentUri;
            let text = params.text;
            let document = workspace.textDocuments.find(doc => doc.uri.fsPath === uri);

            if (!document) {
                document = await workspace.openTextDocument(Uri.file(uri));
            }

            const range = new Range(new Position(params.range.start.line, params.range.start.character),
                new Position(params.range.end.line, params.range.end.character));

            edit.replace(Uri.file(uri), range, text);
            await workspace.applyEdit(edit);

            if (!params.disableFormatting) {
                const formatRange = this.getFormatRange(range, text);
                await this.rangeFormat({ uri: uri, range: formatRange });
            }
            if (!params.disableUndoRedo) {
                const content = document.getText();
                undoRedo.addModification(content);
            }

            resolve({ status: true });
        });
    }

    getFormatRange(range: Range, text: string): Range {
        const editSplit = text.split('\n');
        const addedLine = editSplit.length;
        const lastLineLength = editSplit[editSplit.length - 1].length;
        const formatStart = new Position(range.start.line, 0);
        const formatend = new Position(range.start.line + addedLine - 1, lastLineLength);
        const formatRange = new Range(formatStart, formatend);
        return formatRange;
    }

    async rangeFormat(req: RangeFormatRequest): Promise<ApplyEditResponse> {
        return new Promise(async (resolve) => {
            // if vscode format on save is enable do not do range format 
            const editorConfig = workspace.getConfiguration('editor');
            if (editorConfig.get('formatOnSave')) {
                resolve({ status: true });
                return;
            }
            let formattingOptions = {
                tabSize: editorConfig.get("tabSize") ?? 4,
                insertSpaces: editorConfig.get("insertSpaces") ?? false,
                trimTrailingWhitespace: editorConfig.get("trimTrailingWhitespace") ?? false
            };
            const uri = Uri.file(req.uri);
            let edits: TextEdit[];
            if (req.range) {
                edits = await commands.executeCommand("vscode.executeFormatRangeProvider", uri, req.range, formattingOptions);
            } else {
                edits = await commands.executeCommand("vscode.executeFormatDocumentProvider", uri, formattingOptions);
            }
            const workspaceEdit = new WorkspaceEdit();
            workspaceEdit.set(uri, edits);
            await workspace.applyEdit(workspaceEdit);
            resolve({ status: true });
        });
    }

    async createMessageProcessor(params: CreateMessageProcessorRequest): Promise<CreateMessageProcessorResponse> {
        return new Promise(async (resolve) => {
            let { directory, messageProcessorName, messageProcessorType, messageStoreType, failMessageStoreType,
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

            if (directory.includes('messageProcessors')) {
                directory = directory.replace('messageProcessors', 'message-processors');
            }
            const filePath = await this.getFilePath(directory, messageProcessorName);

            await replaceFullContentToFile(filePath, sanitizedXmlData);
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
            const { directory, name, open, groupID, artifactID, version, miVersion } = params;
            const folderStructure: FileStructure = {
                [name]: { // Project folder
                    'pom.xml': rootPomXmlContent(name, groupID ?? "com.example", artifactID ?? name, projectUuid, version ?? DEFAULT_PROJECT_VERSION, miVersion),
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
                                    'data-services': '',
                                    'data-sources': '',
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
                        },
                        'test': {
                            'wso2mi': {
                            },
                        }
                    },
                    'deployment': {
                        'docker': {
                            'Dockerfile': dockerfileContent(),
                            'resources': ''
                        },
                        'libs': '',
                    },
                },
            };

            createFolderStructure(directory, folderStructure);
            copyDockerResources(extension.context.asAbsolutePath(path.join('resources', 'docker-resources')), path.join(directory, name));
            copyMavenWrapper(extension.context.asAbsolutePath(path.join('resources', 'maven-wrapper')), path.join(directory, name));
            await createGitignoreFile(path.join(directory, name));

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
            resolve(importCapp(params));
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

                for (const esbConfig of (resp.directoryMap as any).esbConfigs) {
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
            resolve({ path: getDefaultProjectPath() });
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
        const fetchConnectors = async (name) => {
            const data = await this.getStoreConnectorJSON();
            const connector = data?.outboundConnectors?.find(connector => connector.name === name);
            if (connector) {
                return connector.download_url;
            } else {
                console.error("Connector not found");
                return null;
            }
        };

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
                        case 'unit':
                            fileType = 'unit-test';
                            break;
                        default:
                            fileType = '';
                    }
                    console.log("File type - ", fileType)
                }

                const connectorMatch = content[i].match(/<(\w+\.\w+)\b/);
                if (connectorMatch) {
                    const tagParts = connectorMatch[1].split('.');
                    const connectorName = tagParts[0];
                    console.log('Connector name:', connectorName);
                    const download_url = await fetchConnectors(connectorName);
                    this.downloadConnector({ url: download_url });
                }

                //write the content to a file, if file exists, overwrite else create new file
                var fullPath = '';
                if (fileType === 'apis') {
                    const version = content[i].match(/<api [^>]*version="([^"]+)"/);
                    if (version) {
                        fullPath = path.join(directoryPath ?? '', 'src', 'main', 'wso2mi', 'artifacts', fileType, path.sep, `${name}_v${version[1]}.xml`);
                    } else {
                        fullPath = path.join(directoryPath ?? '', 'src', 'main', 'wso2mi', 'artifacts', fileType, path.sep, `${name}.xml`);
                    }
                } else if (fileType === 'unit-test') {
                    fullPath = path.join(directoryPath ?? '', 'src', 'main', 'test', path.sep, `${name}.xml`);
                } else {
                    fullPath = path.join(directoryPath ?? '', 'src', 'main', 'wso2mi', 'artifacts', fileType, path.sep, `${name}.xml`);
                }
                try {
                    content[i] = content[i].trimStart();
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
            const document = await workspace.openTextDocument(Uri.file(documentUri));
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
            // Check if the folder exists before reading its contents
            if (fs.existsSync(folderPath)) {
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

    async downloadInboundConnector(params: DownloadInboundConnectorRequest): Promise<DownloadInboundConnectorResponse> {
        const { url, isInBuilt } = params;
        try {
            const workspaceFolders = workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error('No workspace is currently open');
            }
            const rootPath = workspaceFolders[0].uri.fsPath;

            const metadataDirectory = path.join(rootPath, 'src', 'main', 'wso2mi', 'resources', 'metadata');
            const libDirectory = path.join(rootPath, 'deployment', 'libs');

            if (!fs.existsSync(metadataDirectory)) {
                fs.mkdirSync(metadataDirectory, { recursive: true });
            }

            // Extract the zip name from the URL
            const zipName = path.basename(url);
            const zipPath = path.join(metadataDirectory, zipName);

            if (!fs.existsSync(zipPath)) {
                const response = await axios.get(url, {
                    responseType: 'stream',
                    headers: {
                        'User-Agent': 'My Client'
                    },
                    onDownloadProgress: (progressEvent) => {
                        const totalLength = progressEvent.total || 0;
                        if (totalLength !== 0) {
                            const progress = Math.round((progressEvent.loaded * 100) / totalLength);

                            const formatSize = (sizeInBytes: number) => {
                                const sizeInKB = sizeInBytes / 1024;
                                if (sizeInKB < 1024) {
                                    return `${Math.floor(sizeInKB)} KB`;
                                } else {
                                    return `${Math.floor(sizeInKB / 1024)} MB`;
                                }
                            };

                            // Notify the visualizer
                            RPCLayer._messenger.sendNotification(
                                onDownloadProgress,
                                { type: 'webview', webviewType: VisualizerWebview.viewType },
                                {
                                    percentage: progress,
                                    downloadedAmount: formatSize(progressEvent.loaded),
                                    downloadSize: formatSize(totalLength)
                                }
                            );
                        }
                    }
                });

                // Create a temporary file
                const tmpobj = tmp.fileSync();
                const writer = fs.createWriteStream(tmpobj.name);

                response.data.pipe(writer);

                return new Promise((resolve, reject) => {
                    writer.on('finish', async () => {
                        writer.close();
                        // Copy the file from the temp location to the metadata folder
                        await copy(tmpobj.name, zipPath);
                        tmpobj.removeCallback();

                        // Extract the ZIP file
                        const zip = new AdmZip(zipPath);
                        const extractPath = path.join(metadataDirectory, '_extracted');

                        if (fs.existsSync(extractPath)) {
                            fs.rmSync(extractPath, { recursive: true });
                        }

                        zip.extractAllTo(extractPath, true);

                        const zipNameWithoutExtension = path.basename(zipName, '.zip');

                        if (!isInBuilt) {
                            // Copy the jar file to libs
                            const jarFileName = `${zipNameWithoutExtension}.jar`;
                            const jarPath = path.join(extractPath, zipNameWithoutExtension, jarFileName);
                            const destinationPath = path.join(libDirectory, jarFileName);
                            if (fs.existsSync(jarPath)) {
                                await copy(jarPath, destinationPath);
                            } else {
                                console.log(`Jar file does not exist at path: ${jarPath}`);
                            }
                        }

                        // Retrieve uiSchema
                        const uischemaPath = path.join(extractPath, zipNameWithoutExtension, 'resources', 'uischema.json');
                        fs.readFile(uischemaPath, 'utf8', async (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                try {
                                    const uischema = JSON.parse(data);

                                    // Delete zip and extracted folder
                                    await remove(extractPath);
                                    await remove(zipPath);
                                    resolve({ uischema });
                                } catch (parseError) {
                                    reject(parseError); // Handle JSON parsing error
                                }
                            }
                        });
                    });
                    writer.on('error', reject);
                });
            }

            return new Promise((resolve, reject) => {
                resolve({ uischema: '' });
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

    undo(params: UndoRedoParams): Promise<boolean> {
        return new Promise((resolve) => {
            const lastsource = undoRedo.undo();
            if (lastsource) {
                fs.writeFileSync(params.path, lastsource);
                return resolve(true);
            }
            return resolve(false);
        });
    }

    redo(params: UndoRedoParams): Promise<boolean> {
        return new Promise((resolve) => {
            const lastsource = undoRedo.redo();
            if (lastsource) {
                fs.writeFileSync(params.path, lastsource);
                return resolve(true);
            }
            return resolve(false);
        });
    }

    async initUndoRedoManager(params: UndoRedoParams): Promise<void> {
        let document = workspace.textDocuments.find(doc => doc.uri.fsPath === params.path);

        if (!document) {
            document = await workspace.openTextDocument(Uri.file(params.path));
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
            const document = workspace.textDocuments.find(doc => doc.uri.fsPath === params.documentUri);
            const range = params.range;
            if (document) {
                const text = document.getText(new Range(
                    range.start.line, range.start.character, range.end.line, range.end.character));
                resolve({ text: text });
            } else {
                resolve({ text: '' });
            }
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
                defaultUri: params.defaultUri ? Uri.file(params.defaultUri) : Uri.file(os.homedir()),
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
                        transformedPath = transformedPath.split(path.sep).join("/");
                        createMetadataFilesForRegistryCollection(destPath, transformedPath);
                        addNewEntryToArtifactXML(params.projectDirectory, params.artifactName, fileName, transformedPath, "", true);
                    } else {
                        fs.copyFileSync(params.filePath, destPath);
                        transformedPath = path.join(transformedPath, params.registryPath);
                        transformedPath = transformedPath.split(path.sep).join("/");
                        const mediaType = await detectMediaType(params.filePath);
                        addNewEntryToArtifactXML(params.projectDirectory, params.artifactName, fileName, transformedPath, mediaType, false);
                    }
                    commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                    resolve({ path: destPath });
                }
            } else if (params.createOption === 'entryOnly') {
                let fileName = params.resourceName;
                const fileData = getMediatypeAndFileExtension(params.templateType);
                fileName = fileName + "." + fileData.fileExtension;
                const registryPath = path.join(registryDir, params.registryPath);
                const destPath = path.join(registryPath, fileName);
                if (!fs.existsSync(registryPath)) {
                    fs.mkdirSync(registryPath, { recursive: true });
                }
                //add the new entry to artifact.xml
                transformedPath = path.join(transformedPath, params.registryPath);
                transformedPath = transformedPath.split(path.sep).join("/");
                addNewEntryToArtifactXML(params.projectDirectory, params.artifactName, fileName, transformedPath, fileData.mediaType, false);
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                resolve({ path: destPath });

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
                await replaceFullContentToFile(destPath, fileContent ? fileContent : "");
                //add the new entry to artifact.xml
                transformedPath = path.join(transformedPath, params.registryPath);
                transformedPath = transformedPath.split(path.sep).join("/");
                addNewEntryToArtifactXML(params.projectDirectory, params.artifactName, fileName, transformedPath, fileData.mediaType, false);
                commands.executeCommand(COMMANDS.REFRESH_COMMAND);
                resolve({ path: destPath });
            }
        });
    }

    async getMetadataOfRegistryResource(params: GetRegistryMetadataRequest): Promise<GetRegistryMetadataResponse> {
        return new Promise(async (resolve) => {
            resolve({ metadata: getRegistryResourceMetadata(params.projectDirectory) });
        });
    }

    async updateRegistryMetadata(params: UpdateRegistryMetadataRequest): Promise<UpdateRegistryMetadataResponse> {
        return new Promise(async (resolve) => {
            let message = updateRegistryResourceMetadata(params);
            window.showInformationMessage(message);
            resolve({ message: message });
        });
    }

    async createClassMediator(params: CreateClassMediatorRequest): Promise<CreateClassMediatorResponse> {
        return new Promise(async (resolve) => {
            const content = getClassMediatorContent({ name: params.className, package: params.packageName });
            const packagePath = params.packageName.replace(/\./g, path.sep);
            const fullPath = path.join(params.projectDirectory, packagePath);
            fs.mkdirSync(fullPath, { recursive: true });
            const filePath = path.join(fullPath, `${params.className}.java`);
            await replaceFullContentToFile(filePath, content);
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
        if (currentFile && !fs.lstatSync(currentFile).isDirectory()) {
            currentFileContent = fs.readFileSync(currentFile, 'utf8');
        }
        var rootPath = workspaceFolders[0].uri.fsPath;
        rootPath += '/src/main/wso2mi/artifacts';
        const fileContents: string[] = [];
        fileContents.push(currentFileContent);
        var resourceFolders = ['apis', 'endpoints', 'inbound-endpoints', 'local-entries', 'message-processors', 'message-stores', 'proxy-services', 'sequences', 'tasks', 'templates'];
        for (const folder of resourceFolders) {
            const folderPath = path.join(rootPath, folder);
            // Check if the folder exists before reading its contents
            if (fs.existsSync(folderPath)) {
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
        }

        return { context: fileContents };
    }

    async getBackendRootUrl(): Promise<GetBackendRootUrlResponse> {

        const config = vscode.workspace.getConfiguration('MI');
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
            let artifactsWithAdditionalData: RegistryArtifact[] = [];
            if (params.withAdditionalData) {
                artifactsWithAdditionalData = getAvailableRegistryResources(params.path).artifacts;
            }
            resolve({ artifacts: tempArtifactNames, artifactsWithAdditionalData });
        });
    }

    async migrateProject({ source }: MigrateProjectRequest): Promise<MigrateProjectResponse> {
        return new Promise(async (resolve) => {
            if (source) {
                importProject({ source, directory: source, open: true });
                resolve({ filePath: source });
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

    async getStoreConnectorJSON(): Promise<StoreConnectorJsonResponse> {
        return new Promise(async (resolve) => {
            try {
                if (connectorCache.has('inbound-connector-data') && connectorCache.has('outbound-connector-data')) {
                    resolve({ inboundConnectors: connectorCache.get('inbound-connector-data'), outboundConnectors: connectorCache.get('outbound-connector-data') });
                    return;
                }
                const response = await fetch(APIS.CONNECTOR);
                const data = await response.json();
                if (data && data['inbound-connector-data'] && data['outbound-connector-data']) {
                    connectorCache.set('inbound-connector-data', data['inbound-connector-data']);
                    connectorCache.set('outbound-connector-data', data['outbound-connector-data']);
                    resolve({ inboundConnectors: data['inbound-connector-data'], outboundConnectors: data['outbound-connector-data'] });
                } else {
                    console.log("Failed to fetch connectors. Status: " + data.status + ", Reason: " + data.reason);
                    reject("Failed to fetch connectors.");
                }
            } catch (error) {
                console.log("User is offline.", error);
                reject("Failed to fetch connectors.");
            }
        });

    }

    async saveInboundEPUischema(params: SaveInboundEPUischemaRequest): Promise<boolean> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.saveInboundEPUischema({
                connectorName: params.connectorName,
                uiSchema: params.uiSchema
            });

            resolve(res);
        });
    }

    async getInboundEPUischema(params: GetInboundEPUischemaRequest): Promise<GetInboundEPUischemaResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.getInboundEPUischema({
                connectorName: params.connectorName,
                documentPath: params.documentPath
            });
            resolve(res);
        });
    }

    async createDataSource(params: DataSourceTemplate): Promise<CreateDataSourceResponse> {
        return new Promise(async (resolve) => {
            const xmlData = await getDataSourceXml(params);
            const sanitizedXmlData = xmlData.replace(/^\s*[\r\n]/gm, '');

            let directory = params.projectDirectory;
            if (directory.includes('dataSources')) {
                directory = directory.replace('dataSources', 'data-sources');
            }
            const filePath = await this.getFilePath(directory, params.name);

            await replaceFullContentToFile(filePath, sanitizedXmlData);
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
                    projectDirectory: filePath,
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
                        if (jsonData.datasource.jndiConfig.environment) {
                            const params: { [key: string]: string | number | boolean } = {};
                            const jndiPropertiesData = jsonData.datasource.jndiConfig.environment.property;
                            const jndiProperties = Array.isArray(jndiPropertiesData) ? jndiPropertiesData : [jndiPropertiesData];
                            jndiProperties.forEach((item) => {
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
                            const dsPropertiesData = jsonData.datasource.definition.configuration.dataSourceProps.property;
                            const dsProperties = Array.isArray(dsPropertiesData) ? dsPropertiesData : [dsPropertiesData];
                            dsProperties.forEach((item) => {
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

    async askDriverPath(): Promise<ProjectDirResponse> {
        return new Promise(async (resolve) => {
            const selectedDriverPath = await askDriverPath();
            if (!selectedDriverPath || selectedDriverPath.length === 0) {
                window.showErrorMessage('A file must be selected as the driver');
                resolve({ path: "" });
            } else {
                const parentDir = selectedDriverPath[0].fsPath;
                resolve({ path: parentDir });
            }
        });
    }

    async addDriverToLib(params: AddDriverToLibRequest): Promise<AddDriverToLibResponse> {
        const { url } = params;
        // Copy the file from url to the lib directory
        try {
            const workspaceFolders = workspace.workspaceFolders;
            if (!workspaceFolders) {
                throw new Error('No workspace is currently open');
            }
            const rootPath = workspaceFolders[0].uri.fsPath;

            const libDirectory = path.join(rootPath, 'deployment', 'libs');

            // Ensure the lib directory exists
            if (!fs.existsSync(libDirectory)) {
                fs.mkdirSync(libDirectory, { recursive: true });
            }

            // Get the file name from the URL
            const fileName = path.basename(url);
            const destinationPath = path.join(libDirectory, fileName);

            // Copy the file
            await fs.promises.copyFile(url, destinationPath);

            return { path: destinationPath };

        } catch (error) {
            console.error('Error adding driver', error);
            throw new Error('Failed to add driver');
        }
    }

    async deleteDriverFromLib(params: AddDriverToLibRequest): Promise<void> {
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('Currently no workspace is opened');
        }
        const rootPath = workspaceFolders[0].uri.fsPath;
        const libDirectory = path.join(rootPath, 'deployment', 'libs');
        const fileName = path.basename(params.url);
        const filePath = path.join(libDirectory, fileName);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (error) {
                console.error(`Error deleting the file at ${filePath}:`, error);
            }
        } else {
            console.error(`File not found at ${filePath}`);
        }
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

            const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
${keyValuesXML}`;

            const filePath = params?.filePath?.length ? params.filePath : path.join(localEntryPath, `${connectionName}.xml`);
            if (!fs.existsSync(localEntryPath)) {
                fs.mkdirSync(localEntryPath);
            }

            await replaceFullContentToFile(filePath, xmlData);
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
            resolve({ registryPaths: res.map(element => element.split(path.sep).join("/")) });
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
            const registryIdentifier = "wso2mi/resources/registry";
            const isRegistry = path.normalize(params.path).includes(path.normalize(registryIdentifier));
            if (isRegistry) {
                deleteRegistryResource(params.path);
            } else {
                await workspace.fs.delete(Uri.file(params.path));
            }
            await vscode.commands.executeCommand(COMMANDS.REFRESH_COMMAND); // Refresh the project explore view
            navigate();
            if (params.enableUndo && !isRegistry) {
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

    async updateArtifactInRegistry(filePath: string, newFileName: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            const fileName = path.basename(filePath);
            const options = {
                ignoreAttributes: false,
                attributeNamePrefix: "@",
                parseTagValue: true,
                format: true,
            };
            const parser = new XMLParser(options);
            const projectDir = workspace.getWorkspaceFolder(Uri.file(filePath))?.uri.fsPath;
            const artifactXMLPath = path.join(projectDir ?? "", 'src', 'main', 'wso2mi', 'resources', 'registry', 'artifact.xml');
            if (!fs.existsSync(artifactXMLPath)) {
                resolve(false);
            }
            const artifactXML = fs.readFileSync(artifactXMLPath, "utf8");
            const artifactXMLData = parser.parse(artifactXML);
            if (Array.isArray(artifactXMLData.artifacts.artifact)) {
                var artifacts = artifactXMLData.artifacts.artifact;
                artifacts.forEach((artifact: any) => {
                    if (artifact.item.file === fileName) {
                        artifact.item.file = `${newFileName}.xml`;
                    }
                });
            } else {
                if (artifactXMLData.artifacts.artifact.item.file === fileName) {
                    artifactXMLData.artifacts.artifact.item.file = `${newFileName}.xml`;
                }
            }
            const builder = new XMLBuilder(options);
            const updatedXmlString = builder.build(artifactXMLData);
            fs.writeFileSync(artifactXMLPath, updatedXmlString);
            resolve(true);
        });

    }

    async refreshAccessToken(): Promise<void> {
        const CommonReqHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf8',
            'Accept': 'application/json'
        };
        const refresh_token = await extension.context.secrets.get('MIAIRefreshToken');
        const config = vscode.workspace.getConfiguration('MI');
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
            const selection = await window.showQuickPick(["Build CAPP", "Create Docker Image"]);
            if (selection === "Build CAPP") {
                await commands.executeCommand(COMMANDS.BUILD_PROJECT, false);
            } else if (selection === "Create Docker Image") {
                await commands.executeCommand(COMMANDS.CREATE_DOCKER_IMAGE);
            }
            resolve();
        });
    }

    async exportProject(params: ExportProjectRequest): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const exportTask = async () => {
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
                const lastExportedPath: string | undefined = extension.context.globalState.get(LAST_EXPORTED_CAR_PATH);
                const quickPicks: vscode.QuickPickItem[] = [
                    {
                        label: "Select Destination",
                        description: "Select a destination folder to export .car file",
                    },
                ];
                if (lastExportedPath) {
                    quickPicks.push({
                        label: "Last Exported Path: " + lastExportedPath,
                        description: "Use the last exported path to export .car file",
                    });
                }
                const selection = await vscode.window.showQuickPick(
                    quickPicks,
                    {
                        placeHolder: "Export Options",
                    }
                );

                if (selection) {
                    let destination: string | undefined;
                    if (selection.label == "Select Destination") {
                        // Get the destination folder
                        const selectedLocation = await this.browseFile({
                            canSelectFiles: false,
                            canSelectFolders: true,
                            canSelectMany: false,
                            defaultUri: lastExportedPath ?? params.projectPath,
                            title: "Select a folder to export the project",
                            openLabel: "Select Folder"
                        });
                        destination = selectedLocation.filePath;
                        await extension.context.globalState.update(LAST_EXPORTED_CAR_PATH, destination);
                    } else {
                        destination = lastExportedPath;
                    }
                    if (destination) {
                        const destinationPath = path.join(destination, path.basename(carFile[0].fsPath));
                        fs.copyFileSync(carFile[0].fsPath, destinationPath);
                        window.showInformationMessage("Project exported successfully!");
                        log(`Project exported to: ${destination}`);
                        resolve();
                    }
                }
            }
            await commands.executeCommand(COMMANDS.BUILD_PROJECT, false, exportTask);
        });
    }

    async checkOldProject(): Promise<boolean> {
        return new Promise(async (resolve) => {
            const oldProjectState = StateMachine.context().isOldProject;
            if (oldProjectState !== undefined) {
                resolve(oldProjectState);
            }
        });
    }

    async editOpenAPISpec(params: SwaggerTypeRequest): Promise<void> {
        return new Promise(async () => {
            const { apiName, apiPath } = params;
            const workspacePath = workspace.workspaceFolders![0].uri.fsPath;
            const openAPISpecPath = path.join(
                workspacePath,
                SWAGGER_REL_DIR,
                `${apiName}.yaml`
            );

            // Create directory if not exists
            if (!fs.existsSync(path.dirname(openAPISpecPath))) {
                fs.mkdirSync(path.dirname(openAPISpecPath), { recursive: true });
            };

            const langClient = StateMachine.context().langClient!;
            const { swagger } = await langClient.swaggerFromAPI({ apiPath });
            if (!fs.existsSync(openAPISpecPath)) {
                // Create the file if not exists
                await replaceFullContentToFile(openAPISpecPath, swagger);
            };

            // Open the file in the editor
            const openedEditor = window.visibleTextEditors.find(
                editor => editor.document.uri.fsPath === openAPISpecPath
            );
            if (openedEditor) {
                window.showTextDocument(openedEditor.document, {
                    viewColumn: openedEditor.viewColumn
                });
            } else {
                commands.executeCommand('vscode.open', Uri.file(openAPISpecPath), {
                    viewColumn: ViewColumn.Active
                });
            }

            const response = await langClient.swaggerFromAPI({ apiPath: params.apiPath });
            const generatedSwagger = response.swagger;
            const port = await getPortPromise({ port: 1000, stopPort: 3000 });
            const cors_proxy = require('cors-anywhere');
            cors_proxy.createServer({
                originWhitelist: [], // Allow all origins
                requireHeader: ['origin', 'x-requested-with']
            }).listen(port, 'localhost');

            const swaggerData: SwaggerData = {
                generatedSwagger: generatedSwagger,
                port: port
            };

            await openSwaggerWebview(swaggerData);
        });
    }

    async compareSwaggerAndAPI(params: SwaggerTypeRequest): Promise<CompareSwaggerAndAPIResponse> {
        return new Promise(async (resolve) => {
            const { apiPath, apiName } = params;
            const workspacePath = workspace.workspaceFolders![0].uri.fsPath;
            const swaggerPath = path.join(
                workspacePath,
                SWAGGER_REL_DIR,
                `${apiName}.yaml`
            );

            if (!fs.existsSync(swaggerPath)) {
                return resolve({ swaggerExists: false });
            }

            const langClient = StateMachine.context().langClient!;
            const { swagger: generatedSwagger } = await langClient.swaggerFromAPI({ apiPath });
            const swaggerContent = fs.readFileSync(swaggerPath, 'utf-8');
            const isEqualSwagger = isEqualSwaggers({
                existingSwagger: parse(swaggerContent),
                generatedSwagger: parse(generatedSwagger!)
            });
            return resolve({
                swaggerExists: true,
                isEqual: isEqualSwagger,
                generatedSwagger,
                existingSwagger: swaggerContent
            });
        });
    }

    async updateSwaggerFromAPI(params: SwaggerTypeRequest): Promise<void> {
        return new Promise(async () => {
            const { apiName, apiPath } = params;
            const workspacePath = workspace.workspaceFolders![0].uri.fsPath;
            const swaggerPath = path.join(
                workspacePath,
                SWAGGER_REL_DIR,
                `${apiName}.yaml`
            );

            let generatedSwagger = params.generatedSwagger;
            let existingSwagger = params.existingSwagger;
            if (!generatedSwagger || !existingSwagger) {
                const langClient = StateMachine.context().langClient!;
                const response = await langClient.swaggerFromAPI({ apiPath });
                generatedSwagger = response.swagger;
                existingSwagger = fs.readFileSync(swaggerPath, 'utf-8');
            }

            const mergedContent = mergeSwaggers({
                existingSwagger: parse(existingSwagger),
                generatedSwagger: parse(generatedSwagger!)
            });
            const yamlContent = stringify(mergedContent);
            await replaceFullContentToFile(swaggerPath, yamlContent);
        });
    }

    async updateAPIFromSwagger(params: UpdateAPIFromSwaggerRequest): Promise<void> {
        return new Promise(async () => {
            const { apiName, apiPath, resources, insertPosition } = params;
            const workspacePath = workspace.workspaceFolders![0].uri.fsPath;
            const swaggerPath = path.join(
                workspacePath,
                SWAGGER_REL_DIR,
                `${apiName}.yaml`
            );

            let generatedSwagger = params.generatedSwagger;
            let existingSwagger = params.existingSwagger;
            if (!generatedSwagger || !existingSwagger) {
                const langClient = StateMachine.context().langClient!;
                const response = await langClient.swaggerFromAPI({ apiPath });
                generatedSwagger = response.swagger;
                existingSwagger = fs.readFileSync(swaggerPath, 'utf-8');
            }

            // Add new resources
            const { added, removed, updated } = getResourceInfo({
                existingSwagger: parse(existingSwagger),
                generatedSwagger: parse(generatedSwagger!),
            });
            const resourceXml = added.reduce((acc, resource) => {
                return acc + "\n" + getAPIResourceXmlWrapper({
                    methods: resource.methods,
                    uriTemplate: resource.path
                });
            }, "").trim();
            await this.applyEdit({
                text: resourceXml,
                documentUri: apiPath,
                range: {
                    start: {
                        line: insertPosition.line,
                        character: insertPosition.character,
                    },
                    end: {
                        line: insertPosition.line,
                        character: insertPosition.character,
                    }
                }
            });

            // Delete resources
            const deleteResources = removed.map(resource => resources.find(
                r => r.path === resource.path && isEqual(r.methods, resource.methods)
            ));
            for (const resource of deleteResources) {
                await this.applyEdit({
                    text: "",
                    documentUri: apiPath,
                    range: {
                        start: {
                            line: resource.position.startLine,
                            character: resource.position.startColumn
                        },
                        end: {
                            line: resource.position.endLine,
                            character: resource.position.endColumn
                        }
                    }
                });
            }
        });
    }

    async updateTestSuite(params: UpdateTestSuiteRequest): Promise<UpdateTestSuiteResponse> {
        return new Promise(async (resolve) => {
            const { content, name, artifact } = params;
            let filePath = params.path;
            const fileName = filePath ? path.parse(filePath).name : "";

            if (!content) {
                throw new Error('Content is required');
            }

            if (!filePath) {
                if (!artifact) {
                    throw new Error('Artifact is required');
                }
                if (!name) {
                    throw new Error('Name is required');
                }
                const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(artifact)) || workspace.workspaceFolders?.[0];
                const projectRoot = workspaceFolder?.uri.fsPath;
                const testDir = path.join(projectRoot!, 'src', 'test', "wso2mi");
                filePath = path.join(testDir, `${name}.xml`);

                if (fs.existsSync(filePath)) {
                    throw new Error('Test suite already exists');
                }

                if (!fs.existsSync(testDir)) {
                    fs.mkdirSync(testDir, { recursive: true });
                }
            } else if (name != fileName && params.path) {
                filePath = filePath.replace(`${fileName}.xml`, `${name}.xml`);
                if (fs.existsSync(filePath)) {
                    throw new Error('Test suite already exists');
                }
                fs.renameSync(params.path, filePath);
            }

            await replaceFullContentToFile(filePath, content);
            await this.rangeFormat({ uri: filePath });

            const openFileButton = 'Open File';
            window.showInformationMessage(`Test suite ${!filePath ? "created" : "updated"} successfully`, openFileButton).then(selection => {
                if (selection === openFileButton) {
                    workspace.openTextDocument(filePath!).then(doc => {
                        window.showTextDocument(doc);
                    });
                }
            });

            resolve({ path: filePath });
        });
    }

    async updateTestCase(params: UpdateTestCaseRequest): Promise<UpdateTestCaseResponse> {
        return new Promise(async (resolve) => {
            const filePath = params.path;
            if (!filePath) {
                throw new Error('File path is required');
            }
            if (!fs.existsSync(filePath)) {
                throw new Error('Test case does not exist');
            }

            let range;
            if (!params.range) {
                const langClient = StateMachine.context().langClient!;
                const st = await langClient.getSyntaxTree({
                    documentIdentifier: {
                        uri: filePath
                    },
                });
                const stNode: UnitTest = st?.syntaxTree?.["unit-test"];
                if (!stNode) {
                    throw new Error('Invalid test case file');
                }
                const endTag = stNode.testCases.range.endTagRange.start

                range = new Range(endTag.line, endTag.character, endTag.line, endTag.character);
            } else {
                const startTag = params.range.startTagRange.start;
                const endTag = params.range.endTagRange.end;
                range = new Range(startTag.line, startTag.character, endTag.line, endTag.character);
            }

            const workspaceEdit = new WorkspaceEdit();
            workspaceEdit.replace(Uri.file(filePath), range, params.content);
            await workspace.applyEdit(workspaceEdit);

            await this.rangeFormat({ uri: filePath });

            const openFileButton = 'Open File';
            window.showInformationMessage(`Test case ${!filePath ? "created" : "updated"} successfully`, openFileButton).then(selection => {
                if (selection === openFileButton) {
                    workspace.openTextDocument(filePath!).then(doc => {
                        window.showTextDocument(doc);
                    });
                }
            });

            resolve({});
        });
    }

    async getAllTestSuites(): Promise<GetAllTestSuitsResponse> {
        return new Promise(async (resolve) => {
            const suites: any[] = [];
            if (workspace.workspaceFolders) {
                const workspaceFolder = workspace.workspaceFolders[0];
                const pattern = new vscode.RelativePattern(workspaceFolder, testFileMatchPattern);
                const files = await workspace.findFiles(pattern);
                for (const fileX of files) {
                    const file = fileX.fsPath;
                    const fileName = path.parse(file).name;

                    suites.push({
                        name: fileName,
                        path: file,
                        testCases: []
                    });
                }
            }

            return resolve({ testSuites: suites });
        });
    }

    async updateMockService(params: UpdateMockServiceRequest): Promise<UpdateMockServiceResponse> {
        return new Promise(async (resolve) => {
            const { content, name } = params;
            let filePath = params.path;
            const fileName = filePath ? path.parse(filePath).name : "";

            if (!content) {
                throw new Error('Content is required');
            }

            if (!filePath) {
                if (!name) {
                    throw new Error('Name is required');
                }
                const projeectRoot = workspace.workspaceFolders![0].uri.fsPath;
                const testDir = path.join(projeectRoot!, 'src', 'test', 'resources', 'mock-services');
                filePath = path.join(testDir, `${name}.xml`);

                if (fs.existsSync(filePath)) {
                    throw new Error('Mock service already exists');
                }

                if (!fs.existsSync(testDir)) {
                    fs.mkdirSync(testDir, { recursive: true });
                }
            } else if (name != fileName && params.path) {
                filePath = filePath.replace(`${fileName}.xml`, `${name}.xml`);
                if (fs.existsSync(filePath)) {
                    throw new Error('Mock service already exists');
                }
                fs.renameSync(params.path, filePath);
            }

            await replaceFullContentToFile(filePath, content);

            const openFileButton = 'Open File';
            window.showInformationMessage(`Mock service ${!filePath ? "created" : "updated"} successfully`, openFileButton).then(selection => {
                if (selection === openFileButton) {
                    workspace.openTextDocument(filePath!).then(doc => {
                        window.showTextDocument(doc);
                    });
                }
            });

            resolve({ path: filePath });
        });
    }

    async getAllMockServices(): Promise<GetAllMockServicesResponse> {
        return new Promise(async (resolve) => {
            const services: any[] = [];
            if (workspace.workspaceFolders) {
                const workspaceFolder = workspace.workspaceFolders[0];
                const pattern = new vscode.RelativePattern(workspaceFolder, mockSerivesFilesMatchPattern);
                const files = await workspace.findFiles(pattern);
                for (const fileX of files) {
                    const file = fileX.fsPath;
                    const fileName = path.parse(file).name;

                    services.push({
                        name: fileName,
                        path: file,
                    });
                }
            }

            return resolve({ mockServices: services });
        });
    }

    async updateDependencyInPom(params: UpdateDependencyInPomRequest): Promise<void> {
        const showErrorMessage = () => {
            window.showErrorMessage('Failed to add the dependency to the POM file');
        }

        return new Promise(async (resolve) => {
            const { groupId, artifactId, version, file, range } = params;
            const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(file));

            if (!workspaceFolder) {
                showErrorMessage();
                throw new Error('Cannot find workspace folder');
            }

            const pomPath = path.join(workspaceFolder.uri.fsPath, 'pom.xml');
            const pomContent = fs.readFileSync(pomPath, 'utf-8');
            const options = {
                ignoreAttributes: false,
                attributeNamePrefix: "@_"
            };
            const parser = new XMLParser(options);
            const pom = parser.parse(pomContent);

            if (!pom) {
                showErrorMessage();
                throw new Error('Failed to parse POM XML');
            }

            if (range) {
                const workspaceEdit = new WorkspaceEdit();
                const document = await workspace.openTextDocument(pomPath);
                if (groupId || artifactId || version) {
                    const originalText = document.getText(new Range(range.start.line, range.start.character, range.end.line, range.end.character));
                    let updatedText = originalText;

                    if (groupId) {
                        updatedText = updatedText.replace(/<groupId>.*<\/groupId>/, `<groupId>${groupId}</groupId>`);
                    }
                    if (artifactId) {
                        updatedText = updatedText.replace(/<artifactId>.*<\/artifactId>/, `<artifactId>${artifactId}</artifactId>`);
                    }
                    if (version) {
                        updatedText = updatedText.replace(/<version>.*<\/version>/, `<version>${version}</version>`);
                    }


                    workspaceEdit.replace(Uri.file(pomPath), new Range(range.start.line, range.start.character, range.end.line, range.end.character), updatedText);
                    await workspace.applyEdit(workspaceEdit);
                } else {
                    workspaceEdit.delete(Uri.file(pomPath), new Range(range.start.line, range.start.character, range.end.line, range.end.character));
                    await workspace.applyEdit(workspaceEdit);

                    const lineText = document.lineAt(range.start.line).text;
                    if (lineText.trim() === '') {
                        const deleteEmptyLine = new WorkspaceEdit();
                        deleteEmptyLine.delete(Uri.file(pomPath), new Range(range.start.line, 0, range.start.line + 1, 0));
                        await workspace.applyEdit(deleteEmptyLine);
                    }
                }
                resolve();
                return;
            }

            let dependencies: any = (await this.getAllDependencies({ file: file }))?.dependencies;
            let dependencyExists = dependencies.some(dep =>
                dep.groupId === groupId &&
                dep.artifactId === artifactId &&
                dep.version === version
            );

            if (!dependencyExists) {
                const newDependency = {
                    groupId: groupId,
                    artifactId: artifactId,
                    version: version
                };

                const isUpdate = dependencies.length > 0;
                const tagToFind = !isUpdate ? '</pluginRepositories>' : '</dependencies>';
                const index = pomContent.lastIndexOf(tagToFind);

                if (!isUpdate) {
                    dependencies.push(newDependency);

                    dependencies = {
                        dependencies: dependencies.map(dep => { return { dependency: dep } })
                    }
                } else {
                    dependencies = {
                        dependency: newDependency
                    }
                }

                if (index !== -1) {
                    let insertIndex = index + (isUpdate ? 0 : tagToFind.length);
                    const lineString = pomContent.substring(0, insertIndex).split('\n').pop();
                    const spacesCount = lineString?.match(/^\s*/)?.[0].length ?? 0;
                    const indentation = ' '.repeat(spacesCount * (isUpdate ? 2 : 1));

                    if (isUpdate) {
                        insertIndex -= spacesCount;
                    }

                    const builder = new XMLBuilder({ format: true, oneListGroup: "true" });
                    let text = builder.build(dependencies);
                    const lines = text.split('\n');
                    text = lines.map((line, index) => (index === lines.length - 1) ? line : indentation + line).join('\n');
                    text = isUpdate ? text : `\n${text}`;

                    await replaceFullContentToFile(pomPath, pomContent.slice(0, insertIndex) + text + pomContent.slice(insertIndex + (isUpdate ? 0 : 1)));
                } else {
                    showErrorMessage();
                    throw new Error(`Failed to find ${tagToFind} tag`);
                }
            }

            resolve();
        });
    }

    async getSelectiveArtifacts(params: GetSelectiveArtifactsRequest): Promise<GetSelectiveArtifactsResponse> {
        return new Promise(async (resolve) => {
            const filePath = params.path;
            const artifactsContent: string[] = [];

            if (fs.existsSync(filePath)) {
                const currentFile = fs.readFileSync(filePath, "utf8");
                artifactsContent.push(currentFile);
            }

            return resolve({ artifacts: artifactsContent });
        });
    }

    async getOpenAPISpec(params: SwaggerTypeRequest): Promise<SwaggerFromAPIResponse> {
        const langClient = StateMachine.context().langClient!;
        const response = await langClient.swaggerFromAPI({ apiPath: params.apiPath });
        const generatedSwagger = response.swagger;
        const port = await getPortPromise({ port: 1000, stopPort: 3000 });
        const cors_proxy = require('cors-anywhere');
        cors_proxy.createServer({
            originWhitelist: [], // Allow all origins
            requireHeader: ['origin', 'x-requested-with']
        }).listen(port, 'localhost');

        RPCLayer._messenger.sendNotification(onSwaggerSpecReceived, { type: 'webview', webviewType: 'micro-integrator.runtime-services-panel' }, { generatedSwagger: generatedSwagger, port: port });

        return { generatedSwagger: generatedSwagger }; // TODO: refactor rpc function with void
    }

    async openDependencyPom(params: OpenDependencyPomRequest): Promise<void> {
        return new Promise(async (resolve) => {
            const { name, file } = params;
            const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(file));
            if (!workspaceFolder) {
                window.showErrorMessage('Cannot find workspace folder');
                throw new Error('Cannot find workspace folder');
            }

            const pomPath = path.join(workspaceFolder.uri.fsPath, 'pom.xml');
            const pomContent = fs.readFileSync(pomPath, 'utf-8');

            const dependencies = (await this.getAllDependencies({ file: file }))?.dependencies;
            let dependencyExists = dependencies.some(dep =>
                dep.groupId.toLowerCase().includes(name.toLowerCase())
            );

            const openPomAtPosition = async (position: number) => {
                const editor = await window.showTextDocument(Uri.file(pomPath));
                const newPosition = new Position(position, 0);
                const newSelection = new Selection(newPosition, newPosition);
                editor.selection = newSelection;
                editor.revealRange(newSelection, vscode.TextEditorRevealType.AtTop);
            };

            if (dependencyExists) {
                const dependencyIndex = dependencies.findIndex(dep => dep.groupId.includes(name));
                const dependencyPosition = pomContent.split('\n').findIndex(line => line.includes(dependencies[dependencyIndex].groupId));
                await openPomAtPosition(dependencyPosition);
            } else {
                const dependenciesPosition = pomContent.split('\n').findIndex(line => line.includes('<dependencies>'));
                await openPomAtPosition(dependenciesPosition);
            }

            resolve();
        });
    }

    async getAllDependencies(params: getAllDependenciesRequest): Promise<GetAllDependenciesResponse> {
        const { file } = params;
        const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(file));

        if (!workspaceFolder) {
            window.showErrorMessage('Cannot find workspace folder');
            throw new Error('Cannot find workspace folder');
        }

        const pomPath = path.join(workspaceFolder.uri.fsPath, 'pom.xml');
        const pomContent = fs.readFileSync(pomPath, 'utf-8');
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        };
        const parser = new XMLParser(options);
        const pom = parser.parse(pomContent);

        if (!pom) {
            window.showErrorMessage('Failed to parse POM XML');
            throw new Error('Failed to parse POM XML');
        }

        const dependencyRegex = /<dependency>([\s\S]*?)<\/dependency>/g;
        const groupIdRegex = /<groupId>(.*?)<\/groupId>/;
        const artifactIdRegex = /<artifactId>(.*?)<\/artifactId>/;
        const versionRegex = /<version>(.*?)<\/version>/;

        let dependencies: Dependency[] = [];
        let match;
        while ((match = dependencyRegex.exec(pomContent)) !== null) {
            const dependencyContent = match[1];
            const groupIdMatch = groupIdRegex.exec(dependencyContent);
            const artifactIdMatch = artifactIdRegex.exec(dependencyContent);
            const versionMatch = versionRegex.exec(dependencyContent);

            const groupId = groupIdMatch ? groupIdMatch[1] : "";
            const artifactId = artifactIdMatch ? artifactIdMatch[1] : "";
            const version = versionMatch ? versionMatch[1] : "";

            const startLine = pomContent.substring(0, match.index).split('\n').length;
            const endLine = pomContent.substring(0, match.index + match[0].length).split('\n').length;
            const startColumn = match.index - pomContent.lastIndexOf('\n', match.index - 1) - 1;
            const endColumn = (match.index + match[0].length) - pomContent.lastIndexOf('\n', match.index + match[0].length - 1) - 1;

            dependencies.push({
                groupId,
                artifactId,
                version,
                range: { start: { line: startLine - 1, character: startColumn }, end: { line: endLine - 1, character: endColumn } }
            });
        }

        return { dependencies };
    }
    async testDbConnection(req: TestDbConnectionRequest): Promise<TestDbConnectionResponse> {

        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient;
            const response = await langClient?.testDbConnection(req);
            resolve({ success: response ? response.success : false });
        });
    }

    async markAsDefaultSequence(params: MarkAsDefaultSequenceRequest): Promise<void> {
        return new Promise(async (resolve) => {
            const { path: filePath, remove } = params;
            const langClient = StateMachine.context().langClient;

            if (!langClient) {
                window.showErrorMessage('Language client is not available');
                throw new Error('Language client is not available');
            }

            // Get the syntax tree of the given file path
            const syntaxTree = await langClient.getSyntaxTree({
                documentIdentifier: {
                    uri: filePath
                },
            });

            // Get the sequence name from the syntax tree
            const sequenceName = syntaxTree?.syntaxTree?.sequence?.name;
            if (!sequenceName) {
                window.showErrorMessage('Failed to get the sequence name from the syntax tree');
                throw new Error('Failed to get the sequence name from the syntax tree');
            }

            // Read the POM file
            const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(filePath));
            if (!workspaceFolder) {
                window.showErrorMessage('Cannot find workspace folder');
                throw new Error('Cannot find workspace folder');
            }

            const pomPath = path.join(workspaceFolder.uri.fsPath, 'pom.xml');
            const pomContent = fs.readFileSync(pomPath, 'utf-8');
            const mainSequenceTag = `<mainSequence>${sequenceName}</mainSequence>`;

            // Check if the <properties> tag exists
            const propertiesTagExists = pomContent.includes('<properties>');

            let updatedPomContent;
            if (propertiesTagExists) {
                if (remove) {
                    // Remove the <mainSequence> tag from the POM
                    updatedPomContent = pomContent.replace(/\s*<mainSequence>.*?<\/mainSequence>/, '');
                } else {
                    // Inject the <mainSequence> tag inside the <properties> tag
                    updatedPomContent = pomContent.replace(/<properties>([\s\S]*?)<\/properties>/, (match, p1) => {
                        if (p1.includes('<mainSequence>')) {
                            // Update the existing <mainSequence> tag
                            return match.replace(/<mainSequence>.*?<\/mainSequence>/, mainSequenceTag);
                        } else {
                            // Get the indentation from the <properties> tag
                            const propertiesIndentation = pomContent.match(/(\s*)<properties>/)?.[1] || '';
                            const indentedMainSequenceTag = `\t${mainSequenceTag}`;
                            // Add the <mainSequence> tag
                            return `<properties>${p1}${indentedMainSequenceTag}${propertiesIndentation}</properties>`;
                        }
                    });
                }
            } else {
                window.showErrorMessage('Failed to find the project properties in the POM file');
            }

            // Write the updated POM content back to the file
            fs.writeFileSync(pomPath, updatedPomContent, 'utf-8');

            resolve();
        });
    }

    async getSubFolderNames(params: GetSubFoldersRequest): Promise<GetSubFoldersResponse> {
        return new Promise(async (resolve) => {
            const { path: folderPath } = params;
            const subFolders: string[] = [];

            const subItems = fs.readdirSync(folderPath, { withFileTypes: true });
            for (const item of subItems) {
                if (item.isDirectory()) {
                    subFolders.push(item.name);
                }
            }
            resolve({ folders: subFolders });
        });
    }

    async renameFile(params: FileRenameRequest): Promise<void> {
        try {
            fs.renameSync(params.existingPath, params.newPath);
            const newFileName = path.basename(params.newPath);
            await this.updateArtifactInRegistry(params.existingPath, newFileName.substring(0, newFileName.lastIndexOf('.')));
        } catch (error) {
            console.error(`Error renaming file: ${error}`);
        }
    }

    async getFilePath(directory: string, fileName: string): Promise<string> {
        return new Promise(async (resolve) => {
            let filePath: string;
            if (directory.endsWith('.xml')) {
                if (path.basename(directory).split('.')[0] !== fileName) {
                    fs.unlinkSync(directory);
                    filePath = path.join(path.dirname(directory), `${fileName}.xml`);
                    await this.updateArtifactInRegistry(directory, fileName);
                } else {
                    filePath = directory;
                }
            } else {
                filePath = path.join(directory, `${fileName}.xml`);
            }
            resolve(filePath);
        });
    }

    async openUpdateExtensionPage(): Promise<void> {
        const extensionId = 'wso2.micro-integrator';
        const url = `vscode:extension/${extensionId}`;
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }

    async checkDBDriver(className: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.checkDBDriver(className);
            resolve(res);
        });
    }

    async addDBDriver(params: AddDriverRequest): Promise<boolean> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.addDBDriver(params);
            resolve(res);
        });
    }

    async generateDSSQueries(params: ExtendedDSSQueryGenRequest): Promise<boolean> {
        const { documentUri, position, ...genQueryParams } = params;
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const xml = await langClient.generateQueries(genQueryParams);

            if (!xml) {
                log('Failed to generate DSS Queries.');
                resolve(false);
            }

            const sanitizedXml = xml.replace(/^\s*[\r\n]/gm, '');

            const xmlLineCount = sanitizedXml.split('\n').length;
            const insertRange = { start: position, end: position };
            const formatRange = {
                start: position,
                end: { line: position.line + xmlLineCount - 1, character: 0 }
            };
            await this.applyEdit({ text: sanitizedXml, documentUri, range: insertRange });
            await this.rangeFormat({ uri: documentUri, range: formatRange });

            log('Successfully generated DSS Queries.');
            resolve(true);
        });
    }

    async fetchDSSTables(params: DSSFetchTablesRequest): Promise<DSSFetchTablesResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.fetchTables({
                ...params, tableData: "", datasourceName: ""
            });
            resolve(res);
        });
    }

    async getMediators(param: GetMediatorsRequest): Promise<GetMediatorsResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            let response = await langClient.getMediators(param);
            resolve(response);
        });
    }

    async getMediator(param: GetMediatorRequest): Promise<GetMediatorResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            let response = await langClient.getMediator(param);
            resolve(response);
        });
    }

    async updateMediator(param: UpdateMediatorRequest): Promise<void> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            let response = await langClient.generateSynapseConfig(param);
            if (response && response.textEdits) {
                let edits = response.textEdits;

                for (const edit of edits) {
                    await this.applyEdit({
                        documentUri: param.documentUri,
                        range: edit.range,
                        text: edit.newText,
                        disableUndoRedo: true
                    });
                }
                let document = workspace.textDocuments.find(doc => doc.uri.fsPath === param.documentUri);
                if (!document) {
                    return;
                }
                const content = document.getText();
                undoRedo.addModification(content);
            }
        });
    }

    async getExpressionCompletions(params: ExpressionCompletionsRequest): Promise<ExpressionCompletionsResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const langClient = StateMachine.context().langClient!;
                const res = await langClient.getExpressionCompletions(params);
                if (!res.isIncomplete) {
                    resolve(res);
                } else {
                    reject(new Error('Incomplete completions'));
                }
            } catch (error) {
                console.error(`Error getting expression completions: ${error}`);
                reject(error);
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

export async function askDriverPath() {
    return await window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        defaultUri: Uri.file(os.homedir()),
        title: "Select a driver"
    });
}

export async function askImportProjectPath() {
    return await window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        defaultUri: Uri.file(os.homedir()),
        filters: { 'CAPP': ['car', 'zip'] },
        title: "Select the car file to import"
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
