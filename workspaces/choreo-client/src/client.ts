/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Component, Organization, Project, Repository } from "@wso2-enterprise/choreo-core";
import { ComponentMutationParams, IChoreoClient, LinkRepoMutationParams, ProjectMutationParams } from "./types";

export class ChoreoClient implements IChoreoClient {

    getOrganizations(): Promise<Error | Organization[]> {
        throw new Error("Method not implemented."); // TODO: Kavith
    }
    getProjects(_org: Organization): Promise<Error | Project[]> {
        throw new Error("Method not implemented."); // TODO: Kavith
    }
    getComponents(_proj: Project): Promise<Error | Component[]> {
        throw new Error("Method not implemented."); // TODO: Joe
    }
    createProject(_params: ProjectMutationParams): Promise<Error | Project[]> {
        throw new Error("Method not implemented."); // TODO: Kavith
    }
    createComponent(_params: ComponentMutationParams): Promise<Error | Component> {
        throw new Error("Method not implemented."); // TODO: Summaya
    }
    linkRepo(_params: LinkRepoMutationParams): Promise<Error | Repository> {
        throw new Error("Method not implemented."); // TODO: Kavith
    }
}