/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import { Disposable, EventEmitter, workspace, WorkspaceFolder, Uri, window, commands, extensions } from 'vscode';
import { ext } from "./extensionVariables";

import {
    IProjectManager,
    Organization,
    Project,
    ChoreoLoginStatus,
    WorkspaceConfig,
    Component,
    ChoreoComponentType,
    UserInfo,
    ChoreoWorkspaceMetaData,
    Endpoint,
    ServiceTypes,
    ComponentDisplayType,
    EndpointData,
    ComponentConfig,
    ComponentConfigSchema,
} from "@wso2-enterprise/choreo-core";
import { CMEntryPoint, CMResourceFunction, CMService, ComponentModel } from "@wso2-enterprise/ballerina-languageclient";
import { existsSync, readFileSync } from 'fs';
import { ProjectRegistry } from './registry/project-registry';

import { getLogger } from './logger/logger';

import * as fs from "fs";
import * as path from "path";

import { enrichConfigSchema, enrichDeploymentData, regexFilePathChecker, getComponentDirPath, getResourcesFromOpenApiFile, makeURLSafe } from "./utils";
import { AxiosResponse } from 'axios';
import { OPEN_CHOREO_ACTIVITY, SELECTED_GLOBAL_ORG_KEY, STATUS_INITIALIZING, STATUS_LOGGED_IN, STATUS_LOGGED_OUT, STATUS_LOGGING_IN, USER_INFO_KEY } from './constants';
import * as yaml from 'js-yaml';
import { Cache } from './cache';

export interface IChoreoExtensionAPI {
    signIn(authCode: string): Promise<void>;
    waitForLogin(): Promise<boolean>;
    isChoreoProject(): Promise<boolean>;
    getChoreoProject(): Promise<Project | undefined>;
    enrichChoreoMetadata(model: Map<string, ComponentModel>): Promise<Map<string, ComponentModel> | undefined>;
    getNonBalComponentModels(): Promise<{ [key: string]: ComponentModel }>
    deleteComponent(projectId: string, componentPath: string): Promise<void>;
    getConsoleUrl(): Promise<string>;
}


export class ChoreoExtensionApi {
    private _userInfo: UserInfo | undefined;
    private _status: ChoreoLoginStatus;

    private _selectedProjectId: string | undefined;

    private _choreoInstallationOrgId: number | undefined;

    private _componentConfigCache: Cache<ComponentConfig[], [number, string, string]>;

    private _onStatusChanged = new EventEmitter<ChoreoLoginStatus>();
    public onStatusChanged = this._onStatusChanged.event;


    private _onOrganizationChanged = new EventEmitter<Organization | undefined>();
    public onOrganizationChanged = this._onOrganizationChanged.event;

    private _onChoreoProjectChanged = new EventEmitter<string | undefined>();
    public onChoreoProjectChanged = this._onChoreoProjectChanged.event;

    private _onRefreshComponentList = new EventEmitter();
    public onRefreshComponentList = this._onRefreshComponentList.event;

    private _onRefreshWorkspaceMetadata = new EventEmitter();
    public onRefreshWorkspaceMetadata = this._onRefreshWorkspaceMetadata.event;

    constructor() {
        this._componentConfigCache = new Cache<ComponentConfig[], [number, string, string]>({
            getDataFunc: (orgId: number, projectHandler: string, componentName: string) => 
            ext.clients.projectClient.getComponentConfig(orgId, projectHandler, componentName)
        });
        this._status = STATUS_INITIALIZING;
    }

    public get userInfo(): UserInfo | undefined {
        // retrieve the user info from the global state
        if (!this._userInfo) {
            const userInfo = ext.context.globalState.get<UserInfo>(USER_INFO_KEY);
            if (userInfo) {
                getLogger().debug("User info retrieved from global state");
                this._userInfo = userInfo;
            } else {
                getLogger().debug("User info not found in global state");
            }
        }
        return this._userInfo;
    }

