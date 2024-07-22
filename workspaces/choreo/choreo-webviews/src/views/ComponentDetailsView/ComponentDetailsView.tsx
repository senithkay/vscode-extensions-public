import { useMutation, useQuery } from "@tanstack/react-query";
import { type ComponentsDetailsWebviewProps, type DeploymentTrack, type Environment, WebviewQuickPickItemKind } from "@wso2-enterprise/choreo-core";
import React, { type FC, useEffect, useState } from "react";
import { Divider } from "../../components/Divider";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { BuildConfigsSection } from "./sections/BuildConfigsSection";
import { BuildsSection } from "./sections/BuildsSection";
import { DeploymentsSection } from "./sections/DeploymentsSection";
import { EndpointsSection } from "./sections/EndpointsSection";
import { HeaderSection } from "./sections/HeaderSection";

export const ComponentDetailsView: FC<ComponentsDetailsWebviewProps> = (props) => {
	const { component, project, organization, directoryPath } = props;

	const { data: deploymentTracks = [] } = useQuery({
		queryKey: ["get-deployment-tracks", { component: component.metadata.name, organization: organization.handle, project: project.handler }],
		queryFn: () =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getDeploymentTracks({
				componentId: component.metadata.id,
				orgHandler: organization.handle,
				orgId: organization.id.toString(),
				projectId: project.id,
			}),
	});

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

	const { data: envs = [], isLoading: loadingEnvs } = useQuery({
		queryKey: ["get-project-envs", { organization: organization.handle, project: project.handler }],
		queryFn: () =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getEnvs({
				orgId: organization.id.toString(),
				orgUuid: organization.uuid,
				projectId: project.id,
			}),
	});

	const [triggeredDeployment, setTriggeredDeployment] = useState<{ [key: string]: boolean }>();
	const onTriggerDeployment = (env: Environment, deploying: boolean) => {
		setTriggeredDeployment({ ...triggeredDeployment, [`${deploymentTrack?.branch}-${env.name}`]: deploying });
	};

	return (
		<div className="flex flex-row justify-center p-1 md:p-3 lg:p-4 xl:p-6">
			<div className="container">
				<div className="mx-auto max-w-6xl flex flex-col p-4">
					<HeaderSection
						{...props}
						deploymentTrack={deploymentTrack}
						allDeploymentTracks={deploymentTracks}
						onChangeDeploymentTrack={switchDeploymentTrack}
					/>
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-0">
						<Divider className="mt-4 block lg:hidden" />
						<div className="relative flex flex-col gap-6 col-span-1 lg:col-span-3 lg:p-4 pt-6 lg:border-r-1 border-vsc-editorIndentGuide-background">
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
						<div className="flex flex-col order-first lg:order-last lg:p-4 pt-6 gap-6">
							<BuildConfigsSection component={component} />
							<EndpointsSection component={component} directoryPath={directoryPath} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
