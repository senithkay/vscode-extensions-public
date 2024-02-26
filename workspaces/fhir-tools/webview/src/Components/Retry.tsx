/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { StatusMessage } from "./StyledComp";
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { Codicon } from '../Codicon/Codicon';
import { RpcClient } from "@wso2-enterprise/fhir-tools-rpc-client/lib/RpcClient";

export function Retry({ errorMessage, rpcClient }:{errorMessage: string, rpcClient: RpcClient}) {

  const reTry = () => {
    console.log("Retrying the conversion. Button clicked.");
    rpcClient.getWebviewRpcClient().retry();
  };

  return (
    <StatusMessage style={{ flexDirection: "column" }}>
      <div>
        Error: {errorMessage}
      </div>

      <VSCodeButton onClick={reTry}>
        <Codicon name="refresh" /> Retry
      </VSCodeButton>
    </StatusMessage>
  );
}
