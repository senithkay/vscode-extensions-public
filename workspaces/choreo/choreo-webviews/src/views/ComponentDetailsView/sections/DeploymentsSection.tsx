/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMutation } from "@tanstack/react-query";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import {
	ChoreoComponentType,
	type ComponentEP,
	type ComponentKind,
	type DeploymentTrack,
	EndpointDeploymentStatus,
	type Environment,
	type Organization,
	type Project,
	type StateReason,
	getTimeAgo,
	getTypeForDisplayType,
	toTitleCase,
} from "@wso2-enterprise/choreo-core";
import classNames from "classnames";
import clipboardy from "clipboardy";
import React, { type FC, type ReactNode, useState } from "react";
import { Button } from "../../../components/Button";
import { Codicon } from "../../../components/Codicon";
import { CommitLink } from "../../../components/CommitLink";
import { Divider } from "../../../components/Divider";
import { SkeletonText } from "../../../components/SkeletonText";
import { useGetDeployedEndpoints, useGetDeploymentStatus, useGetProxyDeploymentInfo } from "../../../hooks/use-queries";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";

interface Props {
	component: ComponentKind;
	project: Project;
	organization: Organization;
	deploymentTrack?: DeploymentTrack;
	envs: Environment[];
	loadingEnvs: boolean;
	triggeredDeployment: { [key: string]: boolean };
	onLoadDeploymentStatus: (env: Environment) => void;
}

export const DeploymentsSection: FC<Props> = (props) => {
	const { envs, loadingEnvs, deploymentTrack, component, organization, project, triggeredDeployment = {}, onLoadDeploymentStatus } = props;
	const [hasInactiveEndpoints, setHasInactiveEndpoints] = useState(false);
	const componentType = getTypeForDisplayType(component.spec.type);

	const { data: endpoints = [], refetch: refetchEndpoints } = useGetDeployedEndpoints(deploymentTrack, component, organization, {
		enabled: !!deploymentTrack?.id && componentType === ChoreoComponentType.Service,
		onSuccess: (data = []) => setHasInactiveEndpoints(data.some((item) => item.state !== "Active")),
		refetchInterval: hasInactiveEndpoints ? 5000 : false,
	});

	if (loadingEnvs) {
		return (
			<>
				{Array.from(new Array(2)).map((_, index) => (
					<EnvItemSkeleton key={index} />
				))}
			</>
		);
	}

	if (componentType === ChoreoComponentType.ApiProxy) {
		return (
			<>
				{envs?.map((item) => (
					<ProxyEnvItem
						key={item.name}
						env={item}
						component={component}
						organization={organization}
						project={project}
						deploymentTrack={deploymentTrack}
						triggeredDeployment={triggeredDeployment[`${deploymentTrack?.branch}-${item.name}`]}
						loadedDeploymentStatus={() => onLoadDeploymentStatus(item)}
					/>
				))}
			</>
		);
	}

	return (
		<>
			{envs?.map((item) => (
				<EnvItem
					key={item.name}
					env={item}
					endpoints={endpoints.filter((endpointItem) => endpointItem.environmentId === item.id)}
					refetchEndpoint={componentType === ChoreoComponentType.Service ? refetchEndpoints : undefined}
					component={component}
					organization={organization}
					project={project}
					deploymentTrack={deploymentTrack}
					triggeredDeployment={triggeredDeployment[`${deploymentTrack?.branch}-${item.name}`]}
					loadedDeploymentStatus={() => onLoadDeploymentStatus(item)}
				/>
			))}
		</>
	);
};

