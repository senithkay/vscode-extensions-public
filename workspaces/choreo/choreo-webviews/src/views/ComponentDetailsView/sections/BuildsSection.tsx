/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import {
	type BuildKind,
	ChoreoComponentType,
	type ComponentDeployment,
	type ComponentKind,
	type CreateBuildReq,
	type CreateDeploymentReq,
	type DeploymentTrack,
	type Environment,
	type GetAutoBuildStatusResp,
	type Organization,
	type Project,
	type ToggleAutoBuildReq,
	type WebviewQuickPickItem,
	WebviewQuickPickItemKind,
	capitalizeFirstLetter,
	getTimeAgo,
	getTypeForDisplayType,
} from "@wso2-enterprise/choreo-core";
import classNames from "classnames";
import React, { type FC, type ReactNode, useState } from "react";
import { listTimeZones } from "timezone-support";
import { Button } from "../../../components/Button";
import { Codicon } from "../../../components/Codicon";
import { CommitLink } from "../../../components/CommitLink";
import { Empty } from "../../../components/Empty";
import { SkeletonText } from "../../../components/SkeletonText";
import { queryKeys, useGetAutoBuildStatus, useGetBuildList } from "../../../hooks/use-queries";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";

interface Props {
	component: ComponentKind;
	project: Project;
	organization: Organization;
	deploymentTrack?: DeploymentTrack;
	envs: Environment[];
	onTriggerDeployment: (env: Environment) => void;
}

