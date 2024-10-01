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
}

export const EndpointsSection: FC<Props> = ({ directoryPath, component }) => {
	const componentType = getTypeForDisplayType(component?.spec?.type);

	const { data: endpointsResp } = useQuery({
		queryKey: ["get-service-endpoints", { directoryPath }],
		queryFn: () => ChoreoWebViewAPI.getInstance().readLocalEndpointsConfig(directoryPath),
		enabled: !!directoryPath && componentType === ChoreoComponentType.Service,
		refetchOnWindowFocus: true,
	});

	const { openFile } = useGoToSource();

	return (
		<>
			{endpointsResp?.endpoints?.map((item) => (
				<RightPanelSection
					key={item.name}
					title={
						<div className="flex items-center justify-between gap-2">
							<span className="line-clamp-1 break-all">{`Endpoint: ${item.name}`}</span>
							<Button appearance="icon" title="Edit endpoint" onClick={() => openFile([endpointsResp.filePath])}>
								<Codicon name="edit" />
							</Button>
						</div>
					}
				>
					<RightPanelSectionItem label="Port" value={item.port} />
					{item.type && <RightPanelSectionItem label="Type" value={item.type} />}
					{item.networkVisibility && <RightPanelSectionItem label="Network Visibility" value={item.networkVisibility} />}
					{item.context && <RightPanelSectionItem label="API Context" value={item.context} />}
					{item.schemaFilePath && (
						<RightPanelSectionItem
							label="API Schema"
							value={
								<VSCodeLink onClick={() => openFile([directoryPath, item.schemaFilePath])} className="text-vsc-foreground">
									View
								</VSCodeLink>
							}
						/>
					)}
				</RightPanelSection>
			))}
		</>
	);
};
