import React, { FC } from "react";
import {
    CommandIds,
    ContextStoreComponentState,
    Organization,
    Project,
    ViewComponentDetailsReq,
} from "@wso2-enterprise/choreo-core";
import classNames from "classnames";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ContextMenu } from "../../components/ContextMenu";

interface Props {
    project?: Project;
    org?: Organization;
    item: ContextStoreComponentState;
    isListLoading?: boolean;
    opened?: boolean;
}

export const ComponentListItem: FC<Props> = ({ item, isListLoading, opened, org, project }) => {
    const viewComponentDetails = () =>
        ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.ViewComponent, {
            component: item.component!,
            project: project,
            organization: org,
            componentPath: item.componentFsPath,
        } as ViewComponentDetailsReq);

    return (
        <div
            className={classNames({
                "flex duration-200": true,
                "cursor-pointer hover:bg-vsc-list-hoverBackground": !opened,
                "animate-pulse cursor-progress": isListLoading,
                "cursor-pointer bg-vsc-list-dropBackground": opened,
            })}
            onClick={viewComponentDetails}
        >
            <div className="flex-1 flex flex-col gap-0.5 pl-5 py-3 break-all">
                <h3 className="text-sm font-bold line-clamp-1">{item?.component?.metadata?.displayName}</h3>
                <p className="text-xs">
                    Path: {item.workspaceName}/{item.componentRelativePath}
                </p>
            </div>
            <div className="pt-1 pr-[6px]">
                <ContextMenu
                    webviewSection="componentListItem"
                    params={{
                        component: item.component,
                        project: project,
                        organization: org,
                        componentPath: item.componentFsPath,
                    }}
                />
            </div>
        </div>
    );
};
