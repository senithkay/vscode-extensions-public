/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { decimal } from "vscode-languageclient";
import { CMEntryPoint as EntryPoint, CMService as Service, CMLocation as Location } from "@wso2-enterprise/ballerina-languageclient";
import { Connector } from "@wso2-enterprise/ballerina-low-code-edtior-commons/src/types";

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

export interface AddConnectorArgs {
    connector: Connector;
    source: EntryPoint | Service;
}

export interface AddLinkArgs {
    source: EntryPoint | Service;
    target: Service;
}

export interface DeleteLinkArgs {
    linkLocation: Location;
    nodeLocation: Location;
}

export interface TomlPackageData {
    name: string;
    org: string;
    version: string;
}

export const GLOBAL_STATE_FLAG = "LOAD_ARCHITECTURE_VIEW";

export const ERROR_MESSAGE = "Architecture View: Failed to generate view.";
export const USER_TIP = "Architecture View: If you want to generate the diagrams for multiple packages, add them to your workspace.";
export const INCOMPATIBLE_VERSIONS_MESSAGE = "Architecture View: Incompatible Ballerina version. Update to Ballerina version 2201.2.2 or above to activate the feature.";
export const DIAGNOSTICS_WARNING = "Architecture View: Please resolve the diagnostics in your workspace for a better representation of your project.";
export const UNSUPPORTED_LINK_DELETION = "Architecture View: Cannot delete link as changes lead to errors in the source.";
export const SUCCESSFUL_LINK_DELETION = "Architecture View: Link was deleted successfully.";
export const MULTI_ROOT_WORKSPACE_PROMPT = "Architecture View: Save current workspace as a multi-root workspace to add components.";

export const DEFAULT_SERVICE_TEMPLATE_SUFFIX = "-t service";
export const GRAPHQL_SERVICE_TEMPLATE_SUFFIX = "-t choreo/graphql_service";
