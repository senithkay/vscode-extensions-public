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
import org.eclipse.lsp4j.jsonrpc.JsonRpcException;
import org.eclipse.lsp4j.jsonrpc.MessageConsumer;
import org.eclipse.lsp4j.jsonrpc.MessageIssueException;
import org.eclipse.lsp4j.jsonrpc.MessageIssueHandler;
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler;
import org.eclipse.lsp4j.jsonrpc.messages.Message;
import org.eclipse.lsp4j.websocket.WebSocketMessageConsumer;
import io.ballerina.runtime.scheduling.Scheduler;
import io.ballerina.runtime.scheduling.Strand;

import java.io.IOException;
import java.util.logging.Logger;

/**
 *
 */
public class BWebSocketCallerMessageConsumer implements MessageConsumer {

    private static final Logger LOG = Logger.getLogger(BWebSocketCallerMessageConsumer.class.getName());

    private MessageJsonHandler jsonHandler;

    private BObject webSocketCaller;
    private Runtime currentRuntime;

    public BWebSocketCallerMessageConsumer(BObject webSocketCaller, Runtime currentRuntime) {
        this.webSocketCaller = webSocketCaller;
        this.currentRuntime = currentRuntime;
    }

    public void configure(MessageJsonHandler jsonHandler) {
        this.jsonHandler = jsonHandler;
    }

    @Override
    public void consume(Message message) {
        String content = jsonHandler.serialize(message);
        try {
            sendMessage(content);
        } catch (Exception exception) {
            throw new JsonRpcException(exception);
        }
    }

    public void sendMessage(String message) throws MessageIssueException, JsonRpcException {
        Strand strand = Scheduler.getStrand();
        Object isOpen = currentRuntime.invokeMethodAsync(webSocketCaller,"isOpen", null, null, null);
        Boolean isConnectionOpen = (Boolean) isOpen;
        if (isConnectionOpen) {
            Object isSuccess = currentRuntime.invokeMethodAsync(webSocketCaller, "pushText", null, null, null, message);
        }
    }
}
