/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
package org.wso2.choreo.workspace.langserver;

import org.ballerinalang.langserver.BallerinaLanguageServer;
import org.ballerinalang.langserver.client.ExtendedLanguageClient;
import org.wso2.transport.http.netty.contract.websocket.WebSocketConnection;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@ServerEndpoint("/orgs/{org}/apps/{app}/workspace/lang-server")
public class LangServerEndpoint {

    private final static Logger LOGGER = Logger.getLogger(LangServerEndpoint.class.getName());

    private final Map<String, WebSocketMessageHandler> messageHandlerMap;
    private final Map<String, BallerinaLanguageServer> languageServerMap;

    public LangServerEndpoint() {
        this.messageHandlerMap = new HashMap<>();
        this.languageServerMap = new HashMap<>();
    }

    @OnOpen
    public void onOpen(WebSocketConnection webSocketConnection) {
        BallerinaLanguageServer languageServer = new BallerinaLanguageServer();
        WebSocketMessageHandler messageHandler = new WebSocketMessageHandler();
        WebSocketLauncherBuilder<ExtendedLanguageClient> builder = new WebSocketLauncherBuilder<>();
        builder
            .setConnection(webSocketConnection)
            .setMessageHandler(messageHandler)
            .setLocalService(languageServer)
            .setRemoteInterface(ExtendedLanguageClient.class);
        builder.create();
        languageServerMap.put(webSocketConnection.getChannelId(), languageServer);
        messageHandlerMap.put(webSocketConnection.getChannelId(), messageHandler);
    }

    @OnMessage
    public void onTextMessage(String text, WebSocketConnection webSocketConnection) throws IOException {
        WebSocketMessageHandler messageHandler = messageHandlerMap.get(webSocketConnection.getChannelId());
        if (messageHandler != null) {
            messageHandler.onMessage(text);
        }
    }

    @OnClose
    public void onClose(CloseReason closeReason, WebSocketConnection webSocketConnection) {
        LOGGER.info("Connection is closed with status code : " + closeReason.getCloseCode().getCode()
                + " On reason " + closeReason.getReasonPhrase());
        BallerinaLanguageServer languageServer = languageServerMap.get(webSocketConnection.getChannelId());
        languageServer.shutdown();
    }

    @OnError
    public void onError(Throwable throwable, WebSocketConnection webSocketConnection) {
        LOGGER.warning("Error found in method : " + throwable.toString());
        BallerinaLanguageServer languageServer = languageServerMap.get(webSocketConnection.getChannelId());
        languageServer.shutdown();
    }

}