export const BuildsSection: FC<Props> = (props) => {
	const { component, organization, project, deploymentTrack, envs } = props;
	const [hasOngoingBuilds, setHasOngoingBuilds] = useState(false);
	const [visibleBuildCount, setVisibleBuildCount] = useState(5);
	const [buildListRef] = useAutoAnimate();
	const queryClient = useQueryClient();
	const type = getTypeForDisplayType(component.spec.type);

	const {
		isLoading: isLoadingBuilds,
		isRefetching: isRefetchingBuilds,
		data: builds = [],
		refetch: refetchBuilds,
	} = useGetBuildList(deploymentTrack, component, project, organization, {
		onSuccess: (builds) => {
			setHasOngoingBuilds(builds.some((item) => item.status?.conclusion === ""));
		},
		enabled: !!deploymentTrack,
		refetchInterval: hasOngoingBuilds ? 10000 : false,
	});

	const { mutate: triggerBuild, isLoading: isTriggeringBuild } = useMutation({
		mutationFn: async (params: CreateBuildReq) => {
			await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().createBuild(params);
		},
		onSuccess: () => {
			const buildQueryKey = queryKeys.getBuilds(deploymentTrack, component, project, organization);
			const currentBuilds: BuildKind[] = queryClient.getQueryData(buildQueryKey) ?? [];
			queryClient.setQueryData(buildQueryKey, [{ status: { status: "Triggered" } } as BuildKind, ...currentBuilds]);
			refetchBuilds();
			ChoreoWebViewAPI.getInstance().showInfoMsg("Build for selected commit has been successfully triggered");
		},
	});

	const { mutate: selectCommitForBuild } = useMutation({
		mutationFn: async () => {
			const pickedItem = await ChoreoWebViewAPI.getInstance().selectCommitToBuild({
				component,
				deploymentTrack,
				org: organization,
				project,
			});

			if (pickedItem) {
				triggerBuild({
					commitHash: pickedItem.sha,
					componentName: component.metadata.name,
					deploymentTrackId:
						type === ChoreoComponentType.ApiProxy ? component?.apiVersions?.find((item) => item.latest)?.versionId : deploymentTrack?.id,
					projectHandle: project.handler,
					orgId: organization.id?.toString(),
					displayType: component.spec.type,
					gitRepoUrl: component.spec.source.github?.repository,
					gitBranch: component.spec.source.github?.branch,
					subPath: component.spec.source.github?.path,
				});
			}
		},
	});

	const buildInProgress = builds[0] && !builds[0].status?.conclusion;

	return (
		<div>
			<div className="mb-3 flex flex-wrap items-center justify-end gap-2">
				<h3 className="text-base lg:text-lg">Builds</h3>
				{!isLoadingBuilds && (
					<Button
						onClick={() => refetchBuilds()}
						appearance="icon"
						title={`${isRefetchingBuilds ? "Refreshing" : "Refresh"} Build List`}
						className="opacity-50"
						disabled={isRefetchingBuilds}
					>
						<Codicon name="refresh" className={classNames(isRefetchingBuilds && "animate-spin")} />
					</Button>
				)}
				<div className="flex-1" />
				{type !== ChoreoComponentType.ApiProxy && (
					<AutoBuildSwitch component={component} envs={envs} organization={organization} deploymentTrack={deploymentTrack} />
				)}
				{!isLoadingBuilds && (
					<Button disabled={isTriggeringBuild || buildInProgress} onClick={() => selectCommitForBuild()}>
						{isTriggeringBuild ? "Triggering Build" : buildInProgress ? "Building Component" : "Build Component"}
					</Button>
				)}
			</div>

			<div className="hidden grid-cols-2 py-2 font-light text-xs md:grid md:grid-cols-4">
				<div>Build ID</div>
				<div>Commit</div>
				<div>Started</div>
				<div>Status</div>
			</div>
			<div className="lg:min-h-44" ref={buildListRef}>
				{isLoadingBuilds ? (
					<>
						{Array.from(new Array(5)).map((_, index) => (
							<LoadingBuildRow key={index} />
						))}
						<div className="hidden h-10 lg:block" />
					</>
				) : (
					<>
						{builds.length === 0 ? (
							<Empty text="There aren't any builds available" />
						) : (
							<>
								{builds?.slice(0, visibleBuildCount)?.map((item, index) => (
									<React.Fragment key={index}>
										{item.status.status === "Triggered" ? (
											<LoadingBuildRow key={index} />
										) : (
											<BuiltItemRow key={item.status?.runId} item={item} {...props} />
										)}
									</React.Fragment>
								))}
								{builds.length > visibleBuildCount && (
									<div className="mt-2 flex flex-row justify-end">
										<Button appearance="icon" onClick={() => setVisibleBuildCount((v) => v + 5)}>
											View More
										</Button>
									</div>
								)}
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
};

const LoadingBuildRow = () => {
	return (
		<div className="grid grid-cols-2 py-1 duration-200 hover:bg-vsc-editorHoverWidget-background md:grid-cols-4">
			<GridColumnItem label="Build ID" index={0}>
				<SkeletonText className="w-20" />
			</GridColumnItem>
			<GridColumnItem label="Commit" index={1}>
				<div className="flex w-full justify-end md:justify-start">
					<SkeletonText className="w-12" />
				</div>
			</GridColumnItem>
			<GridColumnItem label="Started" index={2}>
				<SkeletonText className="w-20" />
			</GridColumnItem>
			<GridColumnItem label="Status" index={3}>
				<div className="flex flex-row-reverse items-center justify-start gap-2 md:flex-row md:justify-between">
					<SkeletonText className="w-12" />
					<SkeletonText className="w-10" />
				</div>
			</GridColumnItem>
		</div>
	);
};

const BuiltItemRow: FC<Props & { item: BuildKind }> = ({ item, component, envs, organization, project, deploymentTrack, onTriggerDeployment }) => {
	const queryClient = useQueryClient();
	const type = getTypeForDisplayType(component.spec?.type);

	const { mutate: showBuiltLogs, isLoading: isLoadingBuildLogs } = useMutation({
		mutationFn: async (buildId: number) => {
			await ChoreoWebViewAPI.getInstance().viewBuildLogs({
				componentId: component.metadata.id,
				displayType: component.spec.type,
				orgHandler: organization.handle,
				orgId: organization.id.toString(),
				projectId: project.id,
				buildId,
			});
		},
	});

	const { mutate: triggerDeployment, isLoading: isDeploying } = useMutation({
		mutationFn: async (params: { build: BuildKind; env: Environment }) => {
			const req: CreateDeploymentReq = {
				commitHash: params.build.spec.revision,
				buildRef: type === ChoreoComponentType.ApiProxy ? params.build.status?.runId?.toString() : params.build.status.images?.[0]?.id,
				componentName: component.metadata.name,
				componentId: component.metadata.id,
				componentDisplayType: component.spec.type,
				envId: params.env.id,
				envName: params.env.name,
				versionId: type === ChoreoComponentType.ApiProxy ? component?.apiVersions?.find((item) => item.latest)?.versionId : deploymentTrack?.id,
				orgId: organization.id.toString(),
				orgHandler: organization.handle,
				projectId: project.id,
				projectHandle: project.handler,
			};
			if (getTypeForDisplayType(component?.spec?.type) === ChoreoComponentType.ScheduledTask) {
				const deploymentData: ComponentDeployment | undefined = queryClient.getQueryData(
					queryKeys.getDeploymentStatus(deploymentTrack, component, organization, params.env),
				);
				const cronExpr = await ChoreoWebViewAPI.getInstance().showInputBox({
					title: "Enter Cron Expression",
					placeholder: "0 8 * * *",
					value: deploymentData?.cron || "",
					regex: {
						expression: /^((\*|\d+|\d+-\d+)(\/\d+)? ){4}(\*|\d+|\d+-\d+)(\/\d+)?$/,
						message: "Invalid cron expression",
					},
				});
				if (!cronExpr) {
					throw new Error("Failed to enter cron expression");
				}
				const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.toString() || "UTC";
				const cronTzItems: WebviewQuickPickItem[] = [];
				if (deploymentData?.cronTimezone) {
					cronTzItems.push(
						{ kind: WebviewQuickPickItemKind.Separator, label: "Selected Timezone" },
						{ label: deploymentData?.cronTimezone, alwaysShow: true, picked: true },
					);
				} else {
					cronTzItems.push(
						{ kind: WebviewQuickPickItemKind.Separator, label: "My Timezone" },
						{ label: userTimeZone, alwaysShow: true, picked: true },
					);
				}
				cronTzItems.push({ kind: WebviewQuickPickItemKind.Separator, label: "Other Timezones" }, ...listTimeZones().map((label) => ({ label })));

				const cronTz = await ChoreoWebViewAPI.getInstance().showQuickPicks({
					title: "Select Timezone",
					items: cronTzItems,
				});
				if (!cronTz) {
					throw new Error("Failed to select timezone");
				}
				req.cronExpression = cronExpr;
				req.cronTimezone = cronTz.label;
			}
			await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().createDeployment(req);
			onTriggerDeployment(params.env);
		},
		onSuccess: (_, params) => {
			queryClient.refetchQueries({
				queryKey: queryKeys.getDeploymentStatus(deploymentTrack, component, organization, params.env),
			});
			queryClient.refetchQueries({
				queryKey: queryKeys.getDeployedEndpoints(deploymentTrack, component, organization),
			});

			ChoreoWebViewAPI.getInstance().showInfoMsg(
				`Deployment of component ${component.metadata.displayName} for the ${params.env?.name} environment has been successfully triggered`,
			);
		},
	});

	const { mutate: selectEnvToDeploy } = useMutation({
		mutationFn: async ({ build }: { build: BuildKind }) => {
			const pickedItem = await ChoreoWebViewAPI.getInstance().showQuickPicks({
				title: "Select the environment to deploy the build",
				items: envs.map((item) => ({ label: capitalizeFirstLetter(item.name), item })),
			});
			if (pickedItem?.item) {
				triggerDeployment({ build: build, env: pickedItem.item });
			}
		},
	});

	let status: ReactNode = item.status?.conclusion;
	if (item.status?.conclusion === "") {
		status = <span className="animate-pulse text-vsc-charts-orange capitalize">{item.status?.status?.replaceAll("_", " ")}</span>;
	} else {
		if (item.status?.conclusion === "success") {
			status = <span className="text-vsc-charts-green capitalize">{status}</span>;
		} else if (item.status?.conclusion === "failure") {
			status = <span className="text-vsc-errorForeground capitalize">{status}</span>;
		}
	}

	return (
		<div className="grid grid-cols-2 py-1 duration-200 hover:bg-vsc-editorHoverWidget-background md:grid-cols-4">
			<GridColumnItem label="Build ID" index={0}>
				{item.status?.runId || "-"}
			</GridColumnItem>
			<GridColumnItem label="Commit ID" index={1}>
				<CommitLink
					commitHash={item.spec?.revision}
					commitMessage={item.status?.gitCommit?.message}
					repoPath={component?.spec?.source?.github?.repository}
				/>
			</GridColumnItem>
			<GridColumnItem label="Started" index={2}>
				{getTimeAgo(new Date(item.status?.startedAt))}
			</GridColumnItem>
			<GridColumnItem label="Status" index={3}>
				<div className="flex flex-row-reverse items-center justify-start gap-2 md:flex-row md:justify-between">
					<div>{status}</div>
					<div className="flex gap-1">
						{item.status?.conclusion === "success" && (
							<Button appearance="icon" title="Deploy Build" onClick={() => selectEnvToDeploy({ build: item })} disabled={isDeploying}>
								<Codicon name="rocket" />
							</Button>
						)}
						{["success", "failure"].includes(item.status?.conclusion) && (
							<Button appearance="icon" title="View Build Logs" onClick={() => showBuiltLogs(item.status?.runId)} disabled={isLoadingBuildLogs}>
								<Codicon name="console" />
							</Button>
						)}
					</div>
				</div>
			</GridColumnItem>
		</div>
	);
};

const GridColumnItem: FC<{ label: string; index?: number; children?: ReactNode }> = ({ label, index, children }) => (
	<div className={classNames("flex flex-col", index % 2 === 1 && "items-end md:items-start")}>
		<div className="block font-light text-[9px] md:hidden">{label}</div>
		<div className={classNames("w-full", index % 2 === 1 && "text-right md:text-left")}>{children}</div>
	</div>
);

const AutoBuildSwitch: FC<{
	component: ComponentKind;
	organization: Organization;
	deploymentTrack?: DeploymentTrack;
	envs: Environment[];
}> = ({ component, envs = [], organization, deploymentTrack }) => {
	const queryClient = useQueryClient();

	const { data: autoBuildStatus, isLoading: isLoadingAutoBuildStatus } = useGetAutoBuildStatus(component, deploymentTrack, organization, {
		enabled: envs?.length > 0 && !!deploymentTrack,
	});

	const { mutate: toggleAutoBuild } = useMutation({
		mutationFn: (autoBuildEnabled: boolean) => {
			const rpcClient = ChoreoWebViewAPI.getInstance().getChoreoRpcClient();
			const req: ToggleAutoBuildReq = {
				componentId: component.metadata?.id,
				orgId: organization.id.toString(),
				versionId: deploymentTrack.id,
				// will always be dev env
				envId: envs[0]?.id ?? "",
			};
			return autoBuildEnabled ? rpcClient.enableAutoBuildOnCommit(req) : rpcClient.disableAutoBuildOnCommit(req);
		},
		onMutate: async (autoBuildEnabled) => {
			const queryKey = queryKeys.getAutoBuildStatus(component, deploymentTrack, organization);
			await queryClient.cancelQueries({ queryKey });
			const previous: GetAutoBuildStatusResp | undefined = queryClient.getQueryData(queryKey);
			if (previous) {
				queryClient.setQueryData(queryKey, { ...previous, autoBuildEnabled });
			}
			return { previous };
		},
		onError: (_err, _resp, context) => {
			ChoreoWebViewAPI.getInstance().showErrorMsg("Failed to toggle auto build on commit");
			const queryKey = queryKeys.getAutoBuildStatus(component, deploymentTrack, organization);
			queryClient.setQueryData(queryKey, context.previous);
		},
		onSettled: () => {
			const queryKey = queryKeys.getAutoBuildStatus(component, deploymentTrack, organization);
			queryClient.invalidateQueries({ queryKey });
		},
	});

	if (envs.length === 0) {
		return null;
	}

	return (
		<VSCodeCheckbox
			className={classNames("flex-row-reverse text-[11px]", isLoadingAutoBuildStatus && "animate-pulse")}
			disabled={isLoadingAutoBuildStatus}
			checked={autoBuildStatus?.autoBuildEnabled}
			onChange={(event: any) => toggleAutoBuild(event.target.checked)}
		>
			Auto Build on Commit
		</VSCodeCheckbox>
	);
};
