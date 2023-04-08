/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { decimal } from "vscode-languageclient";
import { ElementLocation } from "@wso2-enterprise/ballerina-languageclient";

export enum ServiceTypes {
    HTTP = "http",
    GRPC = "grpc",
    GRAPHQL = "graphql",
    WEBSOCKET = "websocket",
    OTHER = "other"
}

export interface BallerinaVersion {
    majorVersion: decimal;
    patchVersion: number;
}

export interface CommandResponse {
    error: boolean;
    message: string;
}

export interface DeleteLinkArgs {
    linkLocation: ElementLocation;
    serviceLocation: ElementLocation;
}

export const ERROR_MESSAGE = "Architecture View: Failed to generate view.";
export const USER_TIP = "Architecture View: If you want to generate the diagrams for multiple packages, add them to your workspace.";
export const INCOMPATIBLE_VERSIONS_MESSAGE = "Architecture View: Incompatible Ballerina version. Update to Ballerina version 2201.2.2 or above to activate the feature.";
export const DIAGNOSTICS_WARNING = "Architecture View: Please resolve the diagnostics in your workspace for a better representation of your project.";
export const UNSUPPORTED_LINK_DELETION = "Architecture View: Cannot delete link as changes lead to errors in the source.";
export const SUCCESSFUL_LINK_DELETION = "Architecture View: Link was deleted successfully.";

export const DEFAULT_SERVICE_TEMPLATE_SUFFIX = "-t service";
export const GRAPHQL_SERVICE_TEMPLATE_SUFFIX = "-t choreo/graphql_service";
