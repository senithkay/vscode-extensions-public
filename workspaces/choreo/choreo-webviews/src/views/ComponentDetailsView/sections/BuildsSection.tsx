import React, { FC, ReactNode, useState } from "react";
import {
    BuildKind,
    CommitHistory,
    ComponentKind,
    CreateBuildReq,
    CreateDeploymentReq,
    DeploymentTrack,
    Environment,
    Organization,
    Project,
    WebviewQuickPickItemKind,
} from "@wso2-enterprise/choreo-core";
import { Button } from "../../../components/Button";
import { Codicon } from "../../../components/Codicon";
import classNames from "classnames";
import { SkeletonText } from "../../../components/SkeletonText";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { getShortenedHash, getTimeAgo } from "../../../utilities/helpers";
import { CommitLink } from "../../../components/CommitLink";
import { useAutoAnimate } from '@formkit/auto-animate/react'

interface Props {
    component: ComponentKind;
    project: Project;
    organization: Organization;
    deploymentTrack?: DeploymentTrack;
    envs: Environment[];
}

export const BuildsSection: FC<Props> = (props) => {
    const { component, organization, project, deploymentTrack } = props;
    const [hasOngoingBuilds, setHasOngoingBuilds] = useState(false);
    const [visibleBuildCount, setVisibleBuildCount] = useState(5);
    const [buildListRef] = useAutoAnimate()


    const { isLoading: isLoadingCommits, data: commits = [] } = useQuery({
        queryKey: [
            "get-commits",
            {
                component: component.metadata.name,
                organization: organization.handle,
                project: project.handler,
                branch: deploymentTrack?.branch,
            },
        ],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getCommits({
                compHandler: component.metadata.name,
                orgHandler: organization.handle,
                orgId: organization.id.toString(),
                projectId: project.id,
                branch: deploymentTrack.branch,
            }),
        enabled: !!deploymentTrack,
    });

    const {
        isLoading: isLoadingBuilds,
        isRefetching: isRefetchingBuilds,
        data: builds = [],
        refetch: refetchBuilds,
    } = useQuery({
        queryKey: [
            "get-builds",
            {
                component: component.metadata.name,
                organization: organization.handle,
                project: project.handler,
                branch: deploymentTrack?.branch,
            },
        ],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getBuilds({
                componentName: component.metadata.name,
                deploymentTrackId: deploymentTrack?.id,
                projectHandle: project.handler,
                orgId: organization.id?.toString(),
            }),
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
            refetchBuilds();
            ChoreoWebViewAPI.getInstance().showInfoMsg(`Build for selected commit has been successfully triggered`);
        },
    });

    const { mutate: selectCommitForBuild } = useMutation({
        mutationFn: async () => {
            const latestCommit = commits?.find((item) => item.isLatest);
            const pickedItem = await ChoreoWebViewAPI.getInstance().showQuickPicks({
                title: "Select Commit to Build",
                items: [
                    { kind: WebviewQuickPickItemKind.Separator, label: "Latest Commit" },
                    {
                        label: "Build Latest",
                        alwaysShow: true,
                        detail: latestCommit.message,
                        description: getShortenedHash(latestCommit.sha),
                        item: latestCommit,
                        picked: true,
                    },
                    { kind: WebviewQuickPickItemKind.Separator, label: "Previous Commits" },
                    ...commits
                        ?.filter((item) => !item.isLatest)
                        ?.map((item) => ({ label: item.message, description: getShortenedHash(item.sha), item })),
                ],
            });
            if (pickedItem?.item) {
                triggerBuild({
                    commitHash: (pickedItem?.item as CommitHistory)?.sha,
                    componentName: component.metadata.name,
                    deploymentTrackId: deploymentTrack?.id,
                    projectHandle: project.handler,
                    orgId: organization.id?.toString(),
                    displayType: component.spec.type,
                    gitRepoUrl: component.spec.source.github?.repository,
                    gitBranch: component.spec.source.github?.branch,
                    subPath: component.spec.source.github?.path
                });
            }
        },
    });

    return (
        <div>
            <div className="flex items-center gap-1 mb-3">
                <h3 className="text-base lg:text-lg flex-1">Builds</h3>
                <Button
                    onClick={() => refetchBuilds()}
                    appearance="icon"
                    title={`${isRefetchingBuilds ? "Refreshing": "Refresh"} Build List`}
                    className="opacity-50"
                    disabled={isRefetchingBuilds}
                >
                    <Codicon name="refresh" />
                </Button>
                {!isLoadingBuilds && (
                    <Button
                        disabled={isLoadingCommits || commits.length === 0 || isTriggeringBuild}
                        onClick={() => selectCommitForBuild()}
                    >
                        {isTriggeringBuild ? "Triggering Build" : "Build Component"}
                    </Button>
                )}
            </div>

            <div className="grid-cols-2 md:grid-cols-4 md:grid hidden py-2 font-light text-xs">
                <div>Build ID</div>
                <div>Commit</div>
                <div>Started</div>
                <div>Status</div>
            </div>
            <div className="lg:min-h-44" ref={buildListRef}>
                {isLoadingBuilds ? (
                    <>
                        {Array.from(new Array(5)).map((_, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-2 md:grid-cols-4 py-1 hover:bg-vsc-editorHoverWidget-background"
                            >
                                <GridColumnItem label="Build ID" index={0}>
                                    <SkeletonText className="w-20" />
                                </GridColumnItem>
                                <GridColumnItem label="Commit" index={1}>
                                    <div className="w-full flex justify-end md:justify-start">
                                        <SkeletonText className="w-12" />
                                    </div>
                                </GridColumnItem>
                                <GridColumnItem label="Started" index={2}>
                                    <SkeletonText className="w-20" />
                                </GridColumnItem>
                                <GridColumnItem label="Status" index={3}>
                                    <div className="flex gap-2 justify-start md:justify-between items-center flex-row-reverse md:flex-row">
                                        <SkeletonText className="w-12" />
                                        <SkeletonText className="w-10" />
                                    </div>
                                </GridColumnItem>
                            </div>
                        ))}
                        <div className="h-10 hidden lg:block" />
                    </>
                ) : (
                    <>
                        {builds.length === 0 ? (
                            <>
                                <div className="flex flex-col items-center justify-center gap-3 lg:min-h-44 p-8">
                                    <p className="text-center opacity-40 font-light text-sm">
                                        There aren't any builds available
                                    </p>
                                    <Codicon name="inbox" className="!text-4xl opacity-20" />
                                </div>
                            </>
                        ) : (
                            <>
                                {builds?.slice(0, visibleBuildCount)?.map((item) => (
                                    <BuiltItemRow key={item.status?.runId} item={item} {...props} />
                                ))}
                                {builds.length > visibleBuildCount && (
                                    <div className="flex flex-row justify-end mt-2">
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

const BuiltItemRow: FC<Props & { item: BuildKind }> = ({
    item,
    component,
    envs,
    organization,
    project,
    deploymentTrack,
}) => {
    const queryClient = useQueryClient();

    const { mutate: showBuiltLogs, isLoading: isLoadingBuildLogs } = useMutation({
        mutationFn: async (buildId: number) => {
            await ChoreoWebViewAPI.getInstance().viewBuildLogs({
                componentName: component.metadata.name,
                orgHandler: organization.handle,
                orgId: organization.id.toString(),
                projectId: project.id,
                buildId,
            });
        },
    });

    const { mutate: triggerDeployment, isLoading: isDeploying } = useMutation({
        mutationFn: async (params: { build: BuildKind; env: Environment }) => {
            await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().createDeployment({
                commitHash: params.build.spec.revision,
                buildRef: params.build.status.images?.[0]?.id,
                componentName: component.metadata.name,
                envId: params.env.id,
                envName: params.env.name,
                deploymentTrackId: deploymentTrack?.id,
                orgId: organization.id.toString(),
                orgHandler: organization.handle,
                projectId: project.id,
                projectHandle: project.handler,
            });
        },
        onSuccess: (_, params) => {
            queryClient.refetchQueries({
                queryKey: [
                    "get-deployment-status",
                    {
                        organization: organization.handle,
                        project: project.handler,
                        component: component.metadata.name,
                        deploymentTrackId: deploymentTrack?.id,
                        envId: params.env.id,
                    },
                ],
            });
            queryClient.refetchQueries({
                queryKey: [
                    "get-deployed-endpoints",
                    {
                        organization: organization.handle,
                        project: project.handler,
                        component: component.metadata.name,
                        deploymentTrackId: deploymentTrack?.id,
                    },
                ],
            });

            ChoreoWebViewAPI.getInstance().showInfoMsg(
                `Deployment for ${params.env?.name} has been successfully triggered`
            );
        },
    });

    const { mutate: selectEnvToDeploy } = useMutation({
        mutationFn: async ({ build }: { build: BuildKind }) => {
            const pickedItem = await ChoreoWebViewAPI.getInstance().showQuickPicks({
                title: "Select the environment to deploy the build",
                items: envs.map((item) => ({ label: item.name, item })),
            });
            if (pickedItem?.item) {
                triggerDeployment({ build: build, env: pickedItem.item });
            }
        },
    });

    let status: ReactNode = item.status?.conclusion;
    if (item.status?.conclusion === "") {
        status = (
            <span className="text-vsc-charts-orange animate-pulse capitalize">
                {item.status?.status?.replaceAll("_", " ")}
            </span>
        );
    } else {
        if (item.status?.conclusion === "success") {
            status = <span className="text-vsc-charts-green capitalize">{status}</span>;
        } else if (item.status?.conclusion === "failure") {
            status = <span className="text-vsc-errorForeground capitalize">{status}</span>;
        }
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 py-1 hover:bg-vsc-editorHoverWidget-background">
            <GridColumnItem label="Build ID" index={0}>
                {item.status?.runId}
            </GridColumnItem>
            <GridColumnItem label="Commit ID" index={1}>
                <CommitLink
                    commitHash={item.spec?.revision}
                    commitMessage={item.status?.gitCommit?.message}
                    repoPath={component?.spec?.source?.github?.repository}
                />
            </GridColumnItem>
            <GridColumnItem label="Started" index={2}>
                {getTimeAgo(item.status?.startedAt)}
            </GridColumnItem>
            <GridColumnItem label="Status" index={3}>
                <div className="flex gap-2 justify-start md:justify-between items-center flex-row-reverse md:flex-row">
                    <div>{status}</div>
                    <div className="flex gap-1">
                        {["success", "failure"].includes(item.status?.conclusion) && (
                            <Button
                                appearance="icon"
                                title="View Build Logs"
                                onClick={() => showBuiltLogs(item.status?.runId)}
                                disabled={isLoadingBuildLogs}
                            >
                                <Codicon name="console" />
                            </Button>
                        )}
                        {item.status?.conclusion === "success" && (
                            <Button
                                appearance="icon"
                                title="Deploy Build"
                                onClick={() => selectEnvToDeploy({ build: item })}
                                disabled={isDeploying}
                            >
                                <Codicon name="rocket" />
                            </Button>
                        )}
                    </div>
                </div>
            </GridColumnItem>
        </div>
    );
};

const GridColumnItem: FC<{ label: string; index?: number; children?: ReactNode }> = ({ label, index, children }) => (
    <div className={classNames("flex flex-col", index % 2 == 1 && "md:items-start items-end")}>
        <div className="block md:hidden text-[9px] font-light">{label}</div>
        <div className={classNames("w-full", index % 2 == 1 && "text-right md:text-left")}>{children}</div>
    </div>
);
