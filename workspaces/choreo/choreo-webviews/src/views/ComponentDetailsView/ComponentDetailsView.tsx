import React, { FC, useState } from "react";
import { ComponentsDetailsWebviewProps } from "@wso2-enterprise/choreo-core";
import { EndpointsSection } from "./sections/EndpointsSection";
import { BuildConfigsSection } from "./sections/BuildConfigsSection";
import { HeaderSection } from "./sections/HeaderSection";
import { BuildsSection } from "./sections/BuildsSection";
import { DeploymentsSection } from "./sections/DeploymentsSection";
import { Divider } from "../../components/Divider";
import { useQuery } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";

export const ComponentDetailsView: FC<ComponentsDetailsWebviewProps> = (props) => {
    const { component, project, organization, directoryPath } = props;
    
    // TODO: show a dropdown for deployment track

    const {data: deploymentTrack} = useQuery({
        queryKey: [
            "get-active-deployment-track",
            { component: component.metadata.name, organization: organization.handle, project: project.handler },
        ],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getDeploymentTracks({
                compHandler: component.metadata.name,
                orgHandler: organization.handle,
                orgId: organization.id.toString(),
                projectId: project.id,
            }),
        select: (deploymentTracks)=>deploymentTracks?.find((item) => item.latest)
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


    return (
        <div className="flex flex-row justify-center p-1 md:p-3 lg:p-4 xl:p-6">
            <div className="container">
                <div className="mx-auto max-w-7xl flex flex-col p-4">
                    <HeaderSection {...props} />
                    <Divider className="mt-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-0">
                        <Divider className="mt-4 block lg:hidden" />
                        <div className="relative flex flex-col gap-6 col-span-1 lg:col-span-3 lg:p-4 pt-6 lg:border-r-1 border-vsc-editorIndentGuide-background">
                            <BuildsSection {...props} deploymentTrack={deploymentTrack} envs={envs} />
                            <DeploymentsSection {...props} deploymentTrack={deploymentTrack} envs={envs} loadingEnvs={loadingEnvs}/>
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
