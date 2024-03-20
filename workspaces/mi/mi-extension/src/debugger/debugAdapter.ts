/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { LoggingDebugSession } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import * as vscode from 'vscode';
import { executeTasks, updateServerPathAndGet } from './debugHelper';

export class MiDebugAdapter extends LoggingDebugSession {
    protected launchRequest(response: DebugProtocol.LaunchResponse, args?: DebugProtocol.LaunchRequestArguments, request?: DebugProtocol.Request): void {
        updateServerPathAndGet().then((serverPath) => {
            if (!serverPath) {
                response.success = false;
                this.sendResponse(response);
            } else {
                executeTasks(serverPath)
                    .then(() => {
                        this.sendResponse(response);
                    })
                    .catch(error => {
                        vscode.window.showErrorMessage(`Error while launching run and debug`);
                    });
            }
        });
    }

    protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {
        const taskExecution = vscode.tasks.taskExecutions.find(execution => execution.task.name === 'run');
        if (taskExecution) {
            taskExecution.terminate();
            response.success = true;
        } else {
            response.success = false;
        }
        this.sendResponse(response);
    }

    protected async attachRequest(response: DebugProtocol.AttachResponse, args: DebugProtocol.LaunchRequestArguments) {
        return this.launchRequest(response, args);
    }
}
