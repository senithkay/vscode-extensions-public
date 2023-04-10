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

import { randomUUID } from "crypto";
import { join } from "path";
import {
    AccessToken, ChoreoTokenType, ComponentMutationParams, CreateByocComponentParams, CreateProjectParams, DeleteComponentParams, GetComponentsParams, GetComponentDeploymentStatusParams,
    GetProjectsParams, GitHubRepoValidationRequestParams, GitHubRepoValidationResponse, IAuthClient, IChoreoOrgClient, IChoreoProjectClient, ITokenStorage, LinkRepoMutationParams, GetComponentBuildStatusParams
} from "@wso2-enterprise/choreo-client";
import { BuildStatus, Component, Deployment, Organization, Project, Repository, UserInfo } from "@wso2-enterprise/choreo-core";
import { ProjectRegistry } from "../../../registry/project-registry";
import { ALL_COMPONENTS, FOO_OWNER_ORGS, FOO_OWNER_PROJECTS, FOO_PROJECT_1, FOO_PROJECT_2, FOO_USER, TOKEN_EXPIRATION_TIME } from "./mocked-data";
import { TEST_PROJECT_NAME } from "../project-based-tests/choreo-project.test";

export class MockAuthClient implements IAuthClient {
    async exchangeAuthCode(_authCode: string): Promise<AccessToken> {
        return this.generateMockToken();
    }
    async exchangeApimToken(_choreoAccessToken: string, _orgHandle: string): Promise<AccessToken> {
        return this.generateMockToken();
    }
    async exchangeVSCodeToken(_apiAccessToken: string): Promise<AccessToken> {
        return this.generateMockToken();
    }
    async exchangeRefreshToken(_refreshToken: string): Promise<AccessToken> {
        return this.generateMockToken();
    }

    getAuthURL(): string {
        throw new Error("Method getAuthURl not implemented.");
    }

    private generateMockToken(): AccessToken {
        return {
            accessToken: randomUUID(),
            loginTime: new Date().toISOString(),
            refreshToken: randomUUID(),
            expirationTime: TOKEN_EXPIRATION_TIME
        };
    }
}

export class MockKeyChainTokenStorage implements ITokenStorage {
    private _choreoLoginTime: string = new Date().toISOString();

    async setToken(tokenType: ChoreoTokenType, _token: AccessToken): Promise<void> {
        console.log(`Set ${tokenType} token.`);
    }
    async deleteToken(tokenType: ChoreoTokenType): Promise<void> {
        console.log(`Deleted ${tokenType} token.`);
    }
    async getToken(_tokenType: ChoreoTokenType): Promise<AccessToken | undefined> {
        return {
            accessToken: randomUUID(),
            loginTime: this._choreoLoginTime,
            refreshToken: randomUUID(),
            expirationTime: 3600
        };
    }
}

export class MockOrgClient implements IChoreoOrgClient {
    async getOrganizations(): Promise<Organization[]> {
        return FOO_OWNER_ORGS;
    }
    async getUserInfo(): Promise<UserInfo> {
        return FOO_USER;
    }
}

export class MockProjectClient implements IChoreoProjectClient {
    createByocComponent(params: CreateByocComponentParams): Promise<Component> {
        throw new Error("Method not implemented.");
    }
    
    getRepoMetadata(params: GitHubRepoValidationRequestParams): Promise<GitHubRepoValidationResponse> {
        throw new Error("Method not implemented.");
    }
    async getProjects(params: GetProjectsParams): Promise<Project[]> {
        // To mock a successfully cloned environment
        setProjectLocation();

        const userProjects: Project[] = FOO_OWNER_PROJECTS;
        return userProjects.filter(project => project.orgId === params.orgId.toString());
    }
    async getComponents(params: GetComponentsParams): Promise<Component[]> {
        const allComponents: Component[] = ALL_COMPONENTS;
        const projectComponents: Component[] = allComponents.filter(component =>
            component.projectId === params.projId && component.orgHandler === params.orgHandle);
        return projectComponents;
    }
    getComponentDeploymentStatus(params: GetComponentDeploymentStatusParams): Promise<Deployment | null> {
        throw new Error("Method not implemented.");
    }
    getComponentBuildStatus(params: GetComponentBuildStatusParams): Promise<BuildStatus | null> {
        throw new Error("Method not implemented.");
    }
    createProject(params: CreateProjectParams): Promise<Project> {
        throw new Error("Method not implemented.");
    }
    createComponent(params: ComponentMutationParams): Promise<Component> {
        throw new Error("Method not implemented.");
    }
    linkRepo(params: LinkRepoMutationParams): Promise<Repository> {
        throw new Error("Method not implemented.");
    }
    getDiagramModel(params: GetComponentsParams): Promise<Component[]> {
        throw new Error("Method not implemented.");
    }
    deleteComponent(params: DeleteComponentParams): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

function setProjectLocation() {
    const projectRoot = join(__dirname, '..', '..', '..', '..', 'src', 'test', 'data', TEST_PROJECT_NAME);
    ProjectRegistry.getInstance().setProjectLocation(TEST_PROJECT_NAME === 'FooProject2' ? FOO_PROJECT_2.id : FOO_PROJECT_1.id,
        join(projectRoot, `${TEST_PROJECT_NAME}.code-workspace`));
}
