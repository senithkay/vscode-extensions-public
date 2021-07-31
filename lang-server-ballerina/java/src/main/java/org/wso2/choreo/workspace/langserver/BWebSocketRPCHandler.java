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

import io.ballerina.runtime.api.Environment;
import io.ballerina.runtime.api.Runtime;
import io.ballerina.runtime.api.values.BObject;
import io.ballerina.runtime.internal.scheduling.Scheduler;
import org.ballerinalang.langserver.BallerinaLanguageServer;
import org.ballerinalang.langserver.commons.client.ExtendedLanguageClient;
import org.eclipse.lsp4j.jsonrpc.Launcher;

import java.util.Collection;
import java.util.logging.Logger;

public class BWebSocketRPCHandler {

    private static final Logger logger = Logger.getLogger(BWebSocketRPCHandler.class.getName());

    private BObject webSocketCaller;
    private BallerinaLanguageServer languageServer;
    private BWebSocketCallerMessageHandler messageHandler;
    private BWebSocketCallerMessageConsumer messageConsumer;
    private Environment currentEnv;
    public Runtime currentRuntime;

    public BWebSocketRPCHandler(BObject webSocketCaller) {
        this.webSocketCaller = webSocketCaller;
        this.initialize();
        logger.info("Starting LangServer session.");
    }

    public void initialize() {
        languageServer = new BallerinaLanguageServer();
        BWebSocketLauncherBuilder<ExtendedLanguageClient> builder =
                new BWebSocketLauncherBuilder<>();
        messageHandler = new BWebSocketCallerMessageHandler();
        messageConsumer = new BWebSocketCallerMessageConsumer(webSocketCaller, this);
        builder
            .setMessageHandler(messageHandler)
            .setMessageConsumer(messageConsumer)
            .setLocalService(languageServer)
            .setRemoteInterface(ExtendedLanguageClient.class);
        Launcher<ExtendedLanguageClient> launcher = builder.create();
        connect(builder.getLocalServices(), launcher.getRemoteProxy());
    }

    public void onMessage(Environment env, String msg) {
        this.currentEnv = env;
        this.currentRuntime = this.currentEnv.getRuntime(); 
        messageHandler.onMessage(msg);
    }

    public void close() {
        logger.info("Shutting down LangServer session.");
        if (languageServer != null) {
            languageServer.shutdown();
            languageServer = null;
        }
    }

    protected void connect(Collection<Object> localServices, ExtendedLanguageClient remoteProxy) {
    }
}
