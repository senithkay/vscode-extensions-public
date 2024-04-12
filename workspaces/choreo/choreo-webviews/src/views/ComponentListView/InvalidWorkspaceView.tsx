import React from "react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";

export const InvalidWorkspaceView = () => {
    const openFolder = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("vscode.openFolder");
    };

    return (
        <div className="w-full flex flex-col px-6 py-2 gap-[10px]">
            <p>
                To use the Choreo extension, please <VSCodeLink onClick={openFolder}>open a folder</VSCodeLink> in VS
                Code.
            </p>
        </div>
    );
};
