import React, { FC } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { CommandIds, ComponentsListActivityView } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useLinkedDirContext } from "../../context/choreo-linked-dir-ctx";
import { NoLinkedComponentsView } from "../NoLinkedComponentsView";
import { ContextMenu } from "../../Components/Atoms/ContextMenu";

export const ComponentListView: FC<ComponentsListActivityView> = () => {
    const { links } = useLinkedDirContext();

    if (links.length === 0) {
        return <NoLinkedComponentsView />;
    }

    return (
        <div className="w-full flex flex-col py-2">
            {links.map((item) => (
                <div key={item.linkFullPath} className="flex cursor-pointer hover:bg-vsc-list-hoverBackground">
                    <div className="flex-1 flex flex-col gap-0.5 pl-5 py-3 ">
                        <h3 className="text-sm font-bold">{item.linkContent.componentHandle}</h3>
                        <p className="text-xs">
                            Path: {item.workspaceName}/{item.componentRelativePath}
                        </p>
                        {/* <p className="text-xs">
                            {item.linkContent.projectHandle} | {item.linkContent.orgHandle}
                        </p> */}
                    </div>
                    <div className="pt-1 pr-1">
                        <ContextMenu
                            options={[{ label: "Open in Console" }, { label: "Unlink" }, { label: "Delete" }]}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
