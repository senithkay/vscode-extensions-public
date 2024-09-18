/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { VSCodePanelTab, VSCodePanelView, VSCodePanels } from "@vscode/webview-ui-toolkit/react";
import type { MarketplaceItem, Organization } from "@wso2-enterprise/choreo-core";
import * as yaml from "js-yaml";
import React, { type FC, type ReactNode } from "react";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";
import { Badge } from "../../Badge";
import { Banner } from "../../Banner";
import { Button } from "../../Button";
import { Markdown } from "../../Markdown";
import { SwaggerUI } from "../../SwaggerUI";
import { SwaggerUISkeleton } from "../../SwaggerUI/SwaggerUI";

type Props = {
	item?: MarketplaceItem;
	org: Organization;
	onCreateClick: () => void;
	directoryPath: string;
};

const isXML = (xml: string) => {
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xml, "text/xml");
	const parseErrors = xmlDoc.getElementsByTagName("parsererror");
	return parseErrors.length === 0;
};

const isSwagger = (content: string) => content.includes("swagger") || content.includes("openapi");

const getIdlFileExt = (content: string | object) => {
	if (typeof content === "object") {
		return "json";
	}

	if (isXML(content)) {
		return "xml";
	}

	if (isSwagger(content)) {
		try {
			JSON.parse(content);
			return "json";
		} catch (e) {
			try {
				yaml.load(content);
				return "yaml";
			} catch (e1) {
				return "txt";
			}
		}
	}

	return "txt";
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

export const MarketplaceItemDetails: FC<Props> = ({ item, org, onCreateClick, directoryPath }) => {
	let visibility = "Project";
	if (item?.visibility.includes("PUBLIC")) {
		visibility = "Public";
	} else if (item?.visibility.includes("ORGANIZATION")) {
		visibility = "Organization";
	}

	const {
		data: serviceIdl,
		error: serviceIdlError,
		isLoading: isLoadingIdl,
	} = useQuery({
		queryKey: ["marketplace_idl", { orgId: org.id, serviceId: item.serviceId, type: item.serviceType }],
		queryFn: () =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getMarketplaceIdl({
				serviceId: item.serviceId,
				orgId: org.id.toString(),
			}),
	});

	const { mutate: switchDeploymentTrack } = useMutation({
		mutationFn: async (fileContent: string | object) => {
			ChoreoWebViewAPI.getInstance().saveFile({
				baseDirectory: directoryPath,
				fileContent: typeof fileContent === "object" ? JSON.stringify(fileContent) : fileContent,
				fileName: `idl.${getIdlFileExt(fileContent)}`,
				shouldOpen: true,
				dialogTitle: "Select directory to save IDL file",
			});
		},
		onError: () => ChoreoWebViewAPI.getInstance().showErrorMsg("Failed to download file."),
	});

	const panelTabs: { key: string; title: string; view: ReactNode }[] = [
		{
			key: "api-definition",
			title: "API Definition",
			view: (
				<div className="w-full">
					<div className="flex justify-end">
						<Button
							disabled={!serviceIdl?.content}
							appearance="secondary"
							title="Download API definition"
							onClick={() => switchDeploymentTrack(serviceIdl?.content)}
						>
							Download IDL
						</Button>
					</div>
					{serviceIdl?.content ? (
						<>
							{serviceIdl?.idlType === "OpenAPI" ? (
								<SwaggerUI
									spec={serviceIdl?.content}
									defaultModelExpandDepth={-1}
									docExpansion="list"
									tryItOutEnabled={false}
									plugins={[disableAuthorizeAndInfoPlugin, disableTryItOutPlugin]}
								/>
							) : (
								<div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center lg:px-8">
									<h4 className="font-semibold text-lg opacity-70">No preview available</h4>
									<p className="opacity-50">The IDL for this service is not available for preview. Please download the IDL to view it.</p>
								</div>
							)}
						</>
					) : (
						<>
							{isLoadingIdl && <SwaggerUISkeleton />}
							{serviceIdlError && <Banner type="error" title="Failed to load API definition" />}
						</>
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

	return (
		<div className="flex h-[calc(100vh-96px)] flex-col gap-2 overflow-y-auto">
			<div className="flex flex-wrap gap-1">
				<Badge>Type: {item?.serviceType}</Badge>
				<Badge>Version: {item?.version}</Badge>
				<Badge className="capitalize">Status: {item?.status}</Badge>
			</div>
			<p className="mt-4 text-xs">{item.summary}</p>
			<div className="mt-2 flex flex-wrap gap-1 opacity-80">
				{item.tags?.map((tagItem) => (
					<Badge key={tagItem} className="border-1 border-vsc-editorIndentGuide-background bg-vsc-editor-background">
						{tagItem}
					</Badge>
				))}
			</div>
			<div className="mt-3 flex flex-wrap justify-between gap-4">
				<Button onClick={onCreateClick}>Use Dependency</Button>
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
