/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of content.
 */

import { Messenger } from "vscode-messenger";
import { OverviewRPCManger } from "./rpc-manager";
import { BallerinaLangClientInterface, getBallerinaProjectComponents, getExecutorPositions, getSTForFunction } from "@wso2-enterprise/ballerina-core";

export function registerOverviewRPCHandlers(messenger: Messenger, langClient: BallerinaLangClientInterface) {
    const rpcManger = new OverviewRPCManger(langClient);
    messenger.onRequest(getBallerinaProjectComponents, (args) => rpcManger.getBallerinaProjectComponents(args));
    messenger.onRequest(getExecutorPositions, (args) => rpcManger.getExecutorPositions(args));
    messenger.onRequest(getSTForFunction, (args) => rpcManger.getSTForFunction(args));
}
