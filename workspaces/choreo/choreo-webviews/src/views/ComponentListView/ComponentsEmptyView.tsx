import React from "react";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { Button } from "../../components/Button";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";

export const ComponentsEmptyView = () => {
    return (
        <div className="w-full flex flex-col px-6 py-2 gap-[10px]">
            <p>Choreo component directories are not detected within the current workspace.</p>
            <p>Create a new component.</p>
            <Button
                className="w-full max-w-80 self-center sm:self-start"
                onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.CreateNewComponent)}
                title="Create a Choreo component linked to your local directory. Build and deploy it to the cloud effortlessly."
            >
                Create Component
            </Button>
            <p>Link a directory with an existing component or components</p>
            <Button
                className="w-full max-w-80 self-center sm:self-start"
                onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.LinkExistingComponent)}
                title="Create a link.yaml file in any directory within your workspace to an existing Choreo component or multiple components."
            >
                Link Directory
            </Button>
            <p>
                If you have an existing project that hasn't been cloned locally, click{" "}
                <VSCodeLink onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.CloneProject)}>
                    here
                </VSCodeLink>
                .
            </p>
        </div>
    );
};
