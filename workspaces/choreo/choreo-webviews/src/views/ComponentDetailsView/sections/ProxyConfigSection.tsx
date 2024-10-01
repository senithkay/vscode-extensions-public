/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ChoreoComponentType, type ComponentKind, getTypeForDisplayType } from "@wso2-enterprise/choreo-core";
import React, { type FC } from "react";
import { Button } from "../../../components/Button";
import { Codicon } from "../../../components/Codicon";
import { useGoToSource } from "../../../hooks/use-queries";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";
import { RightPanelSection, RightPanelSectionItem } from "./RightPanelSection";

interface Props {
	directoryPath: string;
	component: ComponentKind;
	showDivider?: boolean;
}

export const ProxyConfigSection: FC<Props> = ({ directoryPath, component, showDivider }) => {
	const componentType = getTypeForDisplayType(component?.spec?.type);

	const { data: localProxyConfig } = useQuery({
		queryKey: ["get-local-proxy-config", { directoryPath }],
		queryFn: () => ChoreoWebViewAPI.getInstance().readLocalProxyConfig(directoryPath),
		enabled: !!directoryPath && componentType === ChoreoComponentType.ApiProxy,
		refetchOnWindowFocus: true,
	});

	const { openFile } = useGoToSource();

	return (
		<>
			{localProxyConfig?.proxy && Object.keys(localProxyConfig?.proxy).length > 0 && (
				<RightPanelSection
					key="proxy-local-config"
					title={
						<div className="flex items-center justify-between gap-2">
							<span className="line-clamp-1 break-all">Proxy Configurations</span>
							<Button appearance="icon" title="Edit endpoint" onClick={() => openFile([localProxyConfig.filePath])}>
								<Codicon name="edit" />
							</Button>
						</div>
					}
					showDivider={showDivider}
				>
					{localProxyConfig?.proxy?.type && <RightPanelSectionItem label="Type" value={localProxyConfig?.proxy?.type} />}

					{localProxyConfig?.proxy?.schemaFilePath && (
						<RightPanelSectionItem
							label="API Schema"
							value={
								<VSCodeLink onClick={() => openFile([directoryPath, localProxyConfig?.proxy?.schemaFilePath])} className="text-vsc-foreground">
									View
								</VSCodeLink>
							}
						/>
					)}
					{localProxyConfig?.proxy?.docPath && (
						<RightPanelSectionItem
							label="Documentation"
							value={
								<VSCodeLink onClick={() => openFile([directoryPath, localProxyConfig?.proxy?.docPath])} className="text-vsc-foreground">
									View
								</VSCodeLink>
							}
						/>
					)}
					{localProxyConfig?.proxy?.thumbnailPath && (
						<RightPanelSectionItem
							label="Thumbnail"
							value={
								<VSCodeLink onClick={() => openFile([directoryPath, localProxyConfig?.proxy?.thumbnailPath])} className="ext-vsc-foreground">
									View
								</VSCodeLink>
							}
						/>
					)}
					{localProxyConfig?.proxy?.networkVisibilities?.length > 0 && (
						<RightPanelSectionItem
							label={localProxyConfig?.proxy?.networkVisibilities?.length > 1 ? "Network Visibilities" : "Network Visibility"}
							value={localProxyConfig?.proxy?.networkVisibilities?.join(",")}
						/>
					)}
				</RightPanelSection>
			)}
		</>
	);
};