    public set userInfo(value: UserInfo | undefined) {
        // update the user info in the global state
        if (value) {
            ext.context.globalState.update(USER_INFO_KEY, value);
        } else {
            ext.context.globalState.update(USER_INFO_KEY, undefined);
        }
        this._userInfo = value;
    }

    public get status(): ChoreoLoginStatus {
        return this._status;
    }

    public set status(value: ChoreoLoginStatus) {
        this._status = value;
        this._onStatusChanged.fire(value);
    }

    public set selectedProjectId(selectedProjectId: string) {
        this._selectedProjectId = selectedProjectId;
        this._onChoreoProjectChanged.fire(selectedProjectId);
    }

    public async getSelectedOrg(userInfo = ext.api.userInfo): Promise<Organization> {
        // If workspace a choreo project, we need to select the org of the project.
        const isChoreoProject = ext.api.isChoreoProject();
        const currentProjectOrgId = ext.api.getOrgIdOfCurrentProject();

        if(!userInfo){
            throw new Error(`User information not found`);
        }

        if (isChoreoProject && currentProjectOrgId) {
            const foundOrg = userInfo?.organizations.find(org => org.id === currentProjectOrgId);
            if (foundOrg) {
                return foundOrg;
            }
        }

        const selectedGlobalOrg: Organization | undefined = await ext.context.globalState.get(SELECTED_GLOBAL_ORG_KEY);
        if(selectedGlobalOrg && userInfo?.organizations?.some(item => item.id === selectedGlobalOrg.id)){
            return selectedGlobalOrg;
        }
        
        if(userInfo?.organizations[0]){
            await ext.context.globalState.update(SELECTED_GLOBAL_ORG_KEY, userInfo?.organizations[0]);
            return userInfo?.organizations[0];
        }
        throw new Error("No organizations found for the user.");
    }

    public async setSelectedOrg(org: Organization): Promise<void> {
        const user = ext.api.userInfo;
        if (user?.organizations?.some((item) => item.id === org.id)) {
            if (this.isChoreoProject()) {
                const choreoProject = await this.getChoreoProject();
                if (choreoProject?.orgId?.toString() !== org?.id?.toString()) {
                    // If user is already in a choreo project & trying to swtich to a different one
                    const answer = await window.showInformationMessage(
                        `The currently opened project belongs to a different organization. To switch organizations, you can either open a new window or close the current workspace and continue in the current window.`,
                        { modal: true },
                        "Current Window",
                        "New Window"
                    );
                    if (answer === "Current Window") {
                        await ext.context.globalState.update(SELECTED_GLOBAL_ORG_KEY, org);
                        await ext.api.openChoreoActivityOnNewWindow();
                        await commands.executeCommand("workbench.action.closeFolder");
                    } else if (answer === "New Window") {
                        await ext.context.globalState.update(SELECTED_GLOBAL_ORG_KEY, org);
                        await ext.api.openChoreoActivityOnNewWindow();
                        await commands.executeCommand("workbench.action.newWindow");
                    }
                } else {
                    await ext.context.workspaceState.update(SELECTED_GLOBAL_ORG_KEY, org);
                    this.refreshOrganization(org);
                }
            } else {
                // If user is not within a choreo project
                await ext.context.globalState.update(SELECTED_GLOBAL_ORG_KEY, org);
                this.refreshOrganization(org);
            }
        }
    }

    public setChoreoInstallOrg(selectedOrgId: number) {
        this._choreoInstallationOrgId = selectedOrgId;
    }

    public getChoreoInstallOrg(): number | undefined {
        return this._choreoInstallationOrgId;
    }

    public clearChoreoInstallOrg() {
        this._choreoInstallationOrgId = undefined;
    }

    public refreshComponentList() {
        this._onRefreshComponentList.fire(null);
    }

    public refreshOrganization(org: Organization) {
        this._onOrganizationChanged.fire(org);
    }
    
    public refreshWorkspaceMetadata() {
        this._onRefreshWorkspaceMetadata.fire(null);
    }

    public projectUpdated() {
        this._onChoreoProjectChanged.fire(this._selectedProjectId);
    }

