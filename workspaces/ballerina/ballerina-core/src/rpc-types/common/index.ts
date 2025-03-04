/*
 *  Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

import {
    BallerinaDiagnosticsRequest,
    BallerinaDiagnosticsResponse,
    CommandsRequest,
    CommandsResponse,
    GoToSourceRequest,
    OpenExternalUrlRequest,
    FileOrDirResponse,
    RunExternalCommandRequest,
    RunExternalCommandResponse,
    TypeResponse,
    WorkspaceFileRequest,
    WorkspacesFileResponse,
    FileOrDirRequest,
    WorkspaceRootResponse
} from "./interfaces";

export interface CommonRPCAPI {
    getTypeCompletions: () => Promise<TypeResponse>;
    goToSource: (params: GoToSourceRequest) => void;
    getWorkspaceFiles: (params: WorkspaceFileRequest) => Promise<WorkspacesFileResponse>;
    getBallerinaDiagnostics: (params: BallerinaDiagnosticsRequest) => Promise<BallerinaDiagnosticsResponse>;
    executeCommand: (params: CommandsRequest) => Promise<CommandsResponse>;
    runBackgroundTerminalCommand: (params: RunExternalCommandRequest) => Promise<RunExternalCommandResponse>;
    openExternalUrl: (params: OpenExternalUrlRequest) => void;
    selectFileOrDirPath: (params: FileOrDirRequest) => Promise<FileOrDirResponse>;
    experimentalEnabled: () => Promise<boolean>;
    getWorkspaceRoot: () => Promise<WorkspaceRootResponse>;
}
