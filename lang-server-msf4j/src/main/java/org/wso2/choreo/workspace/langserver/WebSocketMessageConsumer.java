/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
package org.wso2.choreo.workspace.langserver;

import org.eclipse.lsp4j.jsonrpc.JsonRpcException;
import org.eclipse.lsp4j.jsonrpc.MessageConsumer;
import org.eclipse.lsp4j.jsonrpc.json.MessageJsonHandler;
import org.eclipse.lsp4j.jsonrpc.messages.Message;
import org.wso2.transport.http.netty.contract.websocket.WebSocketConnection;

import java.io.IOException;
import java.util.logging.Logger;

/**
 * Message consumer that sends messages via a WebSocket connection.
 */
public class WebSocketMessageConsumer implements MessageConsumer {

	private static final Logger LOGGER = Logger.getLogger(WebSocketMessageConsumer.class.getName());

	private WebSocketConnection connection;
	private final MessageJsonHandler jsonHandler;
	
	public WebSocketMessageConsumer(WebSocketConnection connection, MessageJsonHandler jsonHandler) {
		this.connection = connection;
		this.jsonHandler = jsonHandler;
	}
	
	public WebSocketConnection getConnection() {
		return connection;
	}
	
	@Override
	public void consume(Message message) {
		String content = jsonHandler.serialize(message);
		try {
			sendMessage(content);
		} catch (IOException exception) {
			throw new JsonRpcException(exception);
		}
	}
	
	protected void sendMessage(String message) throws IOException {
		if (connection.isOpen()) {
			int length = message.length();
			// TODO Handle if length is larger than max frame size
			connection.pushText(message);
		} else {
			LOGGER.info("Ignoring message due to closed connection: " + message);
		}
	}
	
}
