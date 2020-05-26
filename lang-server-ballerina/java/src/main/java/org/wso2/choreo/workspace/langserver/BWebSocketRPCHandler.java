/*
 * Copyright (c) 2020, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.wso2.choreo.workspace.langserver;

import org.ballerinalang.jvm.BRuntime;
import org.ballerinalang.jvm.values.ObjectValue;
import org.ballerinalang.langserver.BallerinaLanguageServer;
import org.ballerinalang.langserver.client.ExtendedLanguageClient;
import org.eclipse.lsp4j.jsonrpc.Launcher;

import java.util.Collection;

public class BWebSocketRPCHandler {

    private ObjectValue webSocketCaller;
    private BallerinaLanguageServer languageServer;
    private BWebSocketCallerMessageHandler messageHandler;
    private BWebSocketCallerMessageConsumer messageConsumer;
    private BRuntime currentRuntime;

    public BWebSocketRPCHandler(ObjectValue webSocketCaller) {
        this.currentRuntime = BRuntime.getCurrentRuntime();
        this.webSocketCaller = webSocketCaller;
        this.init();
    }

    public void init() {
        languageServer = new BallerinaLanguageServer();
        BWebSocketLauncherBuilder<ExtendedLanguageClient> builder =
                new BWebSocketLauncherBuilder<>();
        messageHandler = new BWebSocketCallerMessageHandler();
        messageConsumer = new BWebSocketCallerMessageConsumer(webSocketCaller, currentRuntime);
        builder
            .setMessageHandler(messageHandler)
            .setMessageConsumer(messageConsumer)
            .setLocalService(languageServer)
            .setRemoteInterface(ExtendedLanguageClient.class);
        Launcher<ExtendedLanguageClient> launcher = builder.create();
        connect(builder.getLocalServices(), launcher.getRemoteProxy());
    }

    public void onMessage(String msg) {
        messageHandler.onMessage(msg);
    }

    public void close() {
        if (languageServer != null) {
            languageServer.shutdown();
            languageServer = null;
        }
    }

    protected void connect(Collection<Object> localServices, ExtendedLanguageClient remoteProxy) {
    }
}
