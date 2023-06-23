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

import { componentManagementClient, projectClient, subscriptionClient } from "../auth/auth";
import { BYOCRepositoryDetails, ChoreoComponentCreationParams, Component, ComponentCount, Environment, getLocalComponentDirMetaDataRes, getLocalComponentDirMetaDataRequest, Organization, Project, PushedComponent, serializeError, WorkspaceComponentMetadata, ChoreoServiceType, ComponentDisplayType } from "@wso2-enterprise/choreo-core";
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
import { makeURLSafe } from "../utils";

// Key to store the project locations in the global state
const PROJECT_LOCATIONS = "project-locations";
const PROJECT_REPOSITORIES = "project-repositories";
const PREFERRED_PROJECT_REPOSITORIES = "preferred-project-repositories";


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

    // Adding a refersh method to refresh the data.
    // Currently refresh is handled by clearing the registry
    // and firing refresh on tree view.
    // But tree view refresh API does not support async.
    // Hence there's no way to know when the refresh is completed.
    // We cannot remove tree view refresh either because if we depend
    // on the registry to refresh the tree view, we will end up in a
    // situation where the tree view is stuck until the registry refresh
    // is completed without showing any loader animation.
    // We will use this refresh method from every other places and keep
    // the tree view refresh as it is just to be used for the tree view.
    async refreshProjects(): Promise<Project[] | undefined> {
        await this.clean();
        const selectedOrg = ext.api.selectedOrg;
        if (selectedOrg) {
            return this.getProjects(selectedOrg.id);
        }
    }

    async getProject(projectId: string, orgId: number): Promise<Project | undefined> {
        return this.getProjects(orgId).then(async (projects: Project[]) => {
            return projects.find((project: Project) => project.id === projectId);
        });
    }

    async getProjects(orgId: number): Promise<Project[]> {
        if (!this._dataProjects.has(orgId) && ext.api.status === "LoggedIn") {
            try {
                const projects: Project[] = await executeWithTaskRetryPrompt(() => projectClient.getProjects({ orgId: orgId }));
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

    async checkProjectDeleted(projectId: string, orgId: number): Promise<boolean> {
        const projects: Project[] = await executeWithTaskRetryPrompt(() => projectClient.getProjects({ orgId: orgId }));
        const project = projects.find((project: Project) => project.id === projectId);

        if (project === undefined) {
            return false;
        }

        return true;
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
        if(projectLocation){
            const projectDir = dirname(projectLocation);
            let basePath = join(projectDir, "repos", org, repo);
            if(dockerContext){
                basePath = join(basePath, dockerContext);
            }
            const schemaFilePath = openApiFilePath && dockerContext ? relative(dockerContext, openApiFilePath) : openApiFilePath || 'openapi.yaml';
            const endpointsYamlPath = join(basePath, '.choreo', 'endpoints.yaml');
    
            if (!existsSync(endpointsYamlPath)) { 
                let endpointsYamlContent = readFileSync(join(ext.context.extensionPath, "/templates/endpoints-template.yaml")).toString();
                endpointsYamlContent = endpointsYamlContent.replace('ENDPOINT_NAME',args.name);
                endpointsYamlContent = endpointsYamlContent.replace('PORT',args.port ? args.port.toString() : '3000');
                endpointsYamlContent = endpointsYamlContent.replace('TYPE',args.serviceType? args.serviceType?.toString() : "REST");
                endpointsYamlContent = endpointsYamlContent.replace('NETWORK_VISIBILITY',args.accessibility === 'external' ? 'Public' : 'Project');
    
                if(args.serviceType === ChoreoServiceType.RestApi){
                    endpointsYamlContent = endpointsYamlContent.replace('SCHEMA_PATH',schemaFilePath);
    
                    const openApiPath = join(basePath, schemaFilePath);
                    if (!existsSync(openApiPath)) {
                        cpSync(join(ext.context.extensionPath, "/templates/openapi-template.yaml"),  join(basePath,schemaFilePath));
                    }
                }else{
                    endpointsYamlContent = endpointsYamlContent.replace('schemaFilePath: SCHEMA_PATH', '# schemaFilePath: endpoints.yaml');
                }
    
                const choreoDirPath = dirname(endpointsYamlPath);
                if(!existsSync(choreoDirPath)){
                    mkdirSync(choreoDirPath);
                }
                writeFileSync(endpointsYamlPath, endpointsYamlContent);
            }
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

    async getComponents(projectId: string, orgHandle: string, orgUuid: string): Promise<Component[]> {
        try {
            const previousComponents = this._dataComponents.get(projectId) || [];
            let components = await executeWithTaskRetryPrompt(() => projectClient.getComponents({ projId: projectId, orgHandle: orgHandle, orgUuid }));
            components = this._addLocalComponents(projectId, components);
            components = components.map(component => {
                const matchingComponent = previousComponents.find(item => {
                    if (component.local && component.name === item.name) {
                        return true;
                    }
                    if (!component.local && component.id === item.id) {
                        return true;
                    }
                    return false;
                });
                return {
                    ...component,
                    hasUnPushedLocalCommits: matchingComponent?.hasUnPushedLocalCommits,
                    hasDirtyLocalRepo: matchingComponent?.hasDirtyLocalRepo,
                    isRemoteOnly: matchingComponent?.isRemoteOnly,
                    isInRemoteRepo: matchingComponent?.isInRemoteRepo,
                    deployments: matchingComponent?.deployments,
                    buildStatus: matchingComponent?.buildStatus,
                };
            });

            this._dataComponents.set(projectId, components);

            return components;
        } catch (error: any) {
            const errorMetadata = error?.cause?.response?.metadata;
            getLogger().error("Error while fetching components. "+ error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
            throw new Error("Failed to fetch component list. "  + errorMetadata?.errorCode || error?.message);
        }
    }

    async getDeletedComponents(projectId: string, orgHandle: string, orgUuid: string): Promise<PushedComponent[]> {
        const projectLocation = this.getProjectLocation(projectId);
        const dataComponents = await executeWithTaskRetryPrompt(() => projectClient.getComponents({ projId: projectId, orgHandle: orgHandle, orgUuid }));
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
                    this._removeComponentFromWorkspace(repoPath);
                }
            });
        }

        const successMsg = " Please commit & push your local changes changes to ensure consistency with the remote repository.";
        vscode.window.showInformationMessage(successMsg);
    }

    private async isComponentInRepo(component: Component): Promise<boolean> {
        let isInRemoteRepo = true;
        if (component.local && component.repository) {
            const { appSubPath, branchApp, nameApp, organizationApp } = component.repository;
            try {
                isInRemoteRepo = await executeWithTaskRetryPrompt(() => projectClient.isComponentInRepo({
                    branchApp: branchApp,
                    orgApp: organizationApp,
                    repoApp: nameApp,
                    subPath: appSubPath || ""
                }));
            } catch (error: any) {
                getLogger().error(`Failed to check isComponentInRepo for ${component.name}. ` + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
                isInRemoteRepo = false;
            }
        }
        return isInRemoteRepo;
    }

    async getEnrichedComponents(projectId: string, orgHandle: string, orgUuid: string): Promise<Component[]> {
        try {
            const componentsCache = this._dataComponents.get(projectId) || [];
            const components = this._addLocalComponents(projectId, componentsCache);
            const openedProject = await ext.api.getChoreoProject();
            const isActive = projectId === openedProject?.id;

            let envData = this._projectEnvs.get(projectId);
            if (!envData) {
                envData = await executeWithTaskRetryPrompt(() => projectClient.getProjectEnv({ orgUuid, projId: projectId }));
                if (envData) {
                    this._projectEnvs.set(projectId, envData);
                }
            }

            const devEnv = envData?.find((env: Environment) => env.name === 'Development');

            const enrichedComponents: Component[] = await Promise.all(
                components.map(async (component) => {
                    const selectedVersion = component.apiVersions?.find(item => item.latest);
                    const [hasUnPushedLocalCommits, hasDirtyLocalRepo, devDeployment, isInRemoteRepo, buildStatus] = await Promise.all([
                        isActive && this.hasUnPushedLocalCommit(projectId, component),
                        isActive && this.hasDirtyLocalRepo(projectId, component),
                        !component.local && selectedVersion && devEnv && executeWithTaskRetryPrompt(() => projectClient.getComponentDeploymentStatus({
                            component,
                            envId: devEnv?.id,
                            orgHandle,
                            orgUuid,
                            projId: projectId,
                            versionId: selectedVersion.id
                        })),
                        component.local && isActive && this.isComponentInRepo(component),
                        !component.local && selectedVersion && executeWithTaskRetryPrompt(() => projectClient.getComponentBuildStatus({ componentId: component.id, versionId: selectedVersion.id }))
                    ]);

                    let isRemoteOnly = true;
                    if ((component.repository?.appSubPath || component.repository?.byocBuildConfig) && isActive) {
                        if (component.repository?.appSubPath) {
                            const { organizationApp, nameApp, appSubPath } = component.repository;
                            isRemoteOnly = this.isSubpathAvailable(projectId, organizationApp, nameApp, appSubPath);
                        } else if (component.repository?.byocWebAppBuildConfig) {
                            const { organizationApp, nameApp } = component.repository;
                            if (component.repository?.byocWebAppBuildConfig?.dockerContext) {
                                isRemoteOnly = this.isSubpathAvailable(projectId, organizationApp, nameApp, component.repository?.byocWebAppBuildConfig?.dockerContext);
                            } else if (component.repository?.byocWebAppBuildConfig?.outputDirectory) {
                                isRemoteOnly = this.isSubpathAvailable(projectId, organizationApp, nameApp, component.repository?.byocWebAppBuildConfig?.outputDirectory);
                            }
                        } else if (component.repository?.byocBuildConfig) {
                            const { organizationApp, nameApp } = component.repository;
                            isRemoteOnly = this.isSubpathAvailable(projectId, organizationApp, nameApp, component.repository?.byocBuildConfig?.dockerContext);
                        }
                    }

                    return {
                        ...component,
                        hasUnPushedLocalCommits,
                        hasDirtyLocalRepo,
                        isRemoteOnly,
                        isInRemoteRepo,
                        deployments: { dev: devDeployment },
                        buildStatus
                    } as Component;
                })
            );

            this._dataComponents.set(projectId, enrichedComponents);

            return enrichedComponents;
        } catch (error: any) {
            getLogger().error("Error while fetching components. "+ error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
            throw new Error("Failed to fetch the status of components. " + error?.message);
        }
    }

    async deleteComponent(component: Component, orgHandler: string, projectId: string): Promise<void> {
        try {
            await window.withProgress({
                title: `Deleting component ${component?.name}.`,
                location: ProgressLocation.Notification,
                cancellable: false
            }, async () => {
                let successMsg = "The component has been deleted successfully.";
                if (!component?.local && component.id) {
                    await projectClient.deleteComponent({ component, orgHandler, projectId });
                }

                const projectLocation = this.getProjectLocation(projectId);

                if (component.local) {
                    const choreoPM = new ChoreoProjectManager();
                    if (projectLocation) {
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
                                    this._removeComponentFromWorkspace(repoPath);
                                }
                            }
                            
                        }
                    }
                } else if (!component?.isRemoteOnly && component?.repository) {
                    const { organizationApp, nameApp } = component.repository;
                    const subPath = component.repository.appSubPath 
                        || component.repository.byocBuildConfig?.dockerContext 
                        || component.repository.byocWebAppBuildConfig?.dockerContext
                        || component.repository.byocWebAppBuildConfig?.outputDirectory;
                    if (projectLocation && subPath) {
                        const repoPath = join(dirname(projectLocation), "repos", organizationApp, nameApp, subPath);
                        if (existsSync(repoPath)) {
                            rmdirSync(repoPath, { recursive: true });
                            this._removeComponentFromWorkspace(repoPath);
                            successMsg += " Please commit & push your local changes changes to ensure consistency with the remote repository.";
                        }
                    }
                }
                vscode.window.showInformationMessage(successMsg);
            });
        } catch (error: any) {
            getLogger().error(`Failed to delete the component ${component?.name}. ` + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
        }
    }

    async pullComponent(componentId: string, projectId: string): Promise<void> {
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

            }
        } catch (error: any) {
            getLogger().error("Failed to pull the changes from the remote repository. " + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
        }
    }

    async getComponentCount(orgId: number): Promise<ComponentCount> {
        try {
            return componentManagementClient.getComponentCount(orgId);
        } catch (error: any) {
            getLogger().error("Failed to fetch the component count. " + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
            throw new Error("Failed to fetch the component count. " + error?.message);
        }
    }

    async hasChoreoSubscription(orgId: string): Promise<boolean> {
        try {
            const res = await subscriptionClient.getSubscriptions(orgId);
            const hasSubscription = res?.list?.some(item => item.subscriptionType === 'choreo-subscription');
            return hasSubscription;
        } catch (error: any) {
            getLogger().error("Failed to fetch subscription details. " + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
            throw new Error("Failed to fetch subscription details. " + error?.message);
        }
    }

    async getDiagramModel(projectId: string, orgHandle: string): Promise<Component[]> {
        return executeWithTaskRetryPrompt(() => projectClient.getDiagramModel({ projId: projectId, orgHandle: orgHandle }));
    }

    async getPerformanceForecast(data: string): Promise<AxiosResponse> {
        return executeWithTaskRetryPrompt(() => projectClient.getPerformanceForecastData(data));
    }

    async getSwaggerExamples(spec: any): Promise<AxiosResponse> {
        return projectClient.getSwaggerExamples(spec)
            .then((result: any) => {
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

    setProjectRepository(projectId: string, repository: string) {
        let projectRepositories: Record<string, string> | undefined = ext.context.globalState.get(PROJECT_REPOSITORIES);
        if (projectRepositories === undefined) {
            projectRepositories = {};
        }
        projectRepositories[projectId] = repository;
        ext.context.globalState.update(PROJECT_REPOSITORIES, projectRepositories);
    }

    getProjectRepository(projectId: string): string | undefined {
        const projectRepositories: Record<string, string> | undefined = ext.context.globalState.get(PROJECT_REPOSITORIES);
        return projectRepositories ? projectRepositories[projectId] : undefined;
    }

    setPreferredProjectRepository(projectId: string, repository: string) {
        let projectRepositories: Record<string, string> | undefined = ext.context.globalState.get(PREFERRED_PROJECT_REPOSITORIES);
        if (projectRepositories === undefined) {
            projectRepositories = {};
        }
        projectRepositories[projectId] = repository;
        ext.context.globalState.update(PREFERRED_PROJECT_REPOSITORIES, projectRepositories);
    }

    getPreferredProjectRepository(projectId: string): string | undefined {
        const projectRepositories: Record<string, string> | undefined = ext.context.globalState.get(PREFERRED_PROJECT_REPOSITORIES);
        let preferredRepository: string | undefined = projectRepositories ? projectRepositories[projectId] : undefined;
        if (preferredRepository === undefined) {
            preferredRepository = this.getProjectRepository(projectId);
        }
        return preferredRepository;
    }

    pushLocalComponentsToChoreo(projectId: string, org: Organization): Thenable<void> {
        return window.withProgress({
            title: `Pushing local components to Choreo`,
            location: ProgressLocation.Notification,
            cancellable: true
        }, async (_progress, cancellationToken) => {

            cancellationToken.onCancellationRequested(async () => {
                getLogger().debug("Pushing to Choreo cancelled for project: " + projectId);
            });

            const projectLocation: string | undefined = this.getProjectLocation(projectId);
            let failures: string = "";
            if (projectLocation !== undefined) {
                // Get local components
                const choreoPM = new ChoreoProjectManager();
                const localComponentMeta: WorkspaceComponentMetadata[] = choreoPM.getComponentMetadata(projectLocation);
                for (const componentMetadata of localComponentMeta) {
                    if (cancellationToken.isCancellationRequested) {
                        break;
                    }
                    _progress.report({ message: `Uploading the ${componentMetadata.displayName} component from your local machine.` });
                    try {
                        if (componentMetadata.displayType.toString().startsWith("byoc")) {
                            await this._createByoComponent(componentMetadata);
                        } else {
                            await this._createComponent(componentMetadata);
                        }
                        choreoPM.removeLocalComponent(projectLocation, componentMetadata);
                    } catch (error: any) {
                        const errorMsg: string = `Failed to push ${componentMetadata.displayName} to Choreo.`;
                        getLogger().error(errorMsg + " " + error?.message  + (error?.cause ? "\nCause: " + error.cause.message : ""));
                        failures = `${failures} ${errorMsg}`;
                    }
                    _progress.report({ increment: 100 / localComponentMeta.length });
                }
                if (failures !== "") {
                    getLogger().error(failures);
                    window.showErrorMessage(failures);
                }
            }
        });

    }

    async fetchComponentsFromCache(projectId: string, orgHandle: string, orgUuid: string): Promise<Component[] | undefined> {
        try {
            if (!this._dataComponents.get(projectId)?.length) {
                await this.getComponents(projectId, orgHandle, orgUuid);
            }
            return this._dataComponents.get(projectId);
        } catch (e) {
            serializeError(e);
            throw new Error("Failed to fetch components from cache");
        }
    }

    private async _createComponent(componentMetadata: WorkspaceComponentMetadata): Promise<void> {
        const { appSubPath, branchApp, nameApp, orgApp } = componentMetadata.repository;
        const componentRequest: CreateComponentParams = {
            name: makeURLSafe(componentMetadata.displayName),
            displayName: componentMetadata.displayName,
            displayType: componentMetadata.displayType.toString(),
            description: componentMetadata.description,
            orgId: componentMetadata.org.id,
            orgHandle: componentMetadata.org.handle,
            projectId: componentMetadata.projectId,
            accessibility: componentMetadata.accessibility,
            srcGitRepoUrl: `https://github.com/${orgApp}/${nameApp}/tree/${branchApp}/${appSubPath}`,
            repositorySubPath: appSubPath,
            repositoryType: "UserManagedNonEmpty",
            repositoryBranch: branchApp
        };
        await executeWithTaskRetryPrompt(() => projectClient.createComponent(componentRequest));
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
            orgHandler: componentMetadata.org.handle,
            projectId: componentMetadata.projectId,
            accessibility: componentMetadata.accessibility,
            labels: "",
            oasFilePath: "",
        };
        if(componentMetadata.displayType.toString() === ComponentDisplayType.ByocWebAppDockerLess && componentMetadata.byocWebAppsConfig){
            componentRequest.byocWebAppsConfig = componentMetadata.byocWebAppsConfig;
            await executeWithTaskRetryPrompt(() => projectClient.createWebAppByocComponent(componentRequest));
        } else if (componentMetadata.byocConfig) {
            componentRequest.byocConfig = componentMetadata.byocConfig;
            if (componentMetadata.port) {
                componentRequest.port = componentMetadata.port;
            }
            await executeWithTaskRetryPrompt(() => projectClient.createByocComponent(componentRequest));
        }
    }

    async pushLocalComponentToChoreo(projectId: string, componentName: string): Promise<void> {
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
                    getLogger().error(`Failed to push ${componentMetadata.displayName} to Choreo. ${error?.message} ${error?.cause ? "\nCause: " + error.cause.message : ""}`);
                    throw new Error(`Failed to push ${componentMetadata.displayName} to Choreo. ${error?.message}`);
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

    public getLocalComponentDirMetaData(params: getLocalComponentDirMetaDataRequest): getLocalComponentDirMetaDataRes {
        // instead of calling getRepoMetadata api and checking remote directory is valid
        // this will check those values from local directory

        const {projectId, orgName, repoName, subPath, dockerContextPath, dockerFilePath, openApiFilePath} = params;
    
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

    private _removeComponentFromWorkspace(componentPath: string) {
        const folder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(Uri.file(componentPath));
        if (folder) {
            const didDelete = workspace.updateWorkspaceFolders(folder.index, 1);
            if (didDelete) {
                return;
            }
        }
        window.showErrorMessage("Error: Could not update project workspace.");
    }
}
