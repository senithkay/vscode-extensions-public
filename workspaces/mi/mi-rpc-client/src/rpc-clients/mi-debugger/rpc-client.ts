/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
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
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    AddBreakpointToSourceRequest,
    AddBreakpointToSourceResponse,
    GetBreakpointInfoRequest,
    GetBreakpointInfoResponse,
    GetBreakpointsRequest,
    GetBreakpointsResponse,
    MiDebuggerAPI,
    RemoveBreakpointFromSourceRequest,
    StepOverBreakpointRequest,
    StepOverBreakpointResponse,
    ValidateBreakpointsRequest,
    ValidateBreakpointsResponse,
    addBreakpointToSource,
    getBreakpointInfo,
    getBreakpoints,
    getStepOverBreakpoint,
    removeBreakpointFromSource,
    validateBreakpoints
} from "@wso2-enterprise/mi-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class MiDebuggerRpcClient implements MiDebuggerAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    validateBreakpoints(params: ValidateBreakpointsRequest): Promise<ValidateBreakpointsResponse> {
        return this._messenger.sendRequest(validateBreakpoints, HOST_EXTENSION, params);
    }

    getBreakpointInfo(params: GetBreakpointInfoRequest): Promise<GetBreakpointInfoResponse> {
        return this._messenger.sendRequest(getBreakpointInfo, HOST_EXTENSION, params);
    }

    addBreakpointToSource(params: AddBreakpointToSourceRequest): Promise<AddBreakpointToSourceResponse> {
        return this._messenger.sendRequest(addBreakpointToSource, HOST_EXTENSION, params);
    }

    getBreakpoints(params: GetBreakpointsRequest): Promise<GetBreakpointsResponse> {
        return this._messenger.sendRequest(getBreakpoints, HOST_EXTENSION, params);
    }

    getStepOverBreakpoint(params: StepOverBreakpointRequest): Promise<StepOverBreakpointResponse> {
        return this._messenger.sendRequest(getStepOverBreakpoint, HOST_EXTENSION, params);
    }

    removeBreakpointFromSource(params: RemoveBreakpointFromSourceRequest): void {
        return this._messenger.sendNotification(removeBreakpointFromSource, HOST_EXTENSION, params);
    }
}
