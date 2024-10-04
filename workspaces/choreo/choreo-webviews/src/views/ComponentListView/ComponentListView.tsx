/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ComponentsListActivityViewProps } from "@wso2-enterprise/choreo-core";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
import React, { type FC, useEffect } from "react";
import { ChoreoWebViewAPI } from "../../utilities/vscode-webview-rpc";
import { ComponentListItem } from "./ComponentListItem";
import { ComponentsEmptyView } from "./ComponentsEmptyView";
import { InvalidWorkspaceView } from "./InvalidWorkspaceView";
import { NoContextView } from "./NoContextView";

export const ComponentListView: FC<ComponentsListActivityViewProps> = ({ directoryPath }) => {
	const queryClient = useQueryClient();

	const { data: linkedDirState, isLoading } = useQuery({
		queryKey: ["context_state"],
		queryFn: () => ChoreoWebViewAPI.getInstance().getContextState(),
	});

	const { data: openedComponentKey } = useQuery({
		queryKey: ["active_component"],
		queryFn: () => ChoreoWebViewAPI.getInstance().getWebviewStoreState(),
		select: (data) => data.openedComponentKey,
	});

	useEffect(() => {
		ChoreoWebViewAPI.getInstance().refreshContextState();
		ChoreoWebViewAPI.getInstance().onContextStateChanged((contextState) => {
			queryClient.setQueryData(["context_state"], contextState);
		});
		ChoreoWebViewAPI.getInstance().onWebviewStateChanged((webviewState) => {
			queryClient.setQueryData(["active_component"], webviewState);
		});
	}, []);

	const [componentListRef] = useAutoAnimate();

	const validContextItems = Object.values(linkedDirState?.items ?? {}).filter((item) => item.project && item.org);

	if (!directoryPath) {
		return <InvalidWorkspaceView loading={isLoading || linkedDirState.loading} />;
	}

	if (validContextItems.length === 0) {
		return <NoContextView loading={isLoading || linkedDirState.loading} />;
	}

	if (linkedDirState?.components?.length === 0) {
		return <ComponentsEmptyView loading={isLoading || linkedDirState.loading} items={validContextItems} selected={linkedDirState.selected} />;
	}

	return (
		<>
			{(isLoading || linkedDirState.loading) && <ProgressIndicator />}
			<div className="flex w-full flex-col py-2" ref={componentListRef}>
				{linkedDirState?.components?.map((item, index) => (
					<div key={item.component?.metadata?.id}>
						<ComponentListItem
							item={item}
							org={linkedDirState.selected?.org}
							project={linkedDirState.selected?.project}
							isListLoading={isLoading}
							opened={
								openedComponentKey ===
								`${linkedDirState.selected?.org?.handle}-${linkedDirState.selected?.project?.handler}-${item?.component.metadata.name}`
							}
						/>
						{index !== linkedDirState.components?.length - 1 && <div className="h-[0.5px] bg-vsc-dropdown-border opacity-70" />}
					</div>
				))}
			</div>
		</>
	);
};
