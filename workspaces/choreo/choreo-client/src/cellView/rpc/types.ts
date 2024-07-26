/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { RequestType } from "vscode-messenger-common";
import { Project } from "@wso2-enterprise/ballerina-languageclient";
import { Organization } from "@wso2-enterprise/choreo-core";

export interface GetProjectModelRequestParams {
    org: Organization;
    projectId: string;
}

export const GetProjectModelFromFsRequest: RequestType<GetProjectModelRequestParams, Project> = { method: 'cellView/getProjectModelFromFs' };
export const GetProjectModelFromChoreoRequest: RequestType<GetProjectModelRequestParams, Project> = { method: 'cellView/getProjectModelFromChoreo' };