    public async signInWithAuthCode(authCode: string): Promise<void> {
        getLogger().debug("Signin with auth code triggered from ChoreoExtensionApi");
        return ext.authHandler.exchangeAuthCode(authCode);
    }

    public getOrgById(orgId: number): Organization | undefined {
        if (this.userInfo) {
            return this.userInfo.organizations.find(org => org.id.toString() === orgId.toString());
        }
        return undefined;
    }

    public getOrgByHandle(orgHandle: string): Organization | undefined {
        if (this.userInfo) {
            return this.userInfo.organizations.find(org => org.handle === orgHandle);
        }
        return undefined;
    }

    public async waitForLogin(): Promise<boolean> {
        switch (this._status) {
            case STATUS_LOGGED_IN:
                return true;
            case STATUS_LOGGED_OUT:
                return false;
            case STATUS_INITIALIZING:
            case STATUS_LOGGING_IN:
                return new Promise<boolean>(resolve => {
                    const subscription: Disposable = this.onStatusChanged(() => {
                        subscription.dispose();
                        resolve(this.waitForLogin());
                    });
                    ext.context.subscriptions.push(subscription);
                });
            default:
                const status: never = this._status;
                throw new Error(`Unexpected status '${status}'`);
        }
    }

    public isChoreoProject(): boolean {
        const workspaceFile = workspace.workspaceFile;
        if (workspaceFile && existsSync(workspaceFile.fsPath)) {
            const workspaceFilePath = workspaceFile.fsPath;
            const workspaceFileContent = readFileSync(workspaceFilePath, 'utf8');
            const workspaceConfig = JSON.parse(workspaceFileContent) as WorkspaceConfig;
            return workspaceConfig && workspaceConfig.metadata?.choreo?.projectID !== undefined;
        }
        return false;
    }

    public getChoreoProjectId(): string | undefined {
        const workspaceFile = workspace.workspaceFile;
        if (workspaceFile && this.isChoreoProject()) {
            const workspaceFilePath = workspaceFile.fsPath;
            const workspaceFileContent = readFileSync(workspaceFilePath, 'utf8');
            const workspaceConfig = JSON.parse(workspaceFileContent) as WorkspaceConfig;
            const projectID = workspaceConfig.metadata?.choreo?.projectID;
            return projectID;
        }
    }

    public getOrgIdOfCurrentProject(): number | undefined {
        const workspaceFile = workspace.workspaceFile;
        if (workspaceFile && this.isChoreoProject()) {
            const workspaceFilePath = workspaceFile.fsPath;
            const workspaceFileContent = readFileSync(workspaceFilePath, 'utf8');
            const workspaceConfig = JSON.parse(workspaceFileContent) as WorkspaceConfig;
            const orgId = workspaceConfig.metadata?.choreo?.orgId;
            return orgId;
        }
    }

    public getChoreoWorkspaceMetadata(): ChoreoWorkspaceMetaData {
        return {
            projectID: this.getChoreoProjectId(),
            orgId: this.getOrgIdOfCurrentProject()
        };
    }

    public async getChoreoProject(): Promise<Project | undefined> {
        const workspaceFile = workspace.workspaceFile;
        if (workspaceFile) {
            const workspaceFilePath = workspaceFile.fsPath;
            const workspaceFileContent = readFileSync(workspaceFilePath, 'utf8');
            const workspaceConfig = JSON.parse(workspaceFileContent) as WorkspaceConfig;
            const projectID = workspaceConfig.metadata?.choreo?.projectID,
                orgId = workspaceConfig.metadata?.choreo?.orgId;
            if (projectID && orgId) {
                const org = this.getOrgById(orgId);
                if (!org) {
                    throw new Error(`Organization with id ${orgId} not found for current user`);
                }
                return ProjectRegistry.getInstance().getProject(projectID, orgId, org.handle);
            }
        }
    }

    public async getConsoleUrl(): Promise<string> {
        return ProjectRegistry.getInstance().getConsoleUrl();
    }

    public async getProject(projectId: string, orgId: number): Promise<Project | undefined> {
        const org = this.getOrgById(orgId);
        if (!org) {
            throw new Error(`Organization with id ${orgId} not found for current user`);
        }
        return ProjectRegistry.getInstance().getProject(projectId, orgId, org.handle);
    }

