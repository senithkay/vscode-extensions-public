/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { IProjectManager, serializeError } from "@wso2-enterprise/choreo-core";
import { Messenger } from "vscode-messenger";
import { CloneRepoRequeset, CreateLocalBalComponentFromExistingSourceRequest, CreateLocalComponentRequest, GetBallerinaVersion, GetProjectDetails, GetProjectRoot, GetRepoPathRequest, IsComponentNameAvailableRequest, IsRepoClonedRequest } from "./types";

export function registerChoreoProjectManagerRPCHandlers(messenger: Messenger, manager: IProjectManager) {
    messenger.onRequest(CreateLocalComponentRequest, (params) => manager.createLocalComponent(params).catch(serializeError));
    messenger.onRequest(CreateLocalBalComponentFromExistingSourceRequest, (params) => manager.createLocalBalComponentFromExistingSource(params).catch(serializeError));
    messenger.onRequest(GetProjectRoot, () => manager.getProjectRoot().catch(serializeError));
    messenger.onRequest(GetProjectDetails, () => manager.getProjectDetails().catch(serializeError));
    messenger.onRequest(IsRepoClonedRequest, (params) => manager.isRepoCloned(params).catch(serializeError));
    messenger.onRequest(IsComponentNameAvailableRequest, (cmpName) => manager.isComponentNameAvailable(cmpName));
    messenger.onRequest(GetRepoPathRequest, (repo) => manager.getRepoPath(repo));
    messenger.onRequest(CloneRepoRequeset, (params) => manager.cloneRepo(params).catch(serializeError));
    messenger.onRequest(GetBallerinaVersion, () => manager.getBalVersion().catch(serializeError));
}
