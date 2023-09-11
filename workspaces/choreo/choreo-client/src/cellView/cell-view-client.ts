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
import { IChoreoCellViewClient } from "./types";
import { CMService } from "@wso2-enterprise/ballerina-languageclient";
import { workspace } from "vscode";
import { existsSync, readFileSync } from "fs";
import {
    ComponentDisplayType,
    Connection,
    Endpoint,
    Organization,
    ServiceTypes
} from "@wso2-enterprise/choreo-core";
import * as path from "path";
import { ChoreoProjectClient } from "../project";
import * as yaml from 'js-yaml';
import { CHOREO_CONFIG_DIR,
    COMPONENTS_FILE,
    ENDPOINTS_FILE,
    getComponentDirPath,
    getConnectionModels,
    getDefaultComponentModel,
    getDefaultProjectModel,
    getDefaultServiceModel,
    getServiceModels,
    jobComponents,
    serviceComponents,
    webAppComponents
} from "./utils";

export class ChoreoCellViewClient implements IChoreoCellViewClient {

    constructor(private _projectClient: ChoreoProjectClient) {
    }

    async getProjectModel(organization: Organization, projectId: string) {

        const workspaceFile = workspace.workspaceFile;
        if (!workspaceFile) {
            throw new Error("Workspace file not found");
        }

        const project = (await this._projectClient.getProjects(
            {orgId: organization.id, orgHandle: organization.handle}
        )).find(project => project.id === projectId);

        if (!project) {
            throw new Error(`Project with id ${projectId} not found under organization ${organization.name}`);
        }

        const projectModel = getDefaultProjectModel(projectId, project.name);
        const workspaceFileLocation = workspaceFile.fsPath;

        if (!workspaceFileLocation) {
            throw new Error("Workspace file location not found");
        }
            
        const { id: orgId, handle: orgHandle, uuid: orgUuid, name: orgName  } = organization;

        const choreoComponents = await this._projectClient.getComponents(
            {projId: projectId, orgId, orgHandle, orgUuid}
        );

        choreoComponents?.forEach((component) => {
            const defaultComponentModel = getDefaultComponentModel(component, organization);
            const componentPath = getComponentDirPath(component, workspaceFileLocation);

            if (!componentPath) {
                throw new Error(`Component path not found for component ${component.name}`);
            }

            const displayType = component.displayType as ComponentDisplayType;
            if (serviceComponents.includes(displayType)) {
                const yamlPath = path.join(componentPath, CHOREO_CONFIG_DIR, COMPONENTS_FILE)
                    || path.join(componentPath, CHOREO_CONFIG_DIR, ENDPOINTS_FILE);

                if (existsSync(yamlPath)) {
                    const endpointsContent = yaml.load(readFileSync(yamlPath, "utf8"));
                    const endpoints: Endpoint[] = (endpointsContent as any).endpoints;
                    const connections: Connection[] = (endpointsContent as any).connections;

                    const serviceModels = getServiceModels(endpoints, orgName, project.name, component.name,
                        componentPath, yamlPath);
                    const servicesRecord: Record<string, CMService> = {};
                    serviceModels.forEach(service => {
                        servicesRecord[service.id] = service;
                    });
                    defaultComponentModel.services = servicesRecord as any;
                    defaultComponentModel.connections = getConnectionModels(connections);
                }
            } else if (webAppComponents.includes(displayType)) {
                const service: CMService = {
                    ...getDefaultServiceModel(),
                    type: ServiceTypes.WEBAPP,
                    deploymentMetadata: {
                        gateways: {
                            internet: { isExposed: true },
                            intranet: { isExposed: false }
                        }
                    },
                };
                defaultComponentModel.services = {[component.name]: service} as any;
            } else if (jobComponents.includes(displayType)) {
                defaultComponentModel.functionEntryPoint = {
                    id: 'main',
                    label: component.name,
                    annotation: { id: component.name, label: "" },
                    type: component.displayType === ComponentDisplayType.ByocJob ? "manualTrigger" : "scheduledTask",
                    dependencies: [],
                    interactions: [],
                    parameters: [],
                    returns: []
                }
            }
            projectModel.components.push(defaultComponentModel);
        });

        return projectModel;
    }
}
