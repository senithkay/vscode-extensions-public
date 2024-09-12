/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { CommandIds, ComponentViewDrawers, ConnectionListItem, ContextStoreComponentState, getComponentKey } from "@wso2-enterprise/choreo-core";
import { type ExtensionContext, ViewColumn, commands, window, ProgressLocation } from "vscode";
import { contextStore } from "../stores/context-store";
import { showComponentDetailsView } from "../webviews/ComponentDetailsView";
import { getUserInfoForCmd, resolveQuickPick } from "./cmd-utils";
import { webviewStateStore } from "../stores/webview-state-store";
import { ext } from "../extensionVariables";

export function viewComponentDependencyCommand(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand(CommandIds.ViewDependency, async (params: { componentFsPath?: string; isCodeLens?: boolean, connectionConfig: string }) => {
			try {
				const userInfo = await getUserInfoForCmd("view component dependency");
				if (userInfo) {
					const selected = contextStore.getState().state.selected;
					if (!selected?.org || !selected.project) {
						window.showInformationMessage("This directory has not yet been linked to a Choreo project", "Link Directory").then((res) => {
							if (res === "Link Directory") {
								commands.executeCommand(CommandIds.CreateDirectoryContext);
							}
						});
						return;
					}

					const components = contextStore.getState().state.components;

					if(components?.length === 0){
						window.showInformationMessage("No components available within the project directory", "Create Component").then((res) => {
							if (res === "Create Component") {
								commands.executeCommand(CommandIds.CreateNewComponent);
							}
						});
						return;
					}

					let component: ContextStoreComponentState | undefined
					if(!params.componentFsPath){
						component = await resolveQuickPick(components?.map(item=>({label:item.component?.metadata?.displayName!, item})))
					}else{
						component = components?.find((item) => item.componentFsPath === params?.componentFsPath);
						if (!component?.component) {
							window
								.showInformationMessage(
									`Could not find any Choreo components that match this directory within the the linked project context. (${selected.project?.name})`,
									"Create Component",
									"Manage Context"
								)
								.then((res) => {
									if (res === "Create Component") {
										commands.executeCommand(CommandIds.CreateNewComponent);
									}
									if (res === "Manage Context") {
										commands.executeCommand(CommandIds.ManageDirectoryContext);
									}
								});
							return;
						}
					}

					if(!component?.component){
						throw new Error("Failed to select component")
					}

					let connectionItem: ConnectionListItem;

					if(params.connectionConfig){
						connectionItem = await window.withProgress(
							{ title: `Fetching connection details....`, location: ProgressLocation.Notification },
							() => ext.clients.rpcClient.getConnectionItem({orgId:selected?.org?.id?.toString()!, connectionGroupId: params.connectionConfig}),
						);
					}else{
						const connectionList = await window.withProgress(
							{ title: `Fetching connection list....`, location: ProgressLocation.Notification },
							() => ext.clients.rpcClient.getConnections({orgId:selected?.org?.id?.toString()!, projectId: selected.project?.id!, componentId: component?.component?.metadata?.id!}),
						);
						connectionItem = await resolveQuickPick(connectionList?.map(item=>({label:item.name, item})))
					}
					
					showComponentDetailsView(
						selected.org,
						selected.project,
						component.component,
						component.componentFsPath,
						params?.isCodeLens ? ViewColumn.Beside : undefined,
					);

					webviewStateStore.getState().onOpenComponentDrawer(getComponentKey(selected.org, selected.project, component.component), ComponentViewDrawers.ConnectionGuide,{connection:connectionItem})
				}
			} catch (err: any) {
				console.error("Failed to view component dependency", err);
				window.showErrorMessage(err?.message || "Failed to view component dependency");
			}
		}),
	);
}
