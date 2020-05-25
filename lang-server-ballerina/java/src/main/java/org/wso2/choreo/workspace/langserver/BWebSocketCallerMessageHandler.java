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

import org.eclipse.lsp4j.jsonrpc.MessageConsumer;
import org.eclipse.lsp4j.jsonrpc.MessageIssueException;
import org.eclipse.lsp4j.jsonrpc.MessageIssueHandler;
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler;
import org.eclipse.lsp4j.jsonrpc.messages.Message;

/**
 *
 */
public class BWebSocketCallerMessageHandler {

    private MessageConsumer callback;
    private MessageJsonHandler jsonHandler;
    private MessageIssueHandler issueHandler;

    public void configure(MessageConsumer callback, MessageJsonHandler jsonHandler, MessageIssueHandler issueHandler) {
        this.callback = callback;
        this.jsonHandler = jsonHandler;
        this.issueHandler = issueHandler;
    }

    public void onMessage(String content) {
        try {
            Message message = jsonHandler.parseMessage(content);
            callback.consume(message);
        } catch (MessageIssueException exception) {
            // An issue was found while parsing or validating the message
            issueHandler.handle(exception.getRpcMessage(), exception.getIssues());
        }
    }
}