    public getProjectManager(projectId: string): Promise<IProjectManager | undefined> {
        return Promise.resolve(undefined);
    }

    public async getPerformanceForecastData(data: string): Promise<AxiosResponse> {
        const orgId = ext.api.getOrgIdOfCurrentProject();

        if (!orgId) {
            throw Error("Current project is not a Choreo project");
        }
        const orgHandle = ext.api.getOrgById(orgId)?.handle;
        return ProjectRegistry.getInstance().getPerformanceForecast(orgId!, orgHandle!, data);
    }

    public async getSwaggerExamples(orgId: number, orgHandle: string, spec: any): Promise<AxiosResponse> {
        return ProjectRegistry.getInstance().getSwaggerExamples(orgId, orgHandle, spec);
    }

    public async enrichChoreoMetadata(model: Map<string, ComponentModel>): Promise<Map<string, ComponentModel> | undefined> {
        const choreoProject = await this.getChoreoProject();
        if (choreoProject) {
            const { id: projectID, orgId } = choreoProject;
            const organization = this.getOrgById(parseInt(orgId));
            if (!organization) {
                throw new Error(`Organization with id ${orgId} not found under user ${this.userInfo?.displayName}`);
            }
            const workspaceFileLocation = ProjectRegistry.getInstance().getProjectLocation(projectID);
            if (workspaceFileLocation) {
                const workspaceFileConfig: WorkspaceConfig = JSON.parse(readFileSync(workspaceFileLocation).toString());
                // Remove workspace file from path
                const projectRoot = workspaceFileLocation.slice(0, workspaceFileLocation.lastIndexOf(path.sep));

                if (workspaceFileConfig?.folders && projectRoot) {
                    const choreoComponents = await ProjectRegistry.getInstance().fetchComponentsFromCache(projectID,
                        organization.id,
                        organization.handle, organization.uuid);

                    for (const choreoComponent of choreoComponents || []) {
                        const { name, displayType, id, accessibility, apiVersions, local } = choreoComponent;
                        const wsConfig = workspaceFileConfig.folders.find(component =>
                            component.name === name || makeURLSafe(component.name) === name
                        );
                        if (wsConfig && wsConfig.path) {
                            const componentPath: string = path.join(projectRoot, wsConfig.path);
                            for (const localModel of model.values()) {
                                if (localModel.functionEntryPoint?.sourceLocation?.filePath.includes(componentPath) &&
                                    (displayType === ChoreoComponentType.ScheduledTask.toString() || displayType === ChoreoComponentType.ManualTrigger.toString())) {
                                    localModel.functionEntryPoint.type = displayType as any;
                                }
                                const response = await enrichDeploymentData(orgId, id,
                                    new Map(Object.entries(localModel.services)), apiVersions, componentPath
                                );
                                if (response) {
                                    break;
                                }
                            }
                        }
                    };
                }
            }
        }
        return Promise.resolve(model);
    }

