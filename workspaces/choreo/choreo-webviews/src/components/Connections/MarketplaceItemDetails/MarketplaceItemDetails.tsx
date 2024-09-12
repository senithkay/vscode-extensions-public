/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useQuery } from "@tanstack/react-query";
import { VSCodePanelTab, VSCodePanelView, VSCodePanels } from "@vscode/webview-ui-toolkit/react";
import type { MarketplaceItem, Organization } from "@wso2-enterprise/choreo-core";
import React, { type FC, type ReactNode } from "react";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";
import { Badge } from "../../Badge";
import { Button } from "../../Button";
import { Markdown } from "../../Markdown";
import { SwaggerUI } from "../../SwaggerUI";
import { SwaggerUISkeleton } from "../../SwaggerUI/SwaggerUI";

type Props = {
	item?: MarketplaceItem;
	org: Organization;
	onCreateClick: () => void;
};

const disableAuthorizeAndInfoPlugin = () => ({
	wrapComponents: { info: () => (): any => null, authorizeBtn: () => (): any => null },
});
const disableTryItOutPlugin = () => ({
	statePlugins: {
		spec: {
			wrapSelectors: {
				servers: () => (): any[] => [],
				securityDefinitions: () => (): any => null,
				schemes: () => (): any[] => [],
				allowTryItOutFor: () => () => false,
			},
		},
	},
});

export const MarketplaceItemDetails: FC<Props> = ({ item, org, onCreateClick }) => {
	let visibility = "Project";
	if (item?.visibility.includes("PUBLIC")) {
		visibility = "Public";
	} else if (item?.visibility.includes("ORGANIZATION")) {
		visibility = "Organization";
	}

	const {
		data: serviceIdl,
		// todo: handle error scenario
		// error: serviceIdlError,
		isLoading: isLoadingIdl,
	} = useQuery({
		queryKey: ["marketplace_idl", { orgId: org.id, serviceId: item.serviceId }],
		queryFn: () =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getMarketplaceIdl({
				serviceId: item.serviceId,
				orgId: org.id.toString(),
			}),
	});

	const swaggerSpec = serviceIdl?.content;

	const panelTabs: { key: string; title: string; view: ReactNode }[] = [
		{
			key: "api-definition",
			title: "API Definition",
			view: (
				<div className="w-full">
					{isLoadingIdl && <SwaggerUISkeleton />}
					{swaggerSpec && (
						<SwaggerUI
							spec={swaggerSpec}
							defaultModelExpandDepth={-1}
							docExpansion="list"
							tryItOutEnabled={false}
							plugins={[disableAuthorizeAndInfoPlugin, disableTryItOutPlugin]}
						/>
					)}
				</div>
			),
		},
	];

	if (item.description) {
		panelTabs.unshift({
			key: "overview",
			title: "Overview",
			view: <Markdown>{item.description}</Markdown>,
		});
	}

	// TODO: show other marketplace item details as well

	return (
		<div className="flex h-[calc(100vh-96px)] flex-col gap-2 overflow-y-auto">
			<div className="flex flex-wrap gap-1">
				<Badge>Type: {item?.serviceType}</Badge>
				<Badge>Version: {item?.version}</Badge>
				<Badge className="capitalize">Status: {item?.status}</Badge>
			</div>
			<div className="mt-3 flex flex-wrap justify-between gap-4">
				<Button onClick={onCreateClick}>Use Dependency</Button>
				{/** TODO: fix Download IDL */}
				<Button disabled appearance="secondary">
					Download IDL
				</Button>
			</div>
			<div className="mt-5">
				<VSCodePanels>
					{panelTabs.map((item) => (
						<VSCodePanelTab id={`tab-${item.key}`} key={`tab-${item.key}`}>
							{item.title}
						</VSCodePanelTab>
					))}
					{panelTabs.map((item) => (
						<VSCodePanelView id={`view-${item.key}`} key={`view-${item.key}`}>
							{item.view}
						</VSCodePanelView>
					))}
				</VSCodePanels>
			</div>
		</div>
	);
};
