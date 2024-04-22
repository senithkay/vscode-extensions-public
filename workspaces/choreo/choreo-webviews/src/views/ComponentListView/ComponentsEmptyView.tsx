import React from "react";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { Button } from "../../components/Button";
import { Codicon } from "../../components/Codicon";

export const ComponentsEmptyView = () => {
    return (
        <div className="w-full flex flex-col px-6 py-2 gap-[10px]">
            <p>Choreo component directories are not detected within the current workspace.</p>
            <p>
                Create a new component.
                <Codicon
                    className="ml-2 align-middle mb-0.5 opacity-50"
                    title="Create a Choreo component linked to your local directory. Build and deploy it to the cloud effortlessly."
                    name="info"
                />
            </p>
            <Button
                className="w-full max-w-80 self-center sm:self-start"
                onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.CreateNewComponent)}
            >
                Create Component
            </Button>
            <p>
                Link a directory with an existing component.
                <Codicon
                    className="ml-2 align-middle mb-0.5 opacity-50"
                    title="Create a link.yaml file in any directory within your workspace to link it to an existing Choreo component."
                    name="info"
                />
            </p>
            <Button
                className="w-full max-w-80 self-center sm:self-start"
                onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.LinkExistingComponent)}
            >
                Link Directory
            </Button>
        </div>
    );
};
