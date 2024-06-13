import React, { FC } from "react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { Button } from "../../components/Button";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";

interface Props {
    loading?: boolean;
}

export const InvalidWorkspaceView: FC<Props> = ({ loading }) => {
    const openFolder = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("vscode.openFolder");
    };

    const cloneProject = () => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.CloneProject);

    return (
        <>
            {loading && <ProgressIndicator />}
            <div className="w-full flex flex-col px-6 py-2 gap-[10px]">
                <p>To use the Choreo extension, please open a folder in VS Code.</p>
                <Button className="w-full max-w-80 self-center sm:self-start" onClick={openFolder}>
                    Open Folder
                </Button>
                <p>
                    If you have an existing project that hasn't been cloned locally, click{" "}
                    <VSCodeLink onClick={cloneProject}>here</VSCodeLink>.
                </p>
            </div>
        </>
    );
};