    getNonBalComponentModels = async (): Promise<{ [key: string]: ComponentModel }> => {
        let nonBalMap: { [key: string]: ComponentModel } = {};
        const choreoProject = await this.getChoreoProject();
        if (choreoProject) {
            const { id: projectID, orgId } = choreoProject;
            const workspaceFileLocation = ProjectRegistry.getInstance().getProjectLocation(projectID);

            if (workspaceFileLocation) {
                const organization = this.getOrgById(parseInt(orgId));
                if (!organization) {
                    throw new Error(`Organization with id ${orgId} not found under user ${this.userInfo?.displayName}`);
                }

                const choreoComponents = await ProjectRegistry.getInstance().fetchComponentsFromCache(
                    projectID,
                    organization.id,
                    organization.handle,
                    organization.uuid
                );

                const nonBalComponents = choreoComponents?.filter((item) => item.displayType?.startsWith("byoc"));
                nonBalComponents?.forEach((component) => {

                    const defaultService: CMService = {
                        id: component.id || component.name,
                        label: "",
                        dependencies: [],
                        type: ServiceTypes.OTHER,
                        remoteFunctions: [],
                        resourceFunctions: [],
                        annotation: { id: component.id || component.name, label: component.displayName },
                    };

                    const defaultComponentModel: ComponentModel = {
                        hasCompilationErrors: false,
                        entities: new Map(),
                        id: component.name,
                        orgName: organization.name,
                        version: component.version,
                        services: { [component.name]: defaultService } as any,
                        hasModelErrors: false,
                        modelVersion: '0.4.0',
                        connections: []
                    };

                    const componentPath = getComponentDirPath(component, workspaceFileLocation);
                    if (component.displayType === ComponentDisplayType.ByocService && componentPath) {
                        const endpointsPath = path.join(componentPath, ".choreo", "endpoints.yaml");
                        if (existsSync(endpointsPath)) {
                            const serviceBaseId = `${component.name}`;
                            const endpointsContent = yaml.load(readFileSync(endpointsPath, "utf8"));
                            const endpoints: Endpoint[] = (endpointsContent as any).endpoints;

                            const services: { [key: string]: CMService } = {};

                            if (endpoints && Array.isArray(endpoints)) {
                                for (const endpoint of endpoints) {
                                    let resources: CMResourceFunction[] = [];

                                    const serviceId = `${component.name}-${endpoint.name}`;

                                    if (endpoint.schemaFilePath) {
                                        const openApiPath = path.join(componentPath, endpoint.schemaFilePath);
                                        resources = getResourcesFromOpenApiFile(openApiPath, serviceId);
                                    }

                                    const service: CMService = {
                                        ...defaultService,
                                        id: serviceId,
                                        type: endpoint?.type || ServiceTypes.HTTP,
                                        resourceFunctions: resources,
                                        annotation: { id: serviceId, label: endpoint.name },
                                        sourceLocation: {
                                            filePath: endpointsPath,
                                            startPosition: { line: 0, offset: 0 },
                                            endPosition: { line: 0, offset: 0 },
                                        },
                                        deploymentMetadata: {
                                            gateways: {
                                                internet: { isExposed: endpoint?.networkVisibility === "Public" },
                                                intranet: { isExposed: endpoint?.networkVisibility === "Organization" },
                                            },
                                        },
                                    };
                                    services[serviceId] = service;
                                }
                            }

                            nonBalMap[serviceBaseId] = {
                                ...defaultComponentModel,
                                services: services as any,
                            };
                        }  else {
                            nonBalMap[component.name] = defaultComponentModel;
                        }
                    } else if([ComponentDisplayType.ByocWebAppDockerLess, ComponentDisplayType.ByocWebApp].includes(component.displayType as ComponentDisplayType)) {
                        const service: CMService = {
                            ...defaultService,
                            type: ServiceTypes.WEBAPP,
                            deploymentMetadata: { gateways: { internet: { isExposed: true }, intranet: { isExposed: false } }},
                        };

                        nonBalMap[component.name] = {
                            ...defaultComponentModel,
                            services: { [component.name]: service } as any,
                        };
                    } else if([ComponentDisplayType.ByocCronjob, ComponentDisplayType.ByocJob].includes(component.displayType as ComponentDisplayType)) {
                        nonBalMap[component.name] = {
                            ...defaultComponentModel,
                            services: new Map(),
                            functionEntryPoint: {
                                id: "",
                                label: "",
                                annotation: { id: component.name, label: "" },
                                dependencies: [],
                                interactions: [],
                                parameters: [],
                                returns: [],
                                type: component.displayType === ComponentDisplayType.ByocJob ? "manualTrigger" : "scheduledTask"
                            },
                        };
                    } else {
                        nonBalMap[component.name] = defaultComponentModel;
                    }
                });
            }
        }

        return nonBalMap;
    };

