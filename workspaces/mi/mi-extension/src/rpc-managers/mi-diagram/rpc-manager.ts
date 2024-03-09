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
    CreateInboundEndpointRequest,
    CreateInboundEndpointResponse,
    CreateLocalEntryRequest,
    CreateLocalEntryResponse,
    CreateProjectRequest,
    CreateProjectResponse,
    ImportProjectRequest,
    ImportProjectResponse,
    CreateSequenceRequest,
    CreateSequenceResponse,
    ESBConfigsResponse,
    EVENT_TYPE,
    EndpointDirectoryResponse,
    EndpointsAndSequencesResponse,
    FileStructure,
    GetDefinitionRequest,
    GetDefinitionResponse,
    GetDiagnosticsReqeust,
    GetDiagnosticsResponse,
    GetInboundEpDirRequest,
    GetProjectRootRequest,
    GetTextAtRangeRequest,
    GetTextAtRangeResponse,
    FileDirResponse,
    HighlightCodeRequest,
    InboundEndpointDirectoryResponse,
    LocalEntryDirectoryResponse,
    MiDiagramAPI,
    OpenDiagramRequest,
    ProjectDirResponse,
    ProjectRootResponse,
    SequenceDirectoryResponse,
    ShowErrorMessageRequest,
    UndoRedoParams,
    WriteContentToFileRequest,
    WriteContentToFileResponse,
    getSTRequest,
    getSTResponse,
    MACHINE_VIEW,
    CreateMessageProcessorRequest,
    CreateMessageProcessorResponse,
    RetrieveMessageProcessorRequest,
    RetrieveMessageProcessorResponse,
    CreateProxyServiceRequest,
    CreateProxyServiceResponse,
    CreateMessageStoreRequest,
    CreateMessageStoreResponse,
    BrowseFileResponse,
    BrowseFileRequest,
    CreateRegistryResourceRequest,
    CreateRegistryResourceResponse,
    CreateTaskRequest,
    CreateTaskResponse,
    GetTaskRequest,
    GetTaskResponse,
    GetMessageStoreRequest,
    GetMessageStoreResponse
} from "@wso2-enterprise/mi-core";
import axios from 'axios';
import * as fs from "fs";
import * as os from 'os';
import { Transform } from 'stream';
import { Position, Range, Selection, Uri, WorkspaceEdit, commands, window, workspace } from "vscode";
import { COMMANDS, MI_COPILOT_BACKEND_URL } from "../../constants";
import { StateMachine, openView } from "../../stateMachine";
import { UndoRedoManager } from "../../undoRedoManager";
import { createFolderStructure, getTaskXmlWrapper, getInboundEndpointXmlWrapper, getRegistryResourceContent, getMessageProcessorXmlWrapper, getProxyServiceXmlWrapper , getMessageStoreXmlWrapper } from "../../util";
import { getMediatypeAndFileExtension, addNewEntryToArtifactXML, detectMediaType } from "../../util/fileOperations";
import { getProjectDetails, migrateConfigs } from "../../util/migrationUtils";
import { rootPomXmlContent } from "../../util/templates";
import { VisualizerWebview } from "../../visualizer/webview";
import path = require("path");
import { generateXmlData, writeXmlDataToFile } from "../../util/template-engine/mustach-templates/createLocalEntry";
import { error } from "console";
const { XMLParser } = require("fast-xml-parser");

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
            fs.writeFileSync(filePath, xmlData);
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
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ path: filePath });
        });
    }

    async getLocalEntryDirectory(): Promise<LocalEntryDirectoryResponse> {
        return new Promise(async (resolve) => {
            const workspaceFolder = workspace.workspaceFolders;
            if (workspaceFolder) {
                const workspaceFolderPath = workspaceFolder[0].uri.fsPath;
                const synapseAPIPath = `${workspaceFolderPath}/${workspaceFolder[0].name}Configs/src/main/synapse-config/local-entries`;
                resolve({ data: synapseAPIPath });
            }
            resolve({ data: "" });
        });
    }
    async createLocalEntry(params: CreateLocalEntryRequest): Promise<CreateLocalEntryResponse> {
        return new Promise(async (resolve) => {
            const { directory, name, type, value, URL } = params;

            const xmlData = generateXmlData(name, type, value, URL);
            const filePath = path.join(directory, `${name}.xml`);

            writeXmlDataToFile(filePath, xmlData);
            resolve({ path: filePath });
        });
    }
    
    async createMessageStore(params: CreateMessageStoreRequest): Promise<CreateMessageStoreResponse> {
        return new Promise(async (resolve) => {

            const getTemplateParams = params;

            const xmlData = getMessageStoreXmlWrapper(getTemplateParams);

            const filePath = path.join(params.directory, `${params.name}.xml`);
            fs.writeFileSync(filePath, xmlData);
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
        interface Parameter{
            name: string,
            value: string
        }
        const parser = new XMLParser(options);
        return new Promise(async (resolve) => {
            const filePath = params.path;
            if (fs.existsSync(filePath)) {
                const xmlData = fs.readFileSync(filePath, "utf8");
                const jsonData = parser.parse(xmlData);
                let parameters: Parameter[]=[];
                let customParameters: Parameter[]=[];
                const className= jsonData.messageStore["@_"]["@_class"];
                const response: GetMessageStoreResponse = {
                    name: jsonData.messageStore["@_"]["@_name"],
                    type: '',
                    initialContextFactory: '',
                    connectionFactory: '',
                    providerURL: '',
                    jndiQueueName: '',
                    userName: '',
                    password: '',
                    cacheConnection: '',
                    jmsAPIVersion: '',
                    enableProducerGuaranteedDelivery: '',
                    rabbitMQServerHostName: '',
                    rabbitMQServerPort: '',
                    sslEnabled: '',
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
                    sslVersion: ""
                };
                if(jsonData && jsonData.messageStore && jsonData.messageStore.parameter){
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
                        'store.jdbc.ds': 'dataSourceName',
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
                    }
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
                    if(response.type !== 'Custom Message Store'){
                        parameters.forEach((param : Parameter) => {
                            if (MessageStoreModel.hasOwnProperty(param.name)) {
                                response[MessageStoreModel[param.name]] = param.value;
                            }
                            const key = MessageStoreModel[param.name];
                            if (key) {
                                response[key] = param.value;
                            }
                        });
                        if(response.queueConnectionFactory){
                            response.type = 'WSO2 MB Message Store';
                        }
                    } else {
                        parameters.forEach((param : Parameter) => {
                            customParameters.push({ name: param.name, value: param.value });
                        });
                        response.providerClass = className;
                        response.customParameters = customParameters;
                    }
                }
                resolve(response);
            }
            else{
                return error("File not found");
            }
        });
    }    

    async getInboundEndpointDirectory(): Promise<InboundEndpointDirectoryResponse> {
        try {
            const workspaceFolder = workspace.workspaceFolders;
            if (workspaceFolder) {
                const workspaceFolderPath = workspaceFolder[0].uri.fsPath;
                const endpointDir = path.join(workspaceFolderPath, 'src', 'main', 'wso2mi', 'artifacts', 'inbound-endpoints');

                const response: InboundEndpointDirectoryResponse = { data: endpointDir };

                return response;
            }

            return { data: "" };
        } catch (error) {
            throw new Error("Failed to fetch workspace folders: " + error);
        }
    }

    async createInboundEndpoint(params: CreateInboundEndpointRequest): Promise<CreateInboundEndpointResponse> {
        return new Promise(async (resolve) => {
            const { directory, name, type, sequence, errorSequence } = params;

            const getTemplateParams = {
                name,
                type: type.toLowerCase(),
                sequence,
                errorSequence
            };

            const xmlData = getInboundEndpointXmlWrapper(getTemplateParams);

            const filePath = path.join(directory, `${name}.xml`);
            fs.writeFileSync(filePath, xmlData);
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
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
            commands.executeCommand(COMMANDS.REFRESH_COMMAND);
            resolve({ filePath: filePath });
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

            const filePath = path.join(directory, `${proxyServiceName}.xml`);
            fs.writeFileSync(filePath, xmlData);
            resolve({ path: filePath });
        });
    }

    async createTask(params: CreateTaskRequest): Promise<CreateTaskResponse> {
        return new Promise(async (resolve) => {
            const { directory, ...templateParams } = params;

            const xmlData = getTaskXmlWrapper(templateParams);

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

            if (fs.existsSync(filePath)) {
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
                    triggerCron: ''
                };

                if (jsonData.task.trigger["@_"]["@_count"] !== undefined) {
                    response.triggerCount = Number(jsonData.task.trigger["@_"]["@_count"]);
                    response.triggerInterval = Number(jsonData.task.trigger["@_"]["@_interval"]);
                }
                else if (jsonData.task.trigger["@_"]["@_cron"] !== undefined) {
                    response.triggerType = 'cron';
                    response.triggerCron = jsonData.task.trigger["@_"]["@_cron"];
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
                triggerCron: ''
            });
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

            const content = document.getText();
            undoRedo.addModification(content);

            resolve({ status: true });
        });
    }

    async createMessageProcessor(params: CreateMessageProcessorRequest): Promise<CreateMessageProcessorResponse> {
        return new Promise(async (resolve) => {
            const { directory, messageProcessorName, messageProcessorType, messageStoreType, failMessageStoreType,
                targetMessageStoreType, processorState, dropMessageOption, quartzConfigPath, cron, forwardingInterval,
                retryInterval, maxRedeliveryAttempts, maxConnectionAttempts, connectionAttemptInterval, taskCount,
                statusCodes, clientRepository, axis2Config, endpointType, sequenceType, replySequenceType,
                faultSequenceType, deactivateSequenceType, endpoint, sequence, replySequence,
                faultSequence, deactivateSequence,
                samplingInterval, samplingConcurrency,
                providerClass, properties } = params;

            const getTemplateParams = {
                messageProcessorName, messageProcessorType, messageStoreType, failMessageStoreType, targetMessageStoreType,
                processorState, dropMessageOption, quartzConfigPath, cron, forwardingInterval, retryInterval,
                maxRedeliveryAttempts, maxConnectionAttempts, connectionAttemptInterval, taskCount, statusCodes,
                clientRepository, axis2Config, endpointType, sequenceType, replySequenceType, faultSequenceType,
                deactivateSequenceType, endpoint, sequence,
                replySequence, faultSequence,
                deactivateSequence, samplingInterval, samplingConcurrency, providerClass, properties
            };

            const xmlData = getMessageProcessorXmlWrapper(getTemplateParams);

            let filePath: string;

            if (directory.endsWith('.xml')) {
                filePath = directory;
            } else {
                filePath = path.join(directory, `${messageProcessorName}.xml`);
            }

            if (filePath.includes('/messageProcessors')) {
                filePath = filePath.replace('/messageProcessors', '/message-processors');
            }

            fs.writeFileSync(filePath, xmlData);
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
                    sourceMessageStoreType: 'TestMBStore',
                    targetMessageStoreType: 'TestMBStore',
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
                    } else {
                        response.messageProcessorType = 'Custom Message Processor';
                        response.providerClass = className;
                        response.properties = parameters.map(pair => ({ key: pair.name, value: pair.value }));
                    }

                    if (customProperties.length > 0) {
                        response.hasCustomProperties = true;
                        response.properties = customProperties;
                    }

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
        const uri = Uri.file(params.path);
        workspace.openTextDocument(uri).then((document) => {
            window.showTextDocument(document);
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
            const { directory, name, open, groupID, artifactID } = params;

            const folderStructure: FileStructure = {
                [name]: { // Project folder
                    'pom.xml': rootPomXmlContent(name, groupID ?? "com.example", artifactID ?? name),
                    'src': {
                        'main': {
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
            const { source, directory, open } = params;

            let { projectName, groupId, artifactId } = getProjectDetails(source);

            if (projectName && groupId && artifactId) {
                const folderStructure: FileStructure = {
                    [projectName]: {
                        'pom.xml': rootPomXmlContent(projectName, groupId, artifactId),
                        'src': {
                            'main': {
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
                                        'registry': {
                                            'gov': '',
                                            'conf': '',
                                        },
                                        'metadata': '',
                                        'connectors': '',
                                    },
                                },
                                'test': {
                                    'wso2mi': '',
                                }
                            },
                        },
                    },
                };

                createFolderStructure(directory, folderStructure);
                console.log("Created project structure for project: " + projectName)
                migrateConfigs(source, path.join(directory, projectName));

                window.showInformationMessage(`Successfully imported ${projectName} project`);

                if (open) {
                    commands.executeCommand('vscode.openFolder', Uri.file(path.join(directory, projectName)));
                    resolve({ filePath: path.join(directory, projectName) });
                }

                resolve({ filePath: path.join(directory, projectName) });
            } else {
                window.showErrorMessage('Could not find the project details from the provided project: ', source);
                resolve({ filePath: "" });
            }
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
        const { content, directoryPath } = params;

        const length = content.length;
        for (let i = 0; i < length; i++) {
            //remove starting '''xml and ending '''
            content[i] = content[i].replace(/```xml/g, '');
            content[i] = content[i].replace(/```/g, '');
            //name of file is in the code somewhere in the format name="example", extract the name
            const match = content[i].match(/name="([^"]+)"/);
            if (match) {
                const name = match[1]; // get the name
                //identify type of the file from the first tag of the content
                const tagMatch = content[i].match(/<(\w+)/);
                let fileType = '';
                if (tagMatch) {
                    const tag = tagMatch[1];
                    switch (tag) {
                        case 'api':
                            fileType = 'api';
                            break;
                        case 'endpoint':
                            fileType = 'endpoints';
                            break;
                        case 'sequence':
                            fileType = 'sequences'
                            break;
                        default:
                            fileType = '';
                    }
                    console.log("File type - ", fileType)
                }
                //write the content to a file, if file exists, overwrite else create new file
                const fullPath = path.join(directoryPath, '/temp/tempConfigs/src/main/synapse-config/', fileType, '/', `${name}.xml`);
                try {
                    console.log('Writing content to file:', fullPath);
                    console.log('Content:', content[i]);
                    fs.writeFileSync(fullPath, content[i]);

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
        const editor = window.visibleTextEditors.find(editor => editor.document.uri.fsPath === documentUri);
        if (editor) {
            const range = new Range(params.range.start.line, params.range.start.character, params.range.end.line, params.range.end.character);
            editor.selection = new Selection(range.start, range.end);
            editor.revealRange(range);
        }
    }

    async undo(params: UndoRedoParams): Promise<void> {
        const lastsource = undoRedo.undo();
        if (lastsource) {
            fs.writeFileSync(params.path, lastsource);
        }
    }

    async redo(params: UndoRedoParams): Promise<void> {
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

    async browseFile(params: BrowseFileRequest): Promise<BrowseFileResponse> {
        return new Promise(async (resolve) => {
            const selectedFile = await window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                defaultUri: Uri.file(os.homedir()),
                title: params.dialogTitle
            });
            if (selectedFile) {
                resolve({ filePath: selectedFile[0].fsPath });
            }
        });
    }

    async createRegistryResource(params: CreateRegistryResourceRequest): Promise<CreateRegistryResourceResponse> {
        return new Promise(async (resolve) => {
            var registryDir = path.join(params.projectDirectory, 'src', 'main', 'wso2mi', 'resources', 'registry', params.registryRoot);
            var transformedPath = params.registryRoot === "gov" ? "/_system/governance" : "/_system/config";
            if (params.createOption === "import") {
                if (fs.existsSync(params.filePath)) {
                    const fileName = path.basename(params.filePath);
                    const registryPath = path.join(registryDir, params.registryPath);
                    const destPath = path.join(registryPath, fileName);
                    if (!fs.existsSync(registryPath)) {
                        fs.mkdirSync(registryPath, { recursive: true });
                    }
                    fs.copyFileSync(params.filePath, destPath);
                    transformedPath = path.join(transformedPath, params.registryPath);
                    const mediaType = await detectMediaType(params.filePath);
                    addNewEntryToArtifactXML(params.projectDirectory, params.artifactName, fileName, transformedPath, mediaType);
                    resolve({ path: destPath });
                }
            } else {
                var fileName = params.resourceName;
                const fileData = getMediatypeAndFileExtension(params.templateType);
                fileName = fileName + "." + fileData.fileExtension;
                const fileContent = getRegistryResourceContent(params.templateType, params.resourceName);
                const registryPath = path.join(registryDir, params.registryPath);
                const destPath = path.join(registryPath, fileName);
                if (!fs.existsSync(registryPath)) {
                    fs.mkdirSync(registryPath, { recursive: true });
                }
                fs.writeFileSync(destPath, fileContent ? fileContent : "");
                //add the new entry to artifact.xml
                transformedPath = path.join(transformedPath, params.registryPath);
                addNewEntryToArtifactXML(params.projectDirectory, params.artifactName, fileName, transformedPath, fileData.mediaType);
                resolve({ path: destPath });
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
