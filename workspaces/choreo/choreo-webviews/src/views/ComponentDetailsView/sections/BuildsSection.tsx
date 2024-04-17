import React, { FC, ReactNode, useState } from "react";
import {
    CommitHistory,
    ComponentKind,
    ComponentsDetailsWebviewProps,
    CreateBuildReq,
    DeploymentTrack,
    Organization,
    Project,
    WebviewQuickPickItemKind,
} from "@wso2-enterprise/choreo-core";
import { Button, Divider } from "@wso2-enterprise/ui-toolkit";
import { Codicon } from "../../../components/Codicon";
import classNames from "classnames";
import { ContextMenu } from "../../../components/ContextMenu";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";

interface Props {
    component: ComponentKind;
    project: Project;
    organization: Organization;
}

export const BuildsSection: FC<Props> = ({ component, organization, project }) => {
    // get deployment track
    const [deploymentTrack, setDeploymentTrack] = useState<DeploymentTrack>(); // TODO: move this to store
    const [hasOngoingBuilds, setHasOngoingBuilds] = useState(false);

    // TODO: show a dropdown
    const { isLoading: isLoadingDeploymentTracks, data: deploymentTracks = [] } = useQuery({
        queryKey: [
            "get-deployment-tracks",
            { component: component.metadata.name, organization: organization.handle, project: project.handler },
        ],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getDeploymentTracks({
                compHandler: component.metadata.name,
                orgHandler: organization.handle,
                orgId: organization.id.toString(),
                projectId: project.id,
            }),
        onSuccess: (deploymentTracks) => {
            if (!deploymentTrack) {
                setDeploymentTrack(deploymentTracks?.find((item) => item.latest));
            }
        },
    });

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
        refetchOnWindowFocus: true,
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
            if(pickedItem?.item){
                triggerBuild({
                    commitHash: (pickedItem?.item as CommitHistory)?.sha,
                    componentName: component.metadata.name,
                    deploymentTrackId: deploymentTrack?.id,
                    projectHandle: project.handler,
                    orgId: organization.id?.toString(),
                });
            }
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between gap-1 mb-2">
                <h3 className="text-base lg:text-lg">Builds</h3>
                {!isLoadingBuilds && builds?.length > 0 && (
                    <Button
                        disabled={isLoadingCommits || commits.length === 0 || isTriggeringBuild}
                        onClick={() => selectCommitForBuild()}
                    >
                        {isTriggeringBuild ? "Triggering Build" : "Build Component"}
                    </Button>
                )}
            </div>

            {isLoadingBuilds ? (
                <>
                    <div className="grid-cols-2 md:grid-cols-4 md:grid hidden py-2 font-light text-xs">
                        <div>Build ID</div>
                        <div>Commit</div>
                        <div>Started</div>
                        <div>Status</div>
                    </div>
                    {Array.from(new Array(5)).map((_, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-2 md:grid-cols-4 py-1 hover:bg-vsc-editorHoverWidget-background"
                        >
                            <GridColumnItem label="Build ID" index={0} loading />
                            <GridColumnItem label="Commit ID" index={1} loading />
                            <GridColumnItem label="Started" index={2} loading />
                            <GridColumnItem label="Status" index={3} loading />
                        </div>
                    ))}
                </>
            ) : (
                <>
                    {builds.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 lg:p-10 p-5">
                            <p className="text-center">There aren't any builds available</p>
                            <Button
                                disabled={isLoadingCommits || commits.length === 0 || isTriggeringBuild}
                                onClick={() => selectCommitForBuild()}
                            >
                                Build Component
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid-cols-2 md:grid-cols-4 md:grid hidden py-2 font-light text-xs">
                                <div>Build ID</div>
                                <div>Commit</div>
                                <div>Started</div>
                                <div>Status</div>
                            </div>
                            {builds?.map((item) => {
                                let status: ReactNode = item.status?.conclusion;
                                if (item.status?.conclusion === "") {
                                    status = (
                                        <span className="text-vsc-charts-orange animate-pulse">
                                            {item.status?.status}
                                        </span>
                                    );
                                } else {
                                    if (item.status?.conclusion === "success") {
                                        status = <span className="text-vsc-charts-green">{status}</span>;
                                    } else if (item.status?.conclusion === "failure") {
                                        status = <span className="text-vsc-errorForeground">{status}</span>;
                                    }
                                }

                                return (
                                    <div
                                        key={item.status?.runId}
                                        className="grid grid-cols-2 md:grid-cols-4 py-1 hover:bg-vsc-editorHoverWidget-background"
                                    >
                                        <GridColumnItem label="Build ID" index={0}>
                                            {item.status?.runId}
                                        </GridColumnItem>
                                        <GridColumnItem label="Commit ID" index={1}>
                                            {getShortenedHash(item.spec?.revision)}
                                        </GridColumnItem>
                                        <GridColumnItem label="Started" index={2}>
                                            {getTimeAgo(item.status?.startedAt)}
                                        </GridColumnItem>
                                        <GridColumnItem label="Status" index={3}>
                                            <div className="flex gap-2 justify-start md:justify-between items-center flex-row-reverse md:flex-row">
                                                <div>{status}</div>
                                                <div className="flex gap-1">
                                                    {["success", "failed"].includes(item.status?.conclusion) && (
                                                        <Button appearance="icon" tooltip="View Logs">
                                                            <Codicon name="console" />
                                                        </Button>
                                                    )}
                                                    {item.status?.conclusion === "success" && (
                                                        <Button appearance="icon" tooltip="Deploy Build">
                                                            <Codicon name="cloud-upload" className="scale-110" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </GridColumnItem>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

const GridColumnItem: FC<{ label: string; index?: number; children?: ReactNode; loading?: boolean }> = ({
    label,
    index,
    children,
    loading,
}) => (
    <div className={classNames("flex flex-col", index % 2 == 1 && "md:items-start items-end")}>
        <div className="block: md:hidden text-[9px] font-light">{label}</div>
        <div className={classNames("w-full", index % 2 == 1 && "text-right md:text-left")}>{children}</div>
        {loading && <div className="animate-pulse h-4 my-0.5 w-20 bg-vsc-button-secondaryBackground rounded" />}
    </div>
);
const getShortenedHash = (hash: string) => hash?.substring(0, 7);

const getTimeAgo = (timestamp: string): string => {
    const currentTime = new Date();
    const previousTime = new Date(timestamp);
    const timeDifference = currentTime.getTime() - previousTime.getTime();

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
        return `${years} year${years > 1 ? "s" : ""} ago`;
    } else if (months > 0) {
        return `${months} month${months > 1 ? "s" : ""} ago`;
    } else if (days > 0) {
        return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
        return `Just now`;
    }
};
