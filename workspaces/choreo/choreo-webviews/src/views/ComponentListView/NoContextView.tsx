import React, { FC } from "react";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { Button } from "../../components/Button";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";

interface Props {
    loading?: boolean;
}

export const NoContextView: FC<Props> = ({ loading }) => {
    return (
        <>
            {loading && <ProgressIndicator />}
            <div className="w-full flex flex-col px-6 py-2 gap-[10px]">
                <p>Choreo project/component directories are not detected within the current workspace.</p>
                <p>Create a new component.</p>
                <Button
                    className="w-full max-w-80 self-center sm:self-start"
                    onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.CreateNewComponent)}
                    title="Create a Choreo component linked to your local directory. Build and deploy it to the cloud effortlessly."
                >
                    Create Component
                </Button>
                <p>Link a directory with an existing project</p>
                <Button
                    className="w-full max-w-80 self-center sm:self-start"
                    onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.ManageDirectoryContext)}
                    title="Create a context.yaml file in within your workspace directory in order to associate the directory with your project."
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
        </>
    );
};
