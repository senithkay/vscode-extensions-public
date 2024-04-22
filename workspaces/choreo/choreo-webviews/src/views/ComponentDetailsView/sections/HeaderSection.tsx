import React, { FC } from "react";
import {
    CommandIds,
    ComponentKind,
    ComponentsDetailsWebviewProps,
    Organization,
    Project,
} from "@wso2-enterprise/choreo-core";
import { getTypeForDisplayType } from "../utils";
import { Button } from "../../../components/Button";
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { useMutation } from "@tanstack/react-query";
import { Codicon } from "../../../components/Codicon";

export const HeaderSection: FC<ComponentsDetailsWebviewProps> = ({
    component,
    organization,
    project,
    directoryPath,
}) => {
    const openInConsole = () =>
        ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.OpenComponentInConsole, {
            component,
            project,
            organization,
        });

    const openGitPage = () => ChoreoWebViewAPI.getInstance().openExternal(component.spec.source?.github?.repository);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                <div className="flex items-center flex-wrap gap-3 md:mb-1 flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold">{component.metadata.displayName}</h1>
                    <h2 className="text-2xl md:text-3xl font-extralight opacity-40 hidden sm:block">
                        {getTypeForDisplayType(component?.spec?.type)}
                    </h2>
                </div>
                <span className="mt-1">
                    <Button
                        appearance="icon"
                        onClick={(event) => {
                            event.preventDefault();
                            event.target.dispatchEvent(
                                new MouseEvent("contextmenu", {
                                    bubbles: true,
                                    clientX: event.currentTarget.getBoundingClientRect().left,
                                    clientY: event.currentTarget.getBoundingClientRect().bottom,
                                })
                            );
                            event.stopPropagation();
                        }}
                        data-vscode-context={JSON.stringify({
                            preventDefaultContextMenuItems: true,
                            webviewSection: directoryPath ? "validLinkItem" : "invalidLinkItem",
                            component: component,
                            project: project,
                            organization: organization,
                            componentPath: directoryPath,
                        })}
                        title="More Actions"
                    >
                        <Codicon name="ellipsis" />
                    </Button>
                </span>
            </div>
            <div className="flex flex-wrap gap-1 xl:gap-2">
                <div>
                    <span className="font-extralight">Project:</span> {project.name}
                </div>
                <div>
                    <span className="opacity-70">Organization:</span> {organization.name}
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button appearance="secondary" onClick={() => openInConsole()}>
                    Open in Console
                </Button>
                <Button appearance="secondary" onClick={() => openGitPage()}>
                    Open Git Repository
                </Button>
            </div>
        </div>
    );
};
