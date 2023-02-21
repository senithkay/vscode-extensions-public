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
import { IProjectManager, serializeError } from "@wso2-enterprise/choreo-core";
import { Messenger } from "vscode-messenger";
import { CreateLocalComponentRequest, GetProjectDetails, GetProjectRoot, IsRepoClonedRequest } from "./types";

export function registerChoreoProjectManagerRPCHandlers(messenger: Messenger, manager: IProjectManager) {
    messenger.onRequest(CreateLocalComponentRequest, (params) => manager.createLocalComponent(params).catch(serializeError));
    messenger.onRequest(GetProjectRoot, () => manager.getProjectRoot().catch(serializeError));
    messenger.onRequest(GetProjectDetails, () => manager.getProjectDetails().catch(serializeError));
    messenger.onRequest(IsRepoClonedRequest, (params) => manager.isRepoCloned(params).catch(serializeError));
}
