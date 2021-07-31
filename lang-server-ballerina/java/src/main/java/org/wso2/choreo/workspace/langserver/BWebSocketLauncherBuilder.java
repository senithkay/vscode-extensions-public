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

import java.util.Collection;

import javax.websocket.Session;

import org.eclipse.lsp4j.jsonrpc.Endpoint;
import org.eclipse.lsp4j.jsonrpc.Launcher;
import org.eclipse.lsp4j.jsonrpc.MessageConsumer;
import org.eclipse.lsp4j.jsonrpc.RemoteEndpoint;
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler;
import org.eclipse.lsp4j.jsonrpc.services.ServiceEndpoints;
import org.eclipse.lsp4j.websocket.WebSocketMessageConsumer;
import org.eclipse.lsp4j.websocket.WebSocketMessageHandler;

/**
 * JSON-RPC launcher builder for use with Ballerina-JVM inter-op.
 *
 * @param <T> remote service interface type
 */
public class BWebSocketLauncherBuilder<T> extends Launcher.Builder<T> {

    private BWebSocketCallerMessageHandler messageHandler;
    private BWebSocketCallerMessageConsumer messageConsumer;

    public Collection<Object> getLocalServices() {
        return localServices;
    }

    public BWebSocketLauncherBuilder<T> setMessageHandler(BWebSocketCallerMessageHandler messageHandler) {
        this.messageHandler = messageHandler;
        return this;
    }

    public BWebSocketLauncherBuilder<T> setMessageConsumer(BWebSocketCallerMessageConsumer messageConsumer) {
        this.messageConsumer = messageConsumer;
        return this;
    }

    @Override
    public Launcher<T> create() {
        if (localServices == null)
            throw new IllegalStateException("Local service must be configured.");
        if (remoteInterfaces == null)
            throw new IllegalStateException("Remote interface must be configured.");
        if (messageConsumer == null)
            throw new IllegalStateException("Message consumer must be configured.");
        if (messageHandler == null)
            throw new IllegalStateException("Message handler must be configured.");

        MessageJsonHandler jsonHandler = createJsonHandler();
        RemoteEndpoint remoteEndpoint = createRemoteEndpoint(jsonHandler);
        addMessageHandlers(jsonHandler, remoteEndpoint);
        T remoteProxy = createProxy(remoteEndpoint);
        return createLauncher(null, remoteProxy, remoteEndpoint, null);
    }

    @Override
    protected RemoteEndpoint createRemoteEndpoint(MessageJsonHandler jsonHandler) {
        messageConsumer.configure(jsonHandler);
        MessageConsumer outgoingMessageStream = messageConsumer;
        outgoingMessageStream = wrapMessageConsumer(outgoingMessageStream);
        Endpoint localEndpoint = ServiceEndpoints.toEndpoint(localServices);
        RemoteEndpoint remoteEndpoint;
        if (exceptionHandler == null)
            remoteEndpoint = new RemoteEndpoint(outgoingMessageStream, localEndpoint);
        else
            remoteEndpoint = new RemoteEndpoint(outgoingMessageStream, localEndpoint, exceptionHandler);
        jsonHandler.setMethodProvider(remoteEndpoint);
        return remoteEndpoint;
    }

    protected void addMessageHandlers(MessageJsonHandler jsonHandler, RemoteEndpoint remoteEndpoint) {
        MessageConsumer messageConsumer = wrapMessageConsumer(remoteEndpoint);
        messageHandler.configure(messageConsumer, jsonHandler, remoteEndpoint);
    }

}