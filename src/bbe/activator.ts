/**
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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
import { commands, window, Uri, ViewColumn, ExtensionContext, WebviewPanel, workspace } from 'vscode';
import * as path from 'path';
import { render } from './renderer';
import { ExtendedLangClient } from '../core/extended-language-client';
import { ballerinaExtInstance, BallerinaExtension } from '../core';
import { WebViewRPCHandler, WebViewMethod, getCommonWebViewOptions } from '../utils';
import { TM_EVENT_OPEN_EXAMPLES, CMP_EXAMPLES_VIEW, sendTelemetryEvent, sendTelemetryException } from '../telemetry';

let examplesPanel: WebviewPanel | undefined;
const exampleMaps = new Map([
    ['distributed-transactions', 'initiator.bal'],
    ['basic-https-listener-client', 'basic_https_listener.bal'],
    ['mutual-ssl', 'mutual_ssl_service.bal'],
    ['http-cookies', 'cookie_server.bal'],
    ['http-2-0-server-push', 'http_2_0_service.bal'],
    ['grpc-unary-blocking', 'grpc_unary_blocking_service.bal'],
    ['grpc-server-streaming', 'grpc_server_streaming_service.bal'],
    ['grpc-client-streaming', 'grpc_client_streaming_service.bal'],
    ['grpc-bidirectional-streaming', 'grpc_bidirectional_streaming_service.bal'],
    ['grpc-secured-unary', 'grpc_secured_unary_service.bal'],
    ['proto-to-ballerina', 'proto_to_ballerina.proto'],
    ['openapi-to-ballerina', 'openapi_to_ballerina.yaml'],
    ['testerina-mocking-functions', 'testerina_mocking_functions_test.bal'],
    ['testerina-mocking-objects', 'testerina_mocking_objects_test.bal'],
    ['nats-basic-client', 'publisher.bal'],
    ['nats-streaming-client', 'publisher.bal'],
    ['nats-streaming-durable-subscriptions', 'publisher.bal'],
    ['nats-streaming-queue-group', 'publisher.bal'],
    ['nats-streaming-start-position', 'publisher.bal'],
    ['tcp-transport-security', 'tcp_transport_security_client.bal']
]);

function showExamples(context: ExtensionContext, langClient: ExtendedLangClient): void {
    if (examplesPanel) {
        examplesPanel.reveal();
        return;
    }
    // Create and show a new webview
    examplesPanel = window.createWebviewPanel(
        'ballerinaExamples',
        "Ballerina Examples",
        { viewColumn: ViewColumn.One, preserveFocus: false },
        getCommonWebViewOptions()
    );
    const remoteMethods: WebViewMethod[] = [
        {
            methodName: "openExample",
            handler: (args: any[]): Thenable<any> => {
                const url = args[0];
                const ballerinaHome = ballerinaExtInstance.getBallerinaHome();
                if (ballerinaHome) {
                    const folderPath = path.join(ballerinaHome, 'examples', url);
                    const filePath = path.join(folderPath, exampleMaps.has(url) ? exampleMaps.get(url)! : `${url.replace(/-/g, '_')}.bal`);
                    workspace.openTextDocument(Uri.file(filePath)).then(doc => {
                        window.showTextDocument(doc);
                    }, (err: Error) => {
                        window.showErrorMessage(err.message);
                        sendTelemetryException(ballerinaExtInstance, err, CMP_EXAMPLES_VIEW);
                    });
                }
                return Promise.resolve();
            }
        }
    ];
    WebViewRPCHandler.create(examplesPanel, langClient, remoteMethods);
    const html = render(context, langClient);
    if (examplesPanel && html) {
        examplesPanel.webview.html = html;
    }
    examplesPanel.onDidDispose(() => {
        examplesPanel = undefined;
    });
}

export function activate(ballerinaExtInstance: BallerinaExtension) {
    const context = <ExtensionContext>ballerinaExtInstance.context;
    const langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
    const examplesListRenderer = commands.registerCommand('ballerina.showExamples', () => {
        sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_OPEN_EXAMPLES, CMP_EXAMPLES_VIEW);
        ballerinaExtInstance.onReady()
            .then(() => {
                const { experimental } = langClient.initializeResult!.capabilities;
                const serverProvidesExamples = experimental && experimental.examplesProvider;

                if (!serverProvidesExamples) {
                    ballerinaExtInstance.showMessageServerMissingCapability();
                    return;
                }

                showExamples(context, langClient);
            })
            .catch((e) => {
                ballerinaExtInstance.showPluginActivationError();
                sendTelemetryException(ballerinaExtInstance, e, CMP_EXAMPLES_VIEW);
            });
    });

    context.subscriptions.push(examplesListRenderer);
}