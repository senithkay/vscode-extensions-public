import React, {useState} from "react";
import { StatusMessage } from "./StyledComp";
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { Codicon } from '../Codicon/Codicon';
import { WebViewRPC } from "../WebViewRPC";

const reTry = () => {
  WebViewRPC.getInstance().retryRequest();
};

export function Retry({errorMessage}:{errorMessage: string}) {
  const [showErrorDetails, setShowErrorDetails] = React.useState(false);
  return (
    <StatusMessage style={{ flexDirection: "column" }}>
      <div>
        An error occurred. Please retry again. &nbsp;
        {!showErrorDetails && (
          <a href="#" onClick={() => setShowErrorDetails(!showErrorDetails)}>
            Show Error
          </a>
        )}
        {showErrorDetails && <div>Error: {errorMessage}</div>}
      </div>

      <VSCodeButton onClick={reTry}>
        <Codicon name="refresh" /> Retry
      </VSCodeButton>
    </StatusMessage>
  );
}
