import React, { FC } from "react";
import { CommandIds, ContextItemEnriched } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { Button } from "../../components/Button";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";

interface Props {
    loading?: boolean;
    items?: ContextItemEnriched[];
    selected?: ContextItemEnriched;
}

export const ComponentsEmptyView: FC<Props> = ({ items, loading, selected }) => {
    return (
        <>
            {loading && <ProgressIndicator />}
            <div className="w-full flex flex-col px-6 py-2 gap-[10px]">
                <p>Choreo component directories associated with project {selected.project?.name}, are not detected within the current workspace.</p>
                <p>Create a new component.</p>
                <Button
                    className="w-full max-w-80 self-center sm:self-start"
                    onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.CreateNewComponent)}
                    title="Create a Choreo component linked to your local directory. Build and deploy it to the cloud effortlessly."
                >
                    Create Component
                </Button>
                {items.length > 0 && (
                    <>
                        <p>Multiple projects detected within the current workspace</p>
                        <Button
                            className="w-full max-w-80 self-center sm:self-start"
                            onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.SwitchDirectoryContext)}
                            title="Switch to different project context to manage the components of that project."
                        >
                            Switch Project
                        </Button>
                    </>
                )}
            </div>
        </>
    );
};
