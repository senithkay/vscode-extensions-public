import React, { FC } from "react";
import { ComponentLink } from "@wso2-enterprise/choreo-core";
import classNames from "classnames";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { Button } from "../../components/Button";
import { Codicon } from "../../components/Codicon";

interface Props {
    item: ComponentLink;
    isListLoading?: boolean;
    opened?: boolean;
}

export const ComponentListItem: FC<Props> = ({ item, isListLoading, opened }) => {
    const isItemEnriched = item.component;

    const viewComponentDetails = () =>
        ChoreoWebViewAPI.getInstance().ViewComponent({
            component: item.component!,
            project: item.project!,
            organization: item.organization!,
            componentPath: item.componentFullPath,
        });

    return (
        <div
            className={classNames({
                "flex duration-200": true,
                "cursor-pointer hover:bg-vsc-list-hoverBackground": isItemEnriched && !opened,
                "animate-pulse cursor-progress": !isItemEnriched && isListLoading,
                "cursor-pointer bg-vsc-list-dropBackground": opened,
            })}
            onClick={isItemEnriched ? viewComponentDetails : undefined}
        >
            <div className="flex-1 flex flex-col gap-0.5 pl-5 py-3 break-all">
                <h3 className="text-sm font-bold line-clamp-1">
                    {item?.component?.metadata?.displayName || item.linkContent.componentHandle}
                </h3>
                <p className="text-xs">
                    Path: {item.workspaceName}/{item.componentRelativePath}
                </p>
                {!isListLoading && !isItemEnriched && (
                    <p className="text-xs text-vsc-errorForeground">
                        Inaccessible component. Please relink or log in again.
                    </p>
                )}
            </div>
            <div className="pt-1 pr-[6px]">
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
                        webviewSection: isItemEnriched ? "validLinkItem" : "invalidLinkItem",
                        component: item.component,
                        project: item.project,
                        organization: item.organization,
                        componentPath: item.componentFullPath,
                    })}
                    title="More Actions"
                >
                    <Codicon name="ellipsis" />
                </Button>
            </div>
        </div>
    );
};
