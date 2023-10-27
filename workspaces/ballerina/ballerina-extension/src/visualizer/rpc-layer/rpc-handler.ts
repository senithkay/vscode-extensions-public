/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of content.
 */

import { Messenger } from "vscode-messenger";
import { ExtensionContext } from "vscode";
import { ExtendedLangClient } from "../../core";
import { RPCManger } from "./rpc-manager";
import { getComponents
} from "./rpc-types";

export function registerOverviewRPCHandlers(messenger: Messenger, langClient: ExtendedLangClient) {
    const rpcManger = new RPCManger(langClient);
    messenger.onRequest(getComponents, () => rpcManger.getComponents());
   
}
