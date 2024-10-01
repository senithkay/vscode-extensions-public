/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ChoreoComponentType,
	type ComponentsDetailsWebviewProps,
	type DeploymentTrack,
	type Environment,
	WebviewQuickPickItemKind,
	getTypeForDisplayType,
} from "@wso2-enterprise/choreo-core";
import React, { type FC, useEffect, useState } from "react";
import { Banner } from "../../components/Banner";
import { Divider } from "../../components/Divider";
import { queryKeys, useGetProjectEnvs } from "../../hooks/use-queries";
import { ChoreoWebViewAPI } from "../../utilities/vscode-webview-rpc";
import { BuildConfigsSection } from "./sections/BuildConfigsSection";
import { BuildsSection } from "./sections/BuildsSection";
import { ConnectionsSection } from "./sections/ConnectionsSection";
import { DeploymentsSection } from "./sections/DeploymentsSection";
import { EndpointsSection } from "./sections/EndpointsSection";
import { HeaderSection } from "./sections/HeaderSection";
import { ProxyConfigSection } from "./sections/ProxyConfigSection";
import { RightPanelSection } from "./sections/RightPanelSection";

export const ComponentDetailsView: FC<ComponentsDetailsWebviewProps> = (props) => {
	const { component, project, organization, directoryPath, initialEnvs = [] } = props;
	const deploymentTracks = component?.deploymentTracks ?? [];
	const [rightPanelRef] = useAutoAnimate();
	const type = getTypeForDisplayType(props.component.spec?.type);

	const [deploymentTrack, setDeploymentTrack] = useState<DeploymentTrack | undefined>(deploymentTracks?.find((item) => item.latest));

	useEffect(() => {
		if (!deploymentTrack || !deploymentTracks?.find((item) => item.id === deploymentTrack.id)) {
			setDeploymentTrack(deploymentTracks?.find((item) => item.latest));
		}
	}, [deploymentTrack, deploymentTracks]);

	const { mutate: switchDeploymentTrack } = useMutation({
		mutationFn: async () => {
			const pickedItem = await ChoreoWebViewAPI.getInstance().showQuickPicks({
				title: "Select Deployment Track",
				items: [
					{ kind: WebviewQuickPickItemKind.Separator, label: "Selected" },
					{ label: deploymentTrack.branch, picked: true, detail: deploymentTrack.description },
					{ kind: WebviewQuickPickItemKind.Separator, label: "Available Tracks" },
					...deploymentTracks
						.filter((item) => item.branch !== deploymentTrack.branch)
						.map((item) => ({ label: item.branch, detail: item.description, item })),
				],
			});
			if (pickedItem?.item) {
				setDeploymentTrack(pickedItem.item);
			}
		},
	});

	const { data: envs = [], isLoading: loadingEnvs } = useGetProjectEnvs(project, organization, {
		initialData: initialEnvs,
		enabled: initialEnvs.length === 0,
	});

	const [triggeredDeployment, setTriggeredDeployment] = useState<{ [key: string]: boolean }>();
	const onTriggerDeployment = (env: Environment, deploying: boolean) => {
		setTriggeredDeployment({ ...triggeredDeployment, [`${deploymentTrack?.branch}-${env.name}`]: deploying });
	};

	const { data: hasLocalChanges } = useQuery({
		queryKey: queryKeys.getHasLocalChanges(directoryPath),
		queryFn: () => ChoreoWebViewAPI.getInstance().hasDirtyLocalGitRepo(directoryPath),
		enabled: !!directoryPath,
		refetchOnWindowFocus: true,
	});

	const { data: configDriftFiles = [] } = useQuery({
		queryKey: queryKeys.getComponentConfigDraft(directoryPath, component),
		queryFn: () =>
			ChoreoWebViewAPI.getInstance().getConfigFileDrifts({
				type: getTypeForDisplayType(component?.spec?.type),
				repoDir: directoryPath,
				branch: component?.spec?.source?.github?.branch || component?.spec?.source?.bitbucket?.branch,
				repoUrl: component?.spec?.source?.github?.repository || component?.spec?.source?.bitbucket?.repository,
			}),
		enabled: !!directoryPath,
		refetchOnWindowFocus: true,
	});

	return (
		<div className="flex flex-row justify-center p-1 md:p-3 lg:p-4 xl:p-6">
			<div className="container">
				<div className="mx-auto flex max-w-6xl flex-col p-4">
					<HeaderSection
						{...props}
						deploymentTrack={deploymentTrack}
						allDeploymentTracks={deploymentTracks}
						onChangeDeploymentTrack={switchDeploymentTrack}
					/>
					<div className="grid grid-cols-1 gap-3 lg:grid-cols-4 lg:gap-0">
						<Divider className="mt-4 block lg:hidden" />
						<div className="relative col-span-1 flex flex-col gap-6 border-vsc-editorIndentGuide-background pt-6 lg:col-span-3 lg:border-r-1 lg:p-4">
							<BuildsSection {...props} deploymentTrack={deploymentTrack} envs={envs} onTriggerDeployment={(env) => onTriggerDeployment(env, true)} />
							<DeploymentsSection
								{...props}
								deploymentTrack={deploymentTrack}
								envs={envs}
								loadingEnvs={loadingEnvs}
								triggeredDeployment={triggeredDeployment}
								onLoadDeploymentStatus={(env) => onTriggerDeployment(env, false)}
							/>
						</div>
						<div className="order-first flex flex-col gap-6 pt-6 lg:order-last lg:p-4" ref={rightPanelRef}>
							{configDriftFiles?.length > 0 && (
								<RightPanelSection showDivider={false}>
									<Banner
										type="warning"
										className="my-1"
										title="Configuration Drift Detected"
										subTitle={`Please commit and push the changes in the ${configDriftFiles.join(",")} ${configDriftFiles?.length > 1 ? "files" : "file"} to your remote Git repo.`}
									/>
								</RightPanelSection>
							)}
							{configDriftFiles.length === 0 && hasLocalChanges && (
								<RightPanelSection showDivider={false}>
									<Banner
										className="my-1"
										title="Local Changes Detected"
										subTitle="Please commit and push your local changes to the remote repository."
									/>
								</RightPanelSection>
							)}
							{type !== ChoreoComponentType.ApiProxy && (
								<BuildConfigsSection component={component} showDivider={!!directoryPath && (hasLocalChanges || configDriftFiles?.length > 0)} />
							)}
							{type === ChoreoComponentType.Service && <EndpointsSection component={component} directoryPath={directoryPath} />}
							{type !== ChoreoComponentType.ApiProxy && (
								<ConnectionsSection org={organization} project={project} component={component} directoryPath={directoryPath} />
							)}
							{type === ChoreoComponentType.ApiProxy && (
								<ProxyConfigSection
									component={component}
									directoryPath={directoryPath}
									showDivider={!!directoryPath && (hasLocalChanges || configDriftFiles?.length > 0)}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