    public async deleteComponent(projectId: string, componentPath: string) {
        const choreoProject = await this.getChoreoProject();
        if (choreoProject) {
            const { orgId } = choreoProject;
            const organization = this.getOrgById(parseInt(orgId));
            if (!organization) {
                throw new Error(`Organization with id ${orgId} not found under user ${this.userInfo?.displayName}`);
            }
            const { handle, id, uuid } = organization;
            const components: Component[] = await ProjectRegistry.getInstance().getComponents(projectId, id, handle, uuid);
            const folder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(Uri.file(componentPath));
            const toDelete = components.find(component =>
                folder?.name && (component.name === folder.name || component.name === makeURLSafe(folder.name))
            );
            if (toDelete) {
                await ProjectRegistry.getInstance().deleteComponent(toDelete, id, handle, projectId);
            }
        }
    }

    /** Persist a value in the global state so that when extension reactivates, we can do certain actions automatically */
    public async openChoreoActivityOnNewWindow(): Promise<void> {
        await ext.context.globalState.update(OPEN_CHOREO_ACTIVITY, true);
    }

    public async shouldOpenChoreoActivity(): Promise<boolean | undefined> {
        return ext.context.globalState.get<boolean>(OPEN_CHOREO_ACTIVITY);
    }
    
    public async resetOpenChoreoActivity(): Promise<void> {
        await ext.context.globalState.update(OPEN_CHOREO_ACTIVITY, undefined);
    }

    public async getOpenedComponentName(): Promise<string | undefined> {
        // Read workspace file
        const workspaceFile = workspace.workspaceFile;
        const workspaceData = await workspace.fs.readFile(workspaceFile!);
        const workspaceContent = new TextDecoder().decode(workspaceData);
        const workspaceConfig = JSON.parse(workspaceContent) as WorkspaceConfig;

        const activeEditor = window.activeTextEditor;
        if (activeEditor && activeEditor.document) {
            const activeFilePath = activeEditor.document.uri.fsPath;
            for (const folder of workspaceConfig.folders) {
                if (folder.name === "choreo-project-root") {
                    continue;
                } else if (activeFilePath.includes(folder.path.trim())) {
                    return folder.name;
                };
            }
        }

        return undefined;
    }

    public async setupYamlLangugeServer(project?: Project, component?: string): Promise<void> {
        const yamlExtension = extensions.getExtension("redhat.vscode-yaml");
        if (!yamlExtension) {
            window.showErrorMessage(
                'The "YAML Language Support by Red Hat" extension is required for the Choreo Component Configuration to work properly. Please install it and reload the window.'
            );
            return;
        }
        const yamlExtensionAPI = await yamlExtension.activate();
        const SCHEMA = "choreo";
    
        // Read the schema file content
        const schemaFilePath = path.join(ext.context.extensionPath, "schema", "config-schema.json");
    
        const schemaContent = fs.readFileSync(schemaFilePath, "utf8");
        let schemaContentJSON = JSON.parse(schemaContent) as ComponentConfigSchema;

        if (!!project && !!component) {
            const componentConfigKey = `${project.orgId}-${project.handler}-${component}`;
            const componentConfigs = await this._componentConfigCache.get(componentConfigKey, parseInt(project.orgId), project.handler, component);
            if (componentConfigs) {
                schemaContentJSON = enrichConfigSchema(schemaContentJSON, component, project.handler, componentConfigs);
            }
        }

        const schemaJSON = JSON.stringify(schemaContentJSON);

        function onRequestSchemaURI(resource: string): string | undefined {
            if (regexFilePathChecker(resource, /\.choreo\/component\.yaml$/)) {
                return `${SCHEMA}://schema/component-config`;
            }
            return undefined;
        }
    
        function onRequestSchemaContent(schemaUri: string): string | undefined {
            const parsedUri = Uri.parse(schemaUri);
            if (parsedUri.scheme !== SCHEMA) {
                return undefined;
            }
            if (!parsedUri.path || !parsedUri.path.startsWith("/")) {
                return undefined;
            }
    
            return schemaJSON;
        }
    
        // Register the schema provider
        yamlExtensionAPI.registerContributor(SCHEMA, onRequestSchemaURI, onRequestSchemaContent, "apiVersion:core.choreo.dev/v1alpha1");
    }
}
