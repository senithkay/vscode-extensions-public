/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { GitProvider } from "@wso2-enterprise/choreo-core";
import { Event } from "vscode";

export interface GHAppConfig {
    appUrl: string;
    installUrl: string;
    authUrl: string;
    clientId: string;
    redirectUrl: string;
}

export interface IChoreoGithubAppClient {
    checkAuthStatus(): Promise<void>;
    status: Promise<GHAppAuthStatus>;
    triggerAuthFlow(): Promise<boolean>;
    obatainAccessToken(authCode: string, choreoOrgId: number): Promise<void>;
    triggerInstallFlow(): Promise<boolean>;
    getAuthorizedRepositories(choreoOrgId: number): Promise<GithubOrgnization[]>;
    getRepoBranches(choreoOrgId: number, orgName: string, repoName: string, bitbucketCredentialId: string): Promise<string[]>;
    onGHAppAuthCallback: Event<GHAppAuthStatus>;
    fireGHAppAuthCallback(status: GHAppAuthStatus): void;
    getCredentials(org_uuid: string, orgId: number): Promise<CredentialData[]>;
    getUserRepos(bitbucketCredentialId: string, choreoOrgId: number): Promise<UserRepo[]>;
}

export type GHAppAuthStatus = {
    status: 'auth-inprogress' | 'install-inprogress' | 'authorized' | 'installed' | 'not-authorized' | 'error';
    authCode?: string;
    installationId?: string;
    error?: string;
};

export interface GithubRepository {
    name: string;
}

export interface GithubOrgnization {
    orgName: string;
    repositories: GithubRepository[];
}

export interface CredentialData {
    id: string;
    createdAt: Date;
    name: string;
    organizationUuid: string;
    type: GitProvider;
    reference_token: string;
}

export interface FilteredCredentialData {
    id: string;
    name: string;
}

export interface Repo {
    name: string;
}

export interface UserRepo {
    orgName: string;
    repositories: Repo[];
}
