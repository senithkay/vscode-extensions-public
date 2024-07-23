import {
	CommandIds,
	type ContextStoreComponentState,
	type Organization,
	type Project,
	type ViewComponentDetailsReq,
} from "@wso2-enterprise/choreo-core";
import classNames from "classnames";
import React, { type FC } from "react";
import { ContextMenu } from "../../components/ContextMenu";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";

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
			component: item.component,
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
			<div className="flex flex-1 flex-col gap-0.5 break-all py-3 pl-5">
				<h3 className="line-clamp-1 font-bold text-sm">{item?.component?.metadata?.displayName}</h3>
				<p className="text-xs">
					Path: {item.workspaceName}/{item.componentRelativePath}
				</p>
			</div>
			<div className="pt-1 pr-3">
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