const EnvItem: FC<{
	component: ComponentKind;
	project: Project;
	organization: Organization;
	deploymentTrack?: DeploymentTrack;
	env: Environment;
	endpoints: ComponentEP[];
	refetchEndpoint: () => void;
	triggeredDeployment?: boolean;
	loadedDeploymentStatus: () => void;
}> = ({ organization, project, deploymentTrack, component, env, endpoints, refetchEndpoint, triggeredDeployment, loadedDeploymentStatus }) => {
	const componentType = getTypeForDisplayType(component.spec.type);
	const [envDetailsRef] = useAutoAnimate();
	const [isDeploymentInProgress, setDeploymentInProgress] = useState(false);

	const {
		data: deploymentStatus,
		isLoading: loadingDeploymentStatus,
		isRefetching: isRefetchingDeploymentStatus,
		refetch: refetchDeploymentStatus,
	} = useGetDeploymentStatus(deploymentTrack, component, organization, env, {
		enabled: !!deploymentTrack?.id,
		onSuccess: (data) => {
			if (refetchEndpoint) {
				refetchEndpoint();
			}
			refetchEndpoint();
			if (triggeredDeployment) {
				loadedDeploymentStatus();
			}
			setDeploymentInProgress(data?.deploymentStatusV2 === "IN_PROGRESS");
		},
		refetchInterval: isDeploymentInProgress ? 5000 : false,
	});

	let timeAgo = "";
	if (deploymentStatus?.build?.deployedAt) {
		timeAgo = getTimeAgo(new Date(deploymentStatus?.build?.deployedAt));
	}

	let statusStr = deploymentStatus?.deploymentStatusV2;
	if (statusStr === "ACTIVE") {
		statusStr = "Deployed";
	}

	const { viewRuntimeLogs } = useViewRunTimeLogs(component, organization, project, env, deploymentTrack);

	const { selectLogType } = useSelectLogType(componentType, (logType) => viewRuntimeLogs(logType));

	const activePublicEndpoints = endpoints?.filter((item) => item.visibility === "Public" && item.state === "Active");

	const getStatusText = () => {
		if (deploymentStatus) {
			if (triggeredDeployment) {
				if (["ERROR", "SUSPENDED", "ACTIVE"].includes(deploymentStatus?.deploymentStatusV2)) {
					return "Redeploying";
				}
				return "In Progress";
			}
			return toTitleCase(statusStr);
		}
		if (triggeredDeployment) {
			return "In Progress";
		}
		return "Not Deployed";
	};

	return (
		<>
			<Divider />
			<div>
				<div className="mb-3 flex items-center gap-2">
					<h3 className="text-base capitalize lg:text-lg">{env.name} Environment</h3>
					{!loadingDeploymentStatus && (
						<Button
							onClick={() => refetchDeploymentStatus()}
							appearance="icon"
							title={`${isRefetchingDeploymentStatus ? "Refreshing" : "Refresh"} Deployment Details`}
							className="opacity-50"
							disabled={isRefetchingDeploymentStatus}
						>
							<Codicon name="refresh" className={classNames(isRefetchingDeploymentStatus && "animate-spin")} />
						</Button>
					)}
				</div>
				<div className="flex flex-col gap-3 ">
					<div className="grid grid-cols-1 gap-2 gap-x-5 md:grid-cols-2 xl:grid-cols-3" ref={envDetailsRef}>
						{loadingDeploymentStatus ? (
							<>
								<GridColumnItem label="Status">
									<SkeletonText className="w-24" />
								</GridColumnItem>
								<GridColumnItem label="Commit">
									<SkeletonText className="w-12" />
								</GridColumnItem>
								<GridColumnItem label="URL">
									<SkeletonText className="max-w-44" />
								</GridColumnItem>
							</>
						) : (
							<>
								<GridColumnItem label="Status">
									<span
										className={classNames({
											"font-medium text-vsc-errorForeground": deploymentStatus?.deploymentStatusV2 === "ERROR",
											"text-vsc-charts-lines": deploymentStatus?.deploymentStatusV2 === "SUSPENDED",
											"text-vsc-foreground": deploymentStatus?.deploymentStatusV2 === "NOT_DEPLOYED",
											"font-medium text-vsc-charts-green": deploymentStatus?.deploymentStatusV2 === "ACTIVE",
											"animate-pulse text-vsc-charts-orange": deploymentStatus?.deploymentStatusV2 === "IN_PROGRESS" || triggeredDeployment,
										})}
									>
										{getStatusText()}
									</span>
									{timeAgo && <span className="ml-2 opacity-70">{`(${timeAgo})`}</span>}
								</GridColumnItem>
								{deploymentStatus?.build?.commit?.sha && (
									<GridColumnItem label="Commit">
										<CommitLink
											commitHash={deploymentStatus?.build?.commit?.sha}
											commitMessage={deploymentStatus?.build?.commit?.message}
											repoPath={component?.spec?.source?.github?.repository}
										/>
									</GridColumnItem>
								)}
								{["ACTIVE", "IN_PROGRESS"].includes(deploymentStatus?.deploymentStatusV2) && (
									<>
										{deploymentStatus?.invokeUrl && (
											<EndpointItem
												type="Invoke"
												name="invoke-url"
												state={EndpointDeploymentStatus.Active}
												url={deploymentStatus?.invokeUrl}
												showOpen={true}
											/>
										)}
										{componentType === ChoreoComponentType.Service && (
											<>
												{endpoints.map((item) => {
													const endpointsNodes: ReactNode[] = [];
													endpointsNodes.push(
														<EndpointItem
															type="Project"
															name={item.displayName}
															url={item.projectUrl}
															hasMultiple={endpoints.length > 1}
															state={item.state}
															stateReason={item.stateReason}
														/>,
													);
													if (item.visibility === "Organization") {
														endpointsNodes.push(
															<EndpointItem
																type="Organization"
																name={item.displayName}
																url={item.organizationUrl}
																hasMultiple={endpoints.length > 1}
																state={item.state}
																stateReason={item.stateReason}
															/>,
														);
													} else if (item.visibility === "Public") {
														endpointsNodes.push(
															<EndpointItem
																type="Public"
																name={item.displayName}
																url={item.publicUrl}
																showOpen={true}
																hasMultiple={endpoints.length > 1}
																state={item.state}
																stateReason={item.stateReason}
															/>,
														);
													}
													return endpointsNodes;
												})}
											</>
										)}

										{activePublicEndpoints.length > 0 && (
											<GridColumnItem label="Test">
												<VSCodeLink
													className="text-vsc-foreground"
													onClick={() =>
														ChoreoWebViewAPI.getInstance().openTestView({
															component,
															project,
															org: organization,
															env,
															deploymentTrack,
															endpoints: activePublicEndpoints,
														})
													}
												>
													Open Swagger View
												</VSCodeLink>
											</GridColumnItem>
										)}
									</>
								)}
								{["ACTIVE", "IN_PROGRESS", "ERROR"].includes(deploymentStatus?.deploymentStatusV2) && (
									<GridColumnItem label="Observability">
										<VSCodeLink className="text-vsc-foreground" onClick={() => selectLogType()}>
											View Runtime Logs
										</VSCodeLink>
									</GridColumnItem>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

const ProxyEnvItem: FC<{
	component: ComponentKind;
	project: Project;
	organization: Organization;
	deploymentTrack?: DeploymentTrack;
	env: Environment;
	triggeredDeployment?: boolean;
	loadedDeploymentStatus: () => void;
}> = ({ organization, project, deploymentTrack, component, env, triggeredDeployment, loadedDeploymentStatus }) => {
	const componentType = getTypeForDisplayType(component.spec.type);
	const [envDetailsRef] = useAutoAnimate();
	const latestApiVersion = component?.apiVersions?.find((item) => item.latest);

	const {
		data: proxyDeploymentData,
		refetch: refetchProxyDeploymentData,
		isLoading: isLoadingProxyDeploymentData,
		isRefetching: isRefetchingProxyDeploymentData,
	} = useGetProxyDeploymentInfo(component, organization, env, latestApiVersion, {
		enabled: !!latestApiVersion,
		onSuccess: () => {
			loadedDeploymentStatus();
		},
		refetchInterval: triggeredDeployment ? 5000 : false,
	});

	let timeAgo = "";
	if (proxyDeploymentData?.deployedTime) {
		timeAgo = getTimeAgo(new Date(proxyDeploymentData?.deployedTime));
	}

	const { viewRuntimeLogs } = useViewRunTimeLogs(component, organization, project, env, deploymentTrack);

	const { selectLogType } = useSelectLogType(componentType, (logType) => viewRuntimeLogs(logType));

	const getStatusText = () => {
		if (proxyDeploymentData) {
			if (triggeredDeployment) {
				return "Redeploying";
			}
			return toTitleCase(proxyDeploymentData?.lifecycleStatus);
		}
		if (triggeredDeployment) {
			return "In Progress";
		}
		return "Not Deployed";
	};

	return (
		<>
			<Divider />
			<div>
				<div className="mb-3 flex items-center gap-2">
					<h3 className="text-base capitalize lg:text-lg">{env.name} Environment</h3>
					{!isLoadingProxyDeploymentData && (
						<Button
							onClick={() => refetchProxyDeploymentData()}
							appearance="icon"
							title={`${isRefetchingProxyDeploymentData ? "Refreshing" : "Refresh"} Deployment Details`}
							className="opacity-50"
							disabled={isRefetchingProxyDeploymentData}
						>
							<Codicon name="refresh" className={classNames(isRefetchingProxyDeploymentData && "animate-spin")} />
						</Button>
					)}
				</div>
				<div className="flex flex-col gap-3 ">
					<div className="grid grid-cols-1 gap-2 gap-x-5 md:grid-cols-2 xl:grid-cols-3" ref={envDetailsRef}>
						<>
							{isLoadingProxyDeploymentData ? (
								<>
									<GridColumnItem label="Lifecycle Status">
										<SkeletonText className="w-24" />
									</GridColumnItem>
									<GridColumnItem label="Proxy URL">
										<SkeletonText className="max-w-44" />
									</GridColumnItem>
									<GridColumnItem label="Observability">
										<SkeletonText className="max-w-24" />
									</GridColumnItem>
								</>
							) : (
								<>
									<GridColumnItem label="Status">
										<span
											className={classNames({
												"font-medium text-vsc-charts-green": ["CREATED", "PUBLISHED"].includes(proxyDeploymentData?.lifecycleStatus),
												"animate-pulse text-vsc-charts-orange": triggeredDeployment,
											})}
										>
											{getStatusText()}
										</span>
										{timeAgo && <span className="ml-2 opacity-70">{`(${timeAgo})`}</span>}
									</GridColumnItem>
									{proxyDeploymentData?.invokeUrl && (
										<EndpointItem type="Proxy" name="proxy-url" state={EndpointDeploymentStatus.Active} url={proxyDeploymentData?.invokeUrl} />
									)}
									{proxyDeploymentData && (
										<GridColumnItem label="Observability">
											<VSCodeLink className="text-vsc-foreground" onClick={() => selectLogType()}>
												View Runtime Logs
											</VSCodeLink>
										</GridColumnItem>
									)}
									{proxyDeploymentData && (
										<GridColumnItem label="Test">
											<VSCodeLink
												className="text-vsc-foreground"
												onClick={() =>
													ChoreoWebViewAPI.getInstance().openTestView({
														component,
														project,
														org: organization,
														env,
														deploymentTrack,
														// TODO: have a better way to pass this prop
														// make it usable with both services and proxies
														endpoints: [
															{
																id: proxyDeploymentData?.apiRevision?.id,
																apimRevisionId: proxyDeploymentData?.apiRevision?.id,
																apimId: proxyDeploymentData?.apiId,
																publicUrl: proxyDeploymentData?.invokeUrl,
															} as any,
														],
													})
												}
											>
												Open Swagger View
											</VSCodeLink>
										</GridColumnItem>
									)}
								</>
							)}
						</>
					</div>
				</div>
			</div>
		</>
	);
};

const EnvItemSkeleton: FC = () => {
	return (
		<>
			<Divider />
			<div>
				<div className="mb-3 flex items-center gap-1">
					<SkeletonText className="w-52" />
					<div className="flex-1" />
					<Button disabled appearance="icon" className="opacity-50">
						<Codicon name="refresh" />
					</Button>
					<Button appearance="secondary" disabled>
						View Logs
					</Button>
				</div>
				<div className="flex flex-col gap-3 ">
					<div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
						<GridColumnItem label="Status">
							<SkeletonText className="w-24" />
						</GridColumnItem>
						<GridColumnItem label="Commit">
							<SkeletonText className="w-12" />
						</GridColumnItem>
						<GridColumnItem label="URL">
							<SkeletonText className="max-w-44" />
						</GridColumnItem>
					</div>
				</div>
			</div>
		</>
	);
};

const GridColumnItem: FC<{ label: string; children?: ReactNode }> = ({ label, children }) => (
	<div className="flex flex-col duration-200 hover:bg-vsc-editorHoverWidget-background">
		<div className="font-light text-[9px] opacity-75 md:text-xs">{label}</div>
		<div className="line-clamp-1 w-full">{children}</div>
	</div>
);

const EndpointItem: FC<{
	type: string;
	name: string;
	url: string;
	hasMultiple?: boolean;
	state?: EndpointDeploymentStatus;
	stateReason?: StateReason;
	showOpen?: boolean;
}> = ({ name, type, url, hasMultiple, state, showOpen, stateReason }) => {
	const { mutate: copyUrl } = useMutation({
		mutationFn: (url: string) => clipboardy.write(url),
		onSuccess: () => ChoreoWebViewAPI.getInstance().showInfoMsg("The URL has been copied to the clipboard."),
	});

	const openExternal = (url: string) => ChoreoWebViewAPI.getInstance().openExternal(url);

	return (
		<GridColumnItem label={`${type} URL ${hasMultiple ? `(${name})` : ""}`} key={`${name}-${type}`}>
			{url ? (
				<div className="flex items-center gap-1">
					<VSCodeLink
						title="Copy URL"
						className={classNames({
							"flex-1 text-vsc-foreground": true,
							"animate-pulse": [EndpointDeploymentStatus.Pending, EndpointDeploymentStatus.InProgress].includes(state),
							"text-vsc-errorForeground": state === EndpointDeploymentStatus.Error,
						})}
						onClick={() => copyUrl(url)}
					>
						<p className="line-clamp-1 break-all">
							{url ||
								([EndpointDeploymentStatus.Pending, EndpointDeploymentStatus.InProgress].includes(state) && <SkeletonText className="max-w-44" />) ||
								state === EndpointDeploymentStatus.Error ||
								"-"}
						</p>
					</VSCodeLink>
					{showOpen && state === EndpointDeploymentStatus.Active && (
						<Button appearance="icon" title="Open URL" onClick={() => openExternal(url)} disabled={!url}>
							<Codicon name="link-external" />
						</Button>
					)}
				</div>
			) : (
				<>
					{state === EndpointDeploymentStatus.Error ? (
						<div className="line-clamp-1 text-vsc-errorForeground" title={stateReason?.details}>
							{stateReason?.details ?? "Failed to load endpoint"}
						</div>
					) : (
						<SkeletonText className="w-24" />
					)}
				</>
			)}
		</GridColumnItem>
	);
};

const useViewRunTimeLogs = (
	component: ComponentKind,
	organization: Organization,
	project: Project,
	env: Environment,
	deploymentTrack: DeploymentTrack,
) => {
	const { mutate: viewRuntimeLogs } = useMutation({
		mutationFn: (logType: "component-application" | "component-gateway") =>
			ChoreoWebViewAPI.getInstance().viewRuntimeLogs({
				componentName: component.metadata.name,
				projectName: project.name,
				orgName: organization.name,
				deploymentTrackName: deploymentTrack?.branch,
				envName: env.name,
				type: logType,
			}),
	});
	return { viewRuntimeLogs };
};

const useSelectLogType = (componentType: string, onSelectLogType: (logType: "component-gateway" | "component-application") => void) => {
	const { mutate: selectLogType } = useMutation({
		mutationFn: async () => {
			if ([ChoreoComponentType.Service, ChoreoComponentType.Webhook].includes(componentType as ChoreoComponentType)) {
				const pickedItem = await ChoreoWebViewAPI.getInstance().showQuickPicks({
					title: "Select Log Type",
					items: [
						{ label: "Application Logs", item: "component-application" },
						{ label: "Gateway Logs", item: "component-gateway" },
					],
				});

				if (pickedItem) {
					onSelectLogType(pickedItem.item);
				}
			} else if (componentType === ChoreoComponentType.ApiProxy) {
				onSelectLogType("component-gateway");
			} else {
				onSelectLogType("component-application");
			}
		},
	});
	return { selectLogType };
};
