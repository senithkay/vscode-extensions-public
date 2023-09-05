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
import { RequestType } from "vscode-messenger-common";
import { Project } from "@wso2-enterprise/ballerina-languageclient";
import { Organization } from "@wso2-enterprise/choreo-core";

export interface GetProjectModelRequestParams {
    org: Organization;
    projectId: string;
}

export const GetProjectModelRequest: RequestType<GetProjectModelRequestParams, Project> = { method: 'cellView/getProjectModel' };
