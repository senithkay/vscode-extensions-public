/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { NotificationType } from "vscode-messenger-common";

export interface StateChangeEvent {
    state: string;
    theme: string;
    outputData?: string;
    errorMessage?: string;
}

export interface StateMachineContext {
    xRequestId?: string;
    convType?: string;
    inputData?: string;
    outputData?: string;
    error?: string;
    filePath?: string;
}

export interface SetInputDataEvent {
    type: 'SET_INPUT_DATA';
    inputData: string;
    convType: string;
    filePath: string;
}   

export const stateChanged: NotificationType<StateChangeEvent> = { method: "stateChanged" };
