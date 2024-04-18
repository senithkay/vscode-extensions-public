import React from "react";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { Button } from "../../components/Button";

export const ComponentsEmptyView = () => {
    return (
        <div className="w-full flex flex-col px-6 py-2 gap-[10px]">
            <p>Choreo component directories are not detected within the current workspace.</p>
            <p>To create a new component.</p>
            <Button
                className="w-full max-w-80 self-center sm:self-start"
                onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.CreateNewComponent)}
            >
                Create Component
            </Button>
            <p>To link a directory with an existing component.</p>
            <Button
                className="w-full max-w-80 self-center sm:self-start"
                onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.LinkExistingComponent)}
            >
                Link Directory
            </Button>
        </div>
    );
};
