/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";
import { GetProjectModelFromChoreoRequest, GetProjectModelFromFsRequest } from "./types";
import { IChoreoCellViewClient } from "../types";
import { Project } from "@wso2-enterprise/ballerina-languageclient";
import { Organization } from "@wso2-enterprise/choreo-core";

export class ChoreoCellViewRPCWebview implements IChoreoCellViewClient {
    constructor (private _messenger: Messenger) {
    }

    getProjectModelFromFs(org: Organization, projectId: string): Promise<Project> {
        return this._messenger.sendRequest(GetProjectModelFromFsRequest, HOST_EXTENSION, { org, projectId });
    }

    getProjectModelFromChoreo(org: Organization, projectId: string): Promise<Project> {
        return this._messenger.sendRequest(GetProjectModelFromChoreoRequest, HOST_EXTENSION, { org, projectId });
    }
}
