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

import { choreoEnvConfig, getConsoleUrl } from "../auth/auth";
import {
    BYOCRepositoryDetails,
    ChoreoComponentCreationParams,
    Component,
    ComponentCount,
    Environment,
    getLocalComponentDirMetaDataRes,
    getLocalComponentDirMetaDataRequest,
    Organization,
    Project,
    PushedComponent,
    serializeError,
    WorkspaceComponentMetadata,
    ChoreoServiceType,
    ComponentDisplayType,
    GitRepo,
    GitProvider,
    Endpoint,
    getEndpointsForVersion,
    EndpointData,
    WorkspaceConfig
} from "@wso2-enterprise/choreo-core";
import { ext } from "../extensionVariables";
import { existsSync, rmdirSync, cpSync, rmSync, readdir, copyFile, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { CreateByocComponentParams, CreateComponentParams } from "@wso2-enterprise/choreo-client";
import { AxiosResponse } from 'axios';
import { dirname, isAbsolute, join, relative } from "path";
import * as vscode from 'vscode';
import { ChoreoProjectManager } from "@wso2-enterprise/choreo-client/lib/manager";
import { initGit, } from "../git/main";
import { getLogger } from "../logger/logger";
import { ProgressLocation, Uri, window, workspace, WorkspaceFolder } from "vscode";
import { executeWithTaskRetryPrompt } from "../retry";
import { getComponentDirPath, makeURLSafe } from "../utils";
import * as yaml from 'js-yaml';

// Key to store the project locations in the global state
const PROJECT_LOCATIONS = "project-locations";
const PREFERRED_PROJECT_REPOSITORIES = "preferred-project-repositories-v2";
const EXPANDED_COMPONENTS = "expanded-components";


export class ProjectRegistry {
    static _registry: ProjectRegistry | undefined;
    private _dataProjects: Map<number, Project[]> = new Map<number, Project[]>([]);
    private _dataComponents: Map<string, Component[]> = new Map<string, Component[]>([]);
    private _projectEnvs: Map<string, Environment[]> = new Map<string, Environment[]>([]);

    constructor() {

    }

    // There will be only one global registry
    static getInstance(): ProjectRegistry {
        if (ProjectRegistry._registry !== undefined) {
            return ProjectRegistry._registry;
        }
        else {
            const registry: ProjectRegistry = new ProjectRegistry();
            ProjectRegistry._registry = registry;
            return registry;
        }
    }

    // When the registry initialised
    init() {
        // Load the persisted data
        // Check if there is a valid user token
        // If so sync the data
        // If the user is offline proceed with the persisted data
        throw new Error(`Method not implemented`);
    }

    async clean(): Promise<void> {
        return new Promise((resolve) => {
            this._dataProjects = new Map<number, Project[]>([]);
            this._dataComponents = new Map<string, Component[]>([]);
            resolve();
        });
    }

    async getProject(projectId: string, orgId: number, orgHandle: string): Promise<Project | undefined> {
        return this.getProjects(orgId, orgHandle).then(async (projects: Project[]) => {
            return projects.find((project: Project) => project.id === projectId);
        });
    }

    async getProjects(orgId: number, orgHandle: string, forceRefresh: boolean = false): Promise<Project[]> {
        if ((forceRefresh || !this._dataProjects.has(orgId)) && ext.api.status === "LoggedIn") {
            try {
                const projects: Project[] = await executeWithTaskRetryPrompt(() => ext.clients.projectClient.getProjects({ orgId, orgHandle }));
                this._dataProjects.set(orgId, projects);
                return projects;
            } catch (error: any) {
                getLogger().error("Error while fetching projects. "+ error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
                window.showErrorMessage("Error while fetching projects ");
                return [];
            }
        } else {
            return new Promise((resolve) => {
                const projects: Project[] | undefined = this._dataProjects.get(orgId);
                resolve(projects ? projects : []);
            });
        }
    }

    async checkProjectDeleted(projectId: string, orgId: number, orgHandle: string): Promise<boolean> {
        const projects: Project[] = await executeWithTaskRetryPrompt(() => ext.clients.projectClient.getProjects({ orgId, orgHandle }));
        const project = projects.find((project: Project) => project.id === projectId);

        if (project === undefined) {
            return true;
        }

        return false;
    }

    async createNonBalLocalComponent(args: ChoreoComponentCreationParams): Promise<void> {
        const projectLocation = this.getProjectLocation(args.projectId);
        if (projectLocation) {
            await window.withProgress({
                title: `Initializing ${args.name} component`,
                location: ProgressLocation.Notification,
                cancellable: false
            }, async () => {
                this.addDockerFile(args);
                if(args.displayType === ComponentDisplayType.ByocService && args.serviceType){
                    this.addEndpointsYaml(args);
                }
                await (new ChoreoProjectManager()).addToWorkspace(projectLocation, args);
                window.showInformationMessage('Component created successfully');
            });
        } else {
            throw new Error("Error: Could not detect a project workspace.");
        }
    }

    addDockerFile = (args: ChoreoComponentCreationParams) => {
        const projectLocation = this.getProjectLocation(args.projectId);
        const { org, repo, dockerContext } = args.repositoryInfo as BYOCRepositoryDetails;
        if(projectLocation){
            const projectDir = dirname(projectLocation);
            let basePath = join(projectDir, "repos", org, repo);
            if(dockerContext){
                basePath = join(basePath, dockerContext);
            }
            if(!existsSync(basePath)){
                mkdirSync(basePath);
            }
            const dockerFilePath = join(basePath, 'Dockerfile');
            if(!existsSync(dockerFilePath)){
                writeFileSync(dockerFilePath,'');
            }
        }
        
    };

    addEndpointsYaml = async (args: ChoreoComponentCreationParams) => {
        const projectLocation = this.getProjectLocation(args.projectId);
        const { org, repo, dockerContext, openApiFilePath } = args.repositoryInfo as BYOCRepositoryDetails;
        if (projectLocation) {
            const projectDir = dirname(projectLocation);
            let basePath = join(projectDir, "repos", org, repo);
            if (dockerContext) {
                basePath = join(basePath, dockerContext);
            }
            const schemaFilePath = openApiFilePath && dockerContext
                    ? relative(dockerContext, openApiFilePath)
                    : openApiFilePath || "openapi.yaml";
            const endpointsYamlPath = join(basePath, ".choreo", "endpoints.yaml");

            if (existsSync(endpointsYamlPath)) {
                rmSync(endpointsYamlPath);
            }

            let endpointsYamlContent = readFileSync(
                join(ext.context.extensionPath, "/templates/endpoints-template.yaml")
            ).toString();
            endpointsYamlContent = endpointsYamlContent.replace("ENDPOINT_NAME", args.name);
            endpointsYamlContent = endpointsYamlContent.replace("PORT", args.port ? args.port.toString() : "3000");
            endpointsYamlContent = endpointsYamlContent.replace("TYPE", args.serviceType ? args.serviceType?.toString() : "REST");
            endpointsYamlContent = endpointsYamlContent.replace("NETWORK_VISIBILITY", args.networkVisibility ?? "Project");

            if (args.serviceType && [ChoreoServiceType.RestApi, ChoreoServiceType.GraphQL].includes(args.serviceType)) {
                endpointsYamlContent = endpointsYamlContent.replace("ENDPOINT_CONTEXT", args.networkVisibility ?? ".");
            } else {
                endpointsYamlContent = endpointsYamlContent.replace("context: ENDPOINT_CONTEXT", "# context: ENDPOINT_CONTEXT");
            }

            if (args.serviceType === ChoreoServiceType.RestApi) {
                endpointsYamlContent = endpointsYamlContent.replace("SCHEMA_PATH", schemaFilePath);

                const openApiPath = join(basePath, schemaFilePath);
                if (!existsSync(openApiPath)) {
                    cpSync(
                        join(ext.context.extensionPath, "/templates/openapi-template.yaml"),
                        join(basePath, schemaFilePath)
                    );
                }
            } else {
                endpointsYamlContent = endpointsYamlContent.replace("schemaFilePath: SCHEMA_PATH", "# schemaFilePath: endpoints.yaml");
            }

            const choreoDirPath = dirname(endpointsYamlPath);
            if (!existsSync(choreoDirPath)) {
                mkdirSync(choreoDirPath);
            }
            writeFileSync(endpointsYamlPath, endpointsYamlContent);
        }
    };

    async createNonBalLocalComponentFromExistingSource(args: ChoreoComponentCreationParams): Promise<void> {
        const projectLocation = this.getProjectLocation(args.projectId);
        if (workspace.workspaceFile && projectLocation) {
            await window.withProgress({
                title: `Initializing ${args.name} component`,
                location: ProgressLocation.Notification,
                cancellable: false
            }, async () => {
                if(args.displayType === ComponentDisplayType.ByocService && args.serviceType){
                    this.addEndpointsYaml(args);
                }

                await (new ChoreoProjectManager()).addToWorkspace(projectLocation, args);
                window.showInformationMessage('Component created successfully');
            });
        } else {
            throw new Error("Error: Could not detect a project workspace.");
        }
    }
    
    getSourceFiles(projectLocation: string, component: Component): { path: string; label: string;}[] {
        const componentPath = getComponentDirPath(component, projectLocation);
        const repo = component.repository;
        if (componentPath) {
            if (component.displayType?.startsWith("byoc")) {
                const files = [];
                const dockerFilePath = repo?.byocBuildConfig?.dockerfilePath;
                if (dockerFilePath && repo?.organizationApp && repo?.nameApp) {
                    const dockerFileFullPath = join(dirname(projectLocation), "repos", repo?.organizationApp, repo?.nameApp, dockerFilePath);
                    if (existsSync(dockerFileFullPath)) {
                        files.push({ path: dockerFileFullPath, label: "Dockerfile" });
                    }
                }

                const endpointsYamlPath = join(componentPath, '.choreo', 'endpoints.yaml');
                if (existsSync(endpointsYamlPath)){
                    files.push({ path: endpointsYamlPath, label: "Endpoints" });
                }
                return files;
            } else {
                if (existsSync(join(componentPath, "service.bal"))) {
                    return [{ path: join(componentPath, "service.bal"), label: "Source" }];
                } else if (existsSync(join(componentPath, "main.bal"))) {
                    return [{ path: join(componentPath, "main.bal"), label: "Source" }];
                } else if (existsSync(join(componentPath, "sample.bal"))) {
                    return [{ path: join(componentPath, "sample.bal"), label: "Source" }];
                }
            }
        }
        return [];
    }

    async getComponents(projId: string, orgId: number, orgHandle: string, orgUuid: string): Promise<Component[]> {
        try {
            let components = await executeWithTaskRetryPrompt(() =>
                ext.clients.projectClient.getComponents({ projId, orgId, orgHandle, orgUuid })
            );
            const projectLocation = this.getProjectLocation(projId);
            components = this._addLocalComponents(projId, components);
            components = await Promise.all(
                components.map(async (component) => {
                    const componentPath = projectLocation ? getComponentDirPath(component, projectLocation) : '';
                    const isRemoteOnly = componentPath ? !existsSync(componentPath) : false;
                    const filePaths = projectLocation ? this.getSourceFiles(projectLocation, component): undefined;
                    let hasUnPushedLocalCommits = false;
                    let hasDirtyLocalRepo = false;

                    if (!isRemoteOnly) {
                        [hasUnPushedLocalCommits, hasDirtyLocalRepo] = await Promise.all([
                            this.hasUnPushedLocalCommit(projId, component),
                            this.hasDirtyLocalRepo(projId, component),
                        ]);
                    }

                    return {
                        ...component,
                        hasUnPushedLocalCommits,
                        hasDirtyLocalRepo,
                        isRemoteOnly,
                        filePaths
                    } as Component;
                })
            );

            this._dataComponents.set(projId, components);

            return components;
        } catch (error: any) {
            const errorMetadata = error?.cause?.response?.metadata;
            getLogger().error("Error while fetching components. " + error?.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
            throw new Error(`Failed to fetch component list. ${errorMetadata?.errorCode || error?.message}`);
        }
    }

    async getDeletedComponents(projId: string, orgId: number, orgHandle: string, orgUuid: string): Promise<PushedComponent[]> {
        const projectLocation = this.getProjectLocation(projId);
        const dataComponents = await executeWithTaskRetryPrompt(() => ext.clients.projectClient
                    .getComponents({ projId, orgId, orgHandle, orgUuid }));
        let deletedComponents: PushedComponent[] = [];

        if (projectLocation !== undefined) {
            const pushedComponents = (new ChoreoProjectManager()).getPushedComponents(projectLocation);

            if (dataComponents && dataComponents.length < pushedComponents.length) {
                deletedComponents = pushedComponents.filter((pushedComponent: PushedComponent) => {
                    let isDeleted = true;
                    dataComponents.forEach((component: Component) => {
                        if (component.name === pushedComponent.name) {
                            isDeleted = false;
                        }
                    });

                    if (isDeleted) {
                        return pushedComponent;
                    }
                });
            }
        }

        return deletedComponents;
    }

    removeDeletedComponents(components: PushedComponent[], projectId: string) {
        const projectLocation = this.getProjectLocation(projectId);

        if (projectLocation !== undefined) {
            components.forEach((component: PushedComponent) => {
                const repoPath = join(dirname(projectLocation), component.path);
                if (existsSync(repoPath)) {
                    rmdirSync(repoPath, { recursive: true });
                    this._removeComponentFromWorkspace(component.name, projectLocation);
                }
            });
        }

        const successMsg = " Please commit & push your local changes changes to ensure consistency with the remote repository.";
        vscode.window.showInformationMessage(successMsg);
    }

    public async getComponentBuildStatus(orgId: number, orgHandle: string, component: Component) {
        try {
            const selectedVersion = component.apiVersions?.find(item => item.latest);
            if (selectedVersion) {
                const buildStatus = await ext.clients.projectClient.getComponentBuildStatus({ orgId, orgHandle, componentId: component.id, versionId: selectedVersion.id });
                return buildStatus;
            }
        } catch {
            return null;
        }
    }

    public async getComponentDevDeployment(component: Component, orgId: number, orgHandle: string, orgUuid: string) {
        try {
            let envData = this._projectEnvs.get(component.projectId);
            if (!envData) {
                envData = await ext.clients.projectClient.getProjectEnv({ orgHandle, orgId, orgUuid, projId: component.projectId });
                if (envData) {
                    this._projectEnvs.set(component.projectId, envData);
                }
            }
            const devEnv = envData?.find((env: Environment) => env.name === 'Development');
            const selectedVersion = component.apiVersions?.find(item => item.latest);
            if (selectedVersion && devEnv) {
                const deploymentDetails = await ext.clients.projectClient.getComponentDeploymentStatus({
                    orgId,
                    component,
                    envId: devEnv?.id,
                    orgHandle,
                    orgUuid,
                    projId: component.projectId,
                    versionId: selectedVersion.id
                });
                return deploymentDetails;
            }
        } catch {
            return null;
        }
    }

    async deleteProject(projectId: string, orgId: number): Promise<void> {
        try {
            await window.withProgress({
                title: `Deleting currently opened project.`,
                location: ProgressLocation.Notification,
                cancellable: false
            }, async () => {
                const org = ext.api.getOrgById(orgId);
                const allComponents = await this.getComponents(projectId, orgId, org?.handle!, org?.uuid!);
                const projectLocation = this.getProjectLocation(projectId);
                if(projectLocation && org){
                    for (const component of allComponents) {
                        await ext.clients.projectClient.deleteComponent({
                            component,
                            orgId: orgId,
                            orgHandle: component.orgHandler,
                            projectId: projectId,
                        });

                        this.deleteLocalComponentFiles(component, projectLocation);
                        this._removeComponentFromWorkspace(component.name, projectLocation);
                    }

                    await ext.clients.projectClient.deleteProject({
                        orgId: orgId,
                        orgHandle: org?.handle,
                        projectId: projectId,
                    });
                    const contents = readFileSync(projectLocation);
                    const content: WorkspaceConfig = JSON.parse(contents.toString());
                    writeFileSync(projectLocation, JSON.stringify({folders: content.folders}, null, 4));
                    ext.api.refreshWorkspaceMetadata();
                    vscode.window.showInformationMessage("Project has been successfully deleted successfully");
                }
            });
        } catch (error: any) {
            vscode.window.showErrorMessage("Failed to delete the project.");
            getLogger().error(`Failed to delete the project. ` + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
        }
    }

    deleteLocalComponentFiles(component: Component, projectLocation: string): boolean|void {
        if (component.local) {
            const choreoPM = new ChoreoProjectManager();
            const localComponentMeta: WorkspaceComponentMetadata[] = choreoPM.getComponentMetadata(projectLocation);
            const componentMetadata = localComponentMeta?.find(item => item.displayName === component.name);
            if (componentMetadata) {
                const { orgApp, nameApp } = componentMetadata.repository;
                const subPath = componentMetadata.repository?.appSubPath 
                    || componentMetadata.byocConfig?.dockerContext
                    || componentMetadata.byocWebAppsConfig?.dockerContext
                    || componentMetadata.byocWebAppsConfig?.webAppOutputDirectory;
                if (subPath) {
                    const repoPath = join(dirname(projectLocation), "repos", orgApp, nameApp, subPath);
                    if (existsSync(repoPath)) {
                        rmdirSync(repoPath, { recursive: true });
                    }
                }
            }
        } else if (!component?.isRemoteOnly && component?.repository) {
            const { organizationApp, nameApp } = component.repository;
            const subPath = component.repository.appSubPath
                || component.repository.byocBuildConfig?.dockerContext
                || component.repository.byocWebAppBuildConfig?.dockerContext
                || component.repository.byocWebAppBuildConfig?.outputDirectory;
            if (subPath) {
                const repoPath = join(dirname(projectLocation), "repos", organizationApp, nameApp, subPath);
                if (existsSync(repoPath)) {
                    rmdirSync(repoPath, { recursive: true });
                    return true;
                }
            }
        }
    }

    async deleteComponent(component: Component, orgId: number, orgHandle: string, projectId: string): Promise<void> {
        try {
            await window.withProgress({
                title: `Deleting component ${component?.name}.`,
                location: ProgressLocation.Notification,
                cancellable: false
            }, async () => {
                let successMsg = "The component has been deleted successfully.";
                if (!component?.local && component.id) {
                    await ext.clients.projectClient.deleteComponent({ component, orgId, orgHandle, projectId });
                }

                const projectLocation = this.getProjectLocation(projectId);
                if (projectLocation) {
                    const showRemoveLocalFilesMsg = this.deleteLocalComponentFiles(component, projectLocation);
                    if (showRemoveLocalFilesMsg) {
                        successMsg += " Please commit & push your local changes changes to ensure consistency with the remote repository.";
                    }
                    this._removeComponentFromWorkspace(component.name, projectLocation);
                }

                vscode.window.showInformationMessage(successMsg);
            });
        } catch (error: any) {
            getLogger().error(`Failed to delete the component ${component?.name}. ` + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
        }
    }

    async pullComponent(orgId: number, componentId: string, projectId: string): Promise<void> {
        try {
            const allComponents = this._dataComponents.get(projectId);
            const componentToBePulled = allComponents?.find(item => item.id === componentId);
            const projectLocation = this.getProjectLocation(projectId);

            if (componentToBePulled?.repository && projectLocation) {
                const { organizationApp, nameApp } = componentToBePulled.repository;

                await window.withProgress({
                    title: `Pulling changes from  ${organizationApp}/${nameApp}.`,
                    location: ProgressLocation.Notification,
                    cancellable: false
                }, async () => {
                    const git = await initGit(ext.context);
                    if (git) {
                        const repoPath = join(dirname(projectLocation), 'repos', organizationApp, nameApp);
                        await executeWithTaskRetryPrompt(() => git.pull(repoPath));
                    } else {
                        getLogger().error("Git was not initialized");
                    }
                });

                const componentPath = getComponentDirPath(componentToBePulled, projectLocation);
                if (componentPath && !existsSync(componentPath)){
                    const selection = await window.showErrorMessage("Error: Directory for the component does not exist", "Delete Component");
                    if(selection === "Delete Component"){
                        await this.deleteComponent(componentToBePulled, orgId, componentToBePulled.orgHandler, componentToBePulled.projectId);
                    }
                } else {
                    window.showInformationMessage("The component has been successfully pulled");
                }

            }
        } catch (error: any) {
            getLogger().error("Failed to pull the changes from the remote repository. " + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
        }
    }

    async getComponentCount(orgId: number): Promise<ComponentCount> {
        try {
            return ext.clients.componentManagementClient.getComponentCount(orgId);
        } catch (error: any) {
            getLogger().error("Failed to fetch the component count. " + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
            throw new Error("Failed to fetch the component count. " + error?.message);
        }
    }

    async hasChoreoSubscription(orgId: number): Promise<boolean> {
        try {
            const res = await ext.clients.subscriptionClient.getSubscriptions(orgId);
            const hasSubscription = res?.list?.some(item => item.subscriptionType === 'choreo-subscription');
            return hasSubscription;
        } catch (error: any) {
            getLogger().error("Failed to fetch subscription details. " + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
            throw new Error("Failed to fetch subscription details. " + error?.message);
        }
    }

    async getDiagramModel(projId: string, orgId: number, orgHandle: string): Promise<Component[]> {
        return executeWithTaskRetryPrompt(() => ext.clients.projectClient.getDiagramModel({ projId, orgHandle, orgId }));
    }

    async getEndpointsForVersion(componentId: string, version: string, orgId: number): Promise<EndpointData | null> {
        return executeWithTaskRetryPrompt(() => ext.clients.projectClient.getEndpointData(componentId, version, orgId));
    }

    async getPerformanceForecast(orgId: number, orgHandle: string, data: string): Promise<AxiosResponse> {
        return executeWithTaskRetryPrompt(() => ext.clients.projectClient.getPerformanceForecastData({
            orgId,
            orgHandle,
            data
        }));
    }

    async getSwaggerExamples(orgId: number, orgHandle: string, spec: any): Promise<AxiosResponse> {
        return ext.clients.projectClient.getSwaggerExamples({
                    orgId,
                    orgHandle,
                    data: spec
                }).then((result: any) => {
                        return result;
                    }).catch((error: any) => {
                        getLogger().error("Failed to fetch the swagger examples. " + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
                        return false;
                    });
    }

    setProjectLocation(projectId: string, location: string) {
        // Project locations are stored in global state
        let projectLocations: Record<string, string> | undefined = ext.context.globalState.get(PROJECT_LOCATIONS);
        // If the locations are not set before create the location map
        if (projectLocations === undefined) {
            projectLocations = {};
        }
        projectLocations[projectId] = location;
        ext.context.globalState.update(PROJECT_LOCATIONS, projectLocations);
    }

    getProjectLocation(projectId: string): string | undefined {
        let projectLocations: Record<string, string> | undefined = ext.context.globalState.get(PROJECT_LOCATIONS);
        const filePath: string | undefined = (projectLocations) ? projectLocations[projectId] : undefined;
        // TODO: check if the location exists 
        if (filePath !== undefined) {
            if (existsSync(filePath)) {
                return filePath;
            } else {
                this._removeLocation(projectId);
            }
        }
        // If not, remove the location from the state
        return undefined;
    }

    setExpandedComponents(projectId: string, expandedComponentNames: string[]) {
        let projectExpandedComponents: Record<string, string[]> | undefined = ext.context.workspaceState.get(EXPANDED_COMPONENTS);
        if (projectExpandedComponents === undefined) {
            projectExpandedComponents = {};
        }
        projectExpandedComponents[projectId] = expandedComponentNames;
        ext.context.workspaceState.update(EXPANDED_COMPONENTS, projectExpandedComponents);
    }

    getExpandedComponents(projectId: string): string[] {
        const projectExpandedComponents: Record<string, string[]> | undefined = ext.context.workspaceState.get(EXPANDED_COMPONENTS);
        const componentNames = projectExpandedComponents?.[projectId];
        return componentNames ?? [];
    }

    setPreferredProjectRepository(projectId: string, repo: GitRepo) {
        let projectRepositories: Record<string, GitRepo> | undefined = ext.context.globalState.get(PREFERRED_PROJECT_REPOSITORIES);
        if (projectRepositories === undefined) {
            projectRepositories = {};
        }
        projectRepositories[projectId] = repo;
        ext.context.globalState.update(PREFERRED_PROJECT_REPOSITORIES, projectRepositories);
    }

    getPreferredProjectRepository(projectId: string): GitRepo | undefined {
        const projectRepositories: Record<string, GitRepo> | undefined = ext.context.globalState.get(PREFERRED_PROJECT_REPOSITORIES);
        let preferredRepository: GitRepo | undefined = projectRepositories ? projectRepositories[projectId] : undefined;
        return preferredRepository;
    }

    pushLocalComponentsToChoreo(projectId: string, componentNames: string[] = [], org: Organization): Thenable<string[]> {
        return window.withProgress({
            title: `Pushing local components to Choreo`,
            location: ProgressLocation.Notification,
            cancellable: true
        }, async (_progress, cancellationToken) => {

            cancellationToken.onCancellationRequested(async () => {
                getLogger().debug("Pushing to Choreo cancelled for project: " + projectId);
            });

            const projectLocation: string | undefined = this.getProjectLocation(projectId);
            const successComponentNames: string[] = [];
            const failedComponents: string[] = [];
            const failedComponentsDueToMaxLimit: string[] = [];
            if (projectLocation !== undefined) {
                // Get local components
                const choreoPM = new ChoreoProjectManager();
                const localComponentMeta: WorkspaceComponentMetadata[] = choreoPM.getComponentMetadata(projectLocation);
                for (const componentMetadata of localComponentMeta) {
                    if (cancellationToken.isCancellationRequested) {
                        break;
                    }
                    if (componentNames.includes(componentMetadata.displayName)){
                        _progress.report({ message: `Uploading the ${componentMetadata.displayName} component from your local machine.` });
                        try {
                            if (componentMetadata.displayType.toString().startsWith("byoc")) {
                                await this._createByoComponent(componentMetadata);
                            } else {
                                await this._createComponent(componentMetadata);
                            }
                            choreoPM.removeLocalComponent(projectLocation, componentMetadata);
                            successComponentNames.push(componentMetadata.displayName);
                        } catch (error: any) {
                            if (error.cause?.response?.metadata?.additionalData === "REACHED_MAXIMUM_NUMBER_OF_FREE_COMPONENTS") {
                                const errorMsg: string = `Failed to push ${componentMetadata.displayName} to Choreo.`;
                                failedComponentsDueToMaxLimit.push(componentMetadata.displayName);
                            } else {
                                const errorMsg: string = `Failed to push ${componentMetadata.displayName} to Choreo.`;
                                getLogger().error(errorMsg + " " + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
                                failedComponents.push(componentMetadata.displayName);
                            }
                            
                        }
                    }
                    _progress.report({ increment: 100 / localComponentMeta.length });
                }
                if (failedComponents.length > 0 || failedComponentsDueToMaxLimit.length > 0) {
                    let errorMessage = `Failed to push components: `;
                    if (failedComponents.length > 0 ){
                        errorMessage += `(${failedComponents.join(',')}) `;
                    }
                    if (failedComponentsDueToMaxLimit.length > 0 ){
                        errorMessage += `(${failedComponentsDueToMaxLimit.join(',')}) Due to reaching maximum number of components`;
                    }
                    if (failedComponentsDueToMaxLimit.length > 0) {
                        window.showErrorMessage(errorMessage, "Upgrade").then(selection => {
                            if (selection === 'Upgrade') {
                                this.openBillingPortal(org.uuid);
                            }
                        });
                    } else {
                        window.showErrorMessage(errorMessage);
                    }
                }
            }
            return successComponentNames;
        });
    }

    getConsoleUrl() {
        return getConsoleUrl();
    }

    async fetchComponentsFromCache(projectId: string, orgId: number, orgHandle: string, orgUuid: string): Promise<Component[] | undefined> {
        try {
            if (!this._dataComponents.has(projectId)) {
                const components = await this.getComponents(projectId, orgId, orgHandle, orgUuid);
                return components;
            }
            return this._dataComponents.get(projectId);
        } catch (e) {
            serializeError(e);
            throw new Error("Failed to fetch components from cache");
        }
    }

    private async _createComponent(componentMetadata: WorkspaceComponentMetadata): Promise<void> {
        const { appSubPath, branchApp, nameApp, orgApp, gitProvider, bitbucketCredentialId } = componentMetadata.repository;
        // set srcgitRepoUrl depending on the git provider
        let srcGitRepoUrl = `https://github.com/${orgApp}/${nameApp}/tree/${branchApp}/${appSubPath}`;
        switch (gitProvider) {
            case GitProvider.BITBUCKET:
                srcGitRepoUrl = `https://bitbucket.org/${orgApp}/${nameApp}/src/${branchApp}/${appSubPath}`;
                break;
        }

        const componentRequest: CreateComponentParams = {
            name: makeURLSafe(componentMetadata.displayName),
            displayName: componentMetadata.displayName,
            displayType: componentMetadata.displayType.toString(),
            description: componentMetadata.description,
            orgId: componentMetadata.org.id,
            orgHandle: componentMetadata.org.handle,
            projectId: componentMetadata.projectId,
            accessibility: componentMetadata.accessibility ?? "",
            srcGitRepoUrl: srcGitRepoUrl,
            repositorySubPath: appSubPath,
            repositoryType: "UserManagedNonEmpty",
            repositoryBranch: branchApp,
            bitbucketCredentialId: bitbucketCredentialId
        };
        await executeWithTaskRetryPrompt(() => ext.clients.projectClient.createComponent(componentRequest));
    }

    private async _createByoComponent(componentMetadata: WorkspaceComponentMetadata): Promise<void> {
        if (componentMetadata.byocConfig === undefined && componentMetadata.byocWebAppsConfig === undefined) {
            throw new Error("BYOC config is undefined");
        }
        const componentRequest: CreateByocComponentParams = {
            name: makeURLSafe(componentMetadata.displayName),
            displayName: componentMetadata.displayName,
            componentType: componentMetadata.displayType.toString(),
            description: componentMetadata.description,
            orgId: componentMetadata.org.id,
            orgHandle: componentMetadata.org.handle,
            projectId: componentMetadata.projectId,
            accessibility: componentMetadata.accessibility ?? "",
            labels: "",
            oasFilePath: "",
        };
        if(componentMetadata.displayType.toString() === ComponentDisplayType.ByocWebAppDockerLess && componentMetadata.byocWebAppsConfig){
            componentRequest.byocWebAppsConfig = componentMetadata.byocWebAppsConfig;
            await executeWithTaskRetryPrompt(() => ext.clients.projectClient.createWebAppByocComponent(componentRequest));
        } else if (componentMetadata.byocConfig) {
            componentRequest.byocConfig = componentMetadata.byocConfig;
            if (componentMetadata.port) {
                componentRequest.port = componentMetadata.port;
            }
            await executeWithTaskRetryPrompt(() => ext.clients.projectClient.createByocComponent(componentRequest));
        }
    }

    async pushLocalComponentToChoreo(projectId: string, componentName: string, org: Organization): Promise<void> {
        const choreoPM = new ChoreoProjectManager();
        const projectLocation: string | undefined = this.getProjectLocation(projectId);
        if (projectLocation !== undefined) {
            const localComponentMeta: WorkspaceComponentMetadata[] = choreoPM.getComponentMetadata(projectLocation);
            const componentMetadata = localComponentMeta?.find(component => component.displayName === componentName);
            if (componentMetadata) {
                try {
                    if (componentMetadata.displayType.toString().startsWith("byoc")) {
                        await this._createByoComponent(componentMetadata);
                    } else {
                        await this._createComponent(componentMetadata);
                    }
                    choreoPM.removeLocalComponent(projectLocation, componentMetadata);
                    vscode.window.showInformationMessage(`The component ${componentMetadata.displayName} has been successfully pushed to Choreo.`);
                } catch (error: any) {
                    if (error.cause?.response?.metadata?.additionalData === "REACHED_MAXIMUM_NUMBER_OF_FREE_COMPONENTS") {
                        const errorMessage = `Failed to push ${componentMetadata.displayName} to Choreo due to reaching maximum number of components`;
                        window.showErrorMessage(errorMessage, "Upgrade").then(selection => {
                            if (selection === 'Upgrade') {
                                this.openBillingPortal(org.uuid);
                            }
                        });
                        throw new Error(errorMessage);
                    } else {
                        const errorMessage = `Failed to push ${componentMetadata.displayName} to Choreo. ${error?.message}`;
                        getLogger().error(`Failed to push ${componentMetadata.displayName} to Choreo. ${error?.message} ${error?.cause ? "\nCause: " + error.cause.message : ""}`);
                        window.showErrorMessage(errorMessage);
                        throw new Error(errorMessage);
                    }
                }
            }
        }
    }

    async hasDirtyLocalRepo(projectId: string, component: Component): Promise<boolean> {
        const projectLocation: string | undefined = this.getProjectLocation(projectId);
        if (projectLocation && component.repository) {
            const { nameApp, organizationApp, appSubPath } = component.repository;

            const git = await initGit(ext.context);
            if (git) {
                const repoPath = join(dirname(projectLocation), 'repos', organizationApp, nameApp);
                const gitRepo = git.open(repoPath, { path: repoPath });
                const status = await executeWithTaskRetryPrompt(() => gitRepo.getStatus({ untrackedChanges: 'separate', subDirectory: appSubPath }));
                return status.statusLength > 0;
            }
            return false;
        } else {
            return false;
        }
    }

    async hasUnPushedLocalCommit(projectId: string, component: Component): Promise<boolean> {
        const projectLocation: string | undefined = this.getProjectLocation(projectId);
        if (projectLocation && component.repository) {
            const { nameApp, organizationApp, appSubPath } = component.repository;

            const git = await initGit(ext.context);
            if (git) {
                const repoPath = join(dirname(projectLocation), 'repos', organizationApp, nameApp);
                const commits = await executeWithTaskRetryPrompt(() => git.getUnPushedCommits(repoPath, appSubPath || "."));
                return commits.length > 0;
            }
            return false;
        } else {
            return false;
        }
    }

    public isSubpathAvailable(projectId: string, orgName: string, repoName: string, subPath: string): boolean {
        const projectLocation = this.getProjectLocation(projectId);
        if (projectLocation && orgName && repoName && subPath) {
            const repoPath = join(dirname(projectLocation), "repos", orgName, repoName, subPath);
            return !existsSync(repoPath);
        }
        // TODO Handle subpath check for non cloned repos
        return true;
    }


    public readEndpointsYaml(projectId: string, orgName: string, repoName: string, subPath: string): Endpoint | undefined {
        const projectLocation = this.getProjectLocation(projectId);
        if (projectLocation && orgName && repoName && subPath) {
            const endpointsYamlPath = join(dirname(projectLocation), "repos", orgName, repoName, subPath, '.choreo', 'endpoints.yaml');
            if (existsSync(endpointsYamlPath)) {
                const endpointsConfig: any = yaml.load(readFileSync(endpointsYamlPath, 'utf8'));
                return endpointsConfig?.endpoints?.[0];
            }
        }
    }

    public openBillingPortal(orgId: string): void {
        const billingLink = `${choreoEnvConfig.getBillingUrl()}/cloud/choreo/upgrade?orgId=${orgId}`;
        vscode.commands.executeCommand('vscode.open', billingLink);
    }

    public getLocalComponentDirMetaData(params: getLocalComponentDirMetaDataRequest): getLocalComponentDirMetaDataRes {
        // instead of calling getRepoMetadata api and checking remote directory is valid
        // this will check those values from local directory

        const { projectId, orgName, repoName, subPath, dockerContextPath, dockerFilePath } = params;
    
        const projectLocation = this.getProjectLocation(projectId);
        if(!projectLocation){
            throw new Error('Project location is not found in order to get local component metadata');
        }

        const repoPath = join(dirname(projectLocation), "repos", orgName, repoName);
        const isRepoPathAvailable = existsSync(repoPath);
        const isBareRepo = readdirSync(repoPath).length === 0;

        let isSubPathValid = false;
        if(subPath){
            isSubPathValid = existsSync(join(repoPath, subPath));
        }

        let isSubPathEmpty = true;
        if(isSubPathValid){
            const subFolderFiles = readdirSync(join(repoPath, subPath));
            isSubPathEmpty = subFolderFiles.filter(file=>{
                const filePath = join(repoPath, subPath, file);
                const fileStats = statSync(filePath);
                return fileStats.isFile() && !file.startsWith('.');
            }).length === 0;
        }

        let hasBallerinaTomlInPath = false;
        if(subPath && isSubPathValid) {
            hasBallerinaTomlInPath = existsSync(join(repoPath, subPath, 'Ballerina.toml'));
        } else{
            hasBallerinaTomlInPath = existsSync(join(repoPath, 'Ballerina.toml'));
        }

        let hasBallerinaTomlInRoot = existsSync(join(repoPath, 'Ballerina.toml'));

        let hasEndpointsYaml = false;
        let endpointsYamlPath = join(repoPath, '.choreo', 'endpoints.yaml');
        if(dockerContextPath){
            endpointsYamlPath = join(repoPath, dockerContextPath, '.choreo', 'endpoints.yaml');
        }
        hasEndpointsYaml = existsSync(endpointsYamlPath);

        let dockerFilePathValid = false;
        if (dockerFilePath) {
            dockerFilePathValid = existsSync(join(repoPath, dockerFilePath));
        }

        let isDockerContextPathValid = false;
        if (dockerFilePath) {
            const dockerFileFullPath = join(repoPath, dockerFilePath);
            let dockerContextFullPath = dockerContextPath ? join(repoPath, dockerContextPath) :repoPath;
            const relativePath = relative(dockerContextFullPath, dockerFileFullPath);
            isDockerContextPathValid = !relativePath.startsWith('..') && !isAbsolute(relativePath);
        }

        return {
            isBareRepo,
            isRepoPathAvailable,
            isSubPathValid,
            isSubPathEmpty,
            hasBallerinaTomlInPath,
            hasBallerinaTomlInRoot,
            hasEndpointsYaml,
            dockerFilePathValid,
            isDockerContextPathValid
        };
    }

    private _removeLocation(projectId: string) {
        let projectLocations: Record<string, string> | undefined = ext.context.globalState.get(PROJECT_LOCATIONS);
        // If the locations are not set before create the location map
        if (projectLocations === undefined) {
            projectLocations = {};
        }
        delete projectLocations[projectId];
        ext.context.globalState.update(PROJECT_LOCATIONS, projectLocations);
    }

    private _addLocalComponents(projectId: string, components: Component[]): Component[] {
        const projectLocation: string | undefined = this.getProjectLocation(projectId);
        const mergedComponents = components;
        if (projectLocation !== undefined) {
            const localComponents = (new ChoreoProjectManager()).getLocalComponents(projectLocation);
            localComponents.forEach(item => {
                const alreadyExists = components.some(component => {
                    return component.local && component.name === item.name;
                });
                if (!alreadyExists) {
                    mergedComponents.push(item);
                }
            });
        }

        return mergedComponents;
    }

    private _removeComponentFromWorkspace(componentName: string, workspaceFilePath: string) {
        const contents = readFileSync(workspaceFilePath);
        const content: WorkspaceConfig = JSON.parse(contents.toString());
        const updatedContent: WorkspaceConfig = {
            ...content,
            folders: content.folders?.filter((item) => item.name !== componentName),
        };
        writeFileSync(workspaceFilePath, JSON.stringify(updatedContent, null, 4));
    }
}
