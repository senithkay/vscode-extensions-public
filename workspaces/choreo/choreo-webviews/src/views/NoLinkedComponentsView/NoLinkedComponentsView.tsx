import React from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";

export const NoLinkedComponentsView = () => {
    return (
        <div className="w-full flex flex-col px-1 py-2 gap-[10px]">
            <p>Unable to detect Choreo components in the current workspace.</p>
            <p>To create a new component.</p>
            <VSCodeButton
                className="w-full max-w-80 self-center sm:self-start"
                onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.CreateNewComponent)}
            >
                Create Component
            </VSCodeButton>
            <p>To link an existing component with this directory.</p>
            <VSCodeButton
                className="w-full max-w-80 self-center sm:self-start"
                onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.LinkExistingComponent)}
            >
                Link Directory
            </VSCodeButton>
        </div>
    );
};
