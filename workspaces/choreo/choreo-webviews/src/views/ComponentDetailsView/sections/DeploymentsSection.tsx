import React, { FC, ReactNode, useState } from "react";
import {
    ChoreoComponentType,
    CommitHistory,
    ComponentEP,
    ComponentKind,
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { getShortenedHash, getTimeAgo, toTitleCase } from "../../../utilities/helpers";
import { Divider } from "../../../components/Divider";
import { getTypeForDisplayType } from "../utils";
import { CommitLink } from "../../../components/CommitLink";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import clipboardy from "clipboardy";
import { useAutoAnimate } from "@formkit/auto-animate/react";

interface Props {
    component: ComponentKind;
    project: Project;
    organization: Organization;
    deploymentTrack?: DeploymentTrack;
    envs: Environment[];
    loadingEnvs: boolean;
}

export const DeploymentsSection: FC<Props> = (props) => {
    const { envs, loadingEnvs, deploymentTrack, component, organization, project } = props;
    const [hasInactiveEndpoints, setHasInactiveEndpoints] = useState(false);

    const { data: endpoints = [], refetch: refetchEndpoints } = useQuery({
        queryKey: [
            "get-deployed-endpoints",
            {
                organization: organization.handle,
                project: project.handler,
                component: component.metadata.name,
                deploymentTrackId: deploymentTrack?.id,
            },
        ],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getComponentEndpoints({
                orgId: organization.id.toString(),
                orgHandler: organization.handle,
                componentId: component.metadata.id,
                deploymentTrackId: deploymentTrack?.id,
            }),
        enabled: !!deploymentTrack?.id && getTypeForDisplayType(component.spec.type) === ChoreoComponentType.Service,
        onSuccess: (data = []) => setHasInactiveEndpoints(data.some((item) => item.state !== "Active")),
        refetchInterval: hasInactiveEndpoints ? 10000 : false,
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

    return (
        <>
            {envs?.map((item) => (
                <EnvItem
                    key={item.name}
                    env={item}
                    endpoints={endpoints}
                    refetchEndpoint={refetchEndpoints}
                    component={component}
                    organization={organization}
                    project={project}
                    deploymentTrack={deploymentTrack}
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
}> = ({ organization, project, deploymentTrack, component, env, endpoints, refetchEndpoint }) => {
    const isServiceType = getTypeForDisplayType(component.spec.type) === ChoreoComponentType.Service;
    const [envDetailsRef] = useAutoAnimate();

    const {
        data: deploymentStatus,
        isLoading: loadingDeploymentStatus,
        isFetching: fetchingDeploymentStatus,
        refetch: refetchDeploymentStatus,
    } = useQuery({
        queryKey: [
            "get-deployment-status",
            {
                organization: organization.handle,
                project: project.handler,
                component: component.metadata.name,
                deploymentTrackId: deploymentTrack?.id,
                envId: env.id,
            },
        ],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getDeploymentStatus({
                orgId: organization.id.toString(),
                orgUuid: organization.uuid,
                orgHandler: organization.handle,
                componentId: component.metadata.id,
                deploymentTrackId: deploymentTrack?.id,
                envId: env.id,
            }),
        enabled: !!deploymentTrack?.id,
        onSuccess: () => refetchEndpoint(),
    });

    let timeAgo = "";
    if (deploymentStatus?.build?.deployedAt) {
        timeAgo = getTimeAgo(deploymentStatus?.build?.deployedAt);
    }

    let statusStr = deploymentStatus?.deploymentStatusV2;
    if (statusStr === "ACTIVE") {
        statusStr = "Deployed";
    }

    const { mutate: viewRuntimeLogs } = useMutation({
        mutationFn: (logType: { label: string; flag: "component-application" | "component-gateway" }) =>
            ChoreoWebViewAPI.getInstance().viewRuntimeLogs({
                componentName: component.metadata.name,
                projectName: project.name,
                orgName: organization.name,
                deploymentTrackName: deploymentTrack?.branch,
                envName: env.name,
                type: logType,
            }),
    });

    const { mutate: selectLogType } = useMutation({
        mutationFn: async () => {
            if (isServiceType) {
                const pickedItem = await ChoreoWebViewAPI.getInstance().showQuickPicks({
                    title: "Select Log Type",
                    items: [
                        {
                            label: "Application Logs",
                            item: { flag: "component-application", label: "Application Logs" },
                        },
                        { label: "Gateway Logs", item: { flag: "component-gateway", label: "Gateway Logs" } },
                    ],
                });

                if (pickedItem) {
                    viewRuntimeLogs(pickedItem.item);
                }
            } else {
                viewRuntimeLogs({ flag: "component-application", label: "Application Logs" });
            }
        },
    });

    return (
        <>
            <Divider />
            <div>
                <div className="flex items-center gap-1 mb-3">
                    <h3 className="text-base lg:text-lg flex-1">{env.name} Environment</h3>
                    <Button
                        onClick={() => refetchDeploymentStatus()}
                        appearance="icon"
                        title={`${fetchingDeploymentStatus ? "Refreshing" : "Refresh"} Deployment Details`}
                        className="opacity-50"
                        disabled={fetchingDeploymentStatus}
                    >
                        <Codicon name="refresh" />
                    </Button>
                    <Button
                        appearance="secondary"
                        disabled={deploymentStatus?.deploymentStatusV2 !== "ACTIVE"}
                        onClick={() => selectLogType()}
                    >
                        View Logs
                    </Button>
                </div>
                <div className="flex flex-col gap-3 ">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2" ref={envDetailsRef}>
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
                                            "text-vsc-errorForeground font-medium":
                                                deploymentStatus?.deploymentStatusV2 === "ERROR",
                                            "text-vsc-charts-lines":
                                                deploymentStatus?.deploymentStatusV2 === "SUSPENDED",
                                            "text-vsc-foreground":
                                                deploymentStatus?.deploymentStatusV2 === "NOT_DEPLOYED",
                                            "text-vsc-charts-green font-medium":
                                                deploymentStatus?.deploymentStatusV2 === "ACTIVE",
                                            "text-vsc-charts-orange animate-pulse":
                                                deploymentStatus?.deploymentStatusV2 === "IN_PROGRESS",
                                        })}
                                    >
                                        {toTitleCase(statusStr) || "Not Deployed"}
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
                                {deploymentStatus?.invokeUrl && (
                                    <EndpointItem
                                        type="Invoke"
                                        name="invoke-url"
                                        state="Active"
                                        url={deploymentStatus?.invokeUrl}
                                        showOpen={true}
                                    />
                                )}
                                {isServiceType && (
                                    <>
                                        {endpoints
                                            .filter((item) => item.environmentId === env.id)
                                            .map((item) => {
                                                const endpointsNodes: ReactNode[] = [];
                                                endpointsNodes.push(
                                                    <EndpointItem
                                                        type="Project"
                                                        name={item.displayName}
                                                        url={item.projectUrl}
                                                        hasMultiple={endpoints.length > 1}
                                                        state={item.state}
                                                    />
                                                );
                                                if (item.visibility === "Organization") {
                                                    endpointsNodes.push(
                                                        <EndpointItem
                                                            type="Organization"
                                                            name={item.displayName}
                                                            url={item.organizationUrl}
                                                            hasMultiple={endpoints.length > 1}
                                                            state={item.state}
                                                        />
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
                                                        />
                                                    );
                                                }
                                                return endpointsNodes;
                                            })}
                                    </>
                                )}
                            </>
                        )}
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
                <div className="flex items-center gap-1 mb-3">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
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
    <div className="flex flex-col hover:bg-vsc-editorHoverWidget-background duration-200">
        <div className="text-[9px] md:text-xs opacity-75 font-light">{label}</div>
        <div className="w-full capitalize line-clamp-1">{children}</div>
    </div>
);

const EndpointItem: FC<{
    type: string;
    name: string;
    url: string;
    hasMultiple?: boolean;
    state?: string;
    showOpen?: boolean;
}> = ({ name, type, url, hasMultiple, state = "", showOpen }) => {
    const { mutate: copyUrl } = useMutation({
        mutationFn: (url: string) => clipboardy.write(url),
        onSuccess: () => ChoreoWebViewAPI.getInstance().showInfoMsg("The URL has been copied to the clipboard."),
    });

    const openExternal = (url: string) => ChoreoWebViewAPI.getInstance().openExternal(url);

    // TODO: add endpoint state reason if there are errors

    return (
        <GridColumnItem label={`${type} URL ${hasMultiple ? `(${name})` : ""}`} key={`${name}-${type}`}>
            {url ? (
                <div className="flex items-center gap-1">
                    <VSCodeLink
                        title="Copy URL"
                        className={classNames({
                            "flex-1 line-clamp-1 text-vsc-foreground": true,
                            "animate-pulse": ["Pending", "Progressing"].includes(state),
                            "text-vsc-errorForeground": state === "Error",
                        })}
                        onClick={() => copyUrl(url)}
                    >
                        {url ||
                            (["Pending", "Progressing"].includes(state) && <SkeletonText className="max-w-44" />) ||
                            (state === "Error" && "Error") ||
                            "-"}
                    </VSCodeLink>
                    {showOpen && state === "Active" && (
                        <Button appearance="icon" title="Open URL" onClick={() => openExternal(url)} disabled={!url}>
                            <Codicon name="link-external" />
                        </Button>
                    )}
                </div>
            ) : (
                <SkeletonText className="w-24" />
            )}
        </GridColumnItem>
    );
};
