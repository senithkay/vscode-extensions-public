/*
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ChoreoBuildPackNames, CommandIds, type Organization, type Project } from "@wso2-enterprise/wso2-platform-core";
import { type ExtensionContext, commands, window } from "vscode";
import { waitForContextStoreToLoad } from "../stores/context-store";
import { dataCacheStore } from "../stores/data-cache-store";
import { cloneOrOpenDir } from "../uri-handlers";
import { getUserInfoForCmd, selectOrg, selectProject } from "./cmd-utils";
import { webviewStateStore } from "../stores/webview-state-store";

export function openCompSrcCommand(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand(
			CommandIds.OpenCompSrcDir,
			async (params: {
				org: Organization | string;
				project: Project | string;
				component: string;
				technology: string;
				integrationType: string;
				integrationDisplayType: string;
			}) => {
				try {
					const userInfo = await getUserInfoForCmd("clone project repository");
					if (userInfo) {
						if (params?.technology === ChoreoBuildPackNames.Ballerina || params?.technology === ChoreoBuildPackNames.MicroIntegrator) {
							webviewStateStore.getState().setExtensionName("Devant");
						}
						let selectedOrg: Organization;
						if (typeof params?.org === "string") {
							selectedOrg =
								userInfo.organizations.find((item) => item.handle === params?.org || item.name === params?.org) ??
								(await selectOrg(userInfo, "Select organization"));
						} else if (params?.org) {
							selectedOrg = params?.org;
						} else {
							selectedOrg = await selectOrg(userInfo, "Select organization");
						}

						let selectedProject: Project;
						if (typeof params?.project === "string") {
							selectedProject =
								dataCacheStore
									.getState()
									.getProjects(selectedOrg.handle)
									.find((item) => item.handler === params?.project || item.name === params?.project || item.id === params?.component) ||
								(await selectProject(
									selectedOrg,
									`Loading projects from '${selectedOrg.name}'`,
									`Select the project from '${selectedOrg.name}', that needs to be cloned`,
								));
						} else if (params?.project) {
							selectedProject = params?.project;
						} else {
							selectedProject = await selectProject(
								selectedOrg,
								`Loading projects from '${selectedOrg.name}'`,
								`Select the project from '${selectedOrg.name}', that needs to be cloned`,
							);
						}

						await waitForContextStoreToLoad();

						cloneOrOpenDir(
							selectedOrg,
							selectedProject,
							params?.component || null,
							params?.technology || null,
							params?.integrationType || null,
							params?.integrationDisplayType || null,
						);
					}
				} catch (err: any) {
					console.error("Failed to open project/component", err);
					window.showErrorMessage(err?.message || "Failed to open project/component");
				}
			},
		),
	);
}
