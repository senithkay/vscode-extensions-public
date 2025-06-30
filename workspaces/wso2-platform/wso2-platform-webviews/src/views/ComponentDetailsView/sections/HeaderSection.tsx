/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useMutation } from "@tanstack/react-query";
import {
	CommandIds,
	type ComponentsDetailsWebviewProps,
	type DeploymentTrack,
	type IDeleteComponentCmdParams,
	type IOpenInConsoleCmdParams,
	getComponentKindRepoSource,
	getComponentTypeText,
	getIntegrationComponentTypeText,
	getTypeForDisplayType,
} from "@wso2-enterprise/wso2-platform-core";
import React, { type FC } from "react";
import { Button } from "../../../components/Button";
import { Codicon } from "../../../components/Codicon";
import { HeaderSection as HeaderSectionView } from "../../../components/HeaderSection";
import { useExtWebviewContext } from "../../../providers/ext-vewview-ctx-provider";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";

export const HeaderSection: FC<
	ComponentsDetailsWebviewProps & {
		allDeploymentTracks: DeploymentTrack[];
		deploymentTrack: DeploymentTrack;
		onChangeDeploymentTrack: () => void;
	}
> = ({ allDeploymentTracks, onChangeDeploymentTrack, deploymentTrack, component, organization, project }) => {
	const { extensionName } = useExtWebviewContext();
	const openInConsole = () =>
		ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.OpenInConsole, {
			component,
			project,
			organization,
		} as IOpenInConsoleCmdParams);

	const openGitPage = () => ChoreoWebViewAPI.getInstance().openExternal(getComponentKindRepoSource(component.spec.source).repo);

	const { mutate: onDeleteComponent, isLoading: deletingComponent } = useMutation({
		mutationFn: () =>
			ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.DeleteComponent, {
				component,
				project,
				organization,
			} as IDeleteComponentCmdParams),
	});

	const headerLabels: { label: string; value: string; onClick?: () => void; onClickTitle?: string }[] = [];

	if (deploymentTrack) {
		if (allDeploymentTracks.length > 1) {
			headerLabels.push({
				label: "Deployment Track",
				value: deploymentTrack?.branch,
				onClick: () => onChangeDeploymentTrack(),
				onClickTitle: "Change Deployment Track",
			});
		} else {
			headerLabels.push({ label: "Deployment Track", value: deploymentTrack?.branch });
		}
	}

	headerLabels.push({ label: "Project", value: project.name }, { label: "Organization", value: organization.name });
	const componentTypeTxt = getTypeForDisplayType(component?.spec?.type);
	return (
		<HeaderSectionView
			title={component.metadata.displayName}
			secondaryTitle={
				extensionName === "Devant"
					? getIntegrationComponentTypeText(componentTypeTxt, component?.spec?.subType)
					: getComponentTypeText(componentTypeTxt)
			}
			tags={headerLabels}
			buttons={[
				{ label: "Open in Console", onClick: () => openInConsole() },
				{ label: "Open Git Repository", onClick: () => openGitPage() },
			]}
			secondaryIcon={
				<Button
					appearance="icon"
					onClick={() => onDeleteComponent()}
					disabled={deletingComponent}
					title={`Delete ${extensionName === "Devant" ? "Integration" : "Component"}`}
					className="text-vsc-descriptionForeground duration-200 hover:text-vsc-errorForeground"
				>
					<Codicon name="trash" />
				</Button>
			}
		/>
	);
};
