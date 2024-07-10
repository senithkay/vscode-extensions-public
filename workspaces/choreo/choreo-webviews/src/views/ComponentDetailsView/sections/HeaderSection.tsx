import React, { FC } from "react";
import { CommandIds, ComponentsDetailsWebviewProps, DeploymentTrack } from "@wso2-enterprise/choreo-core";
import { getComponentTypeText, getTypeForDisplayType } from "../utils";
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { HeaderSection as HeaderSectionView } from "../../../components/HeaderSection";
import { Button } from "../../../components/Button";
import { Codicon } from "../../../components/Codicon";
import { useMutation } from "@tanstack/react-query";

export const HeaderSection: FC<
    ComponentsDetailsWebviewProps & {
        allDeploymentTracks: DeploymentTrack[];
        deploymentTrack: DeploymentTrack;
        onChangeDeploymentTrack: () => void;
    }
> = ({ allDeploymentTracks, onChangeDeploymentTrack, deploymentTrack, component, organization, project }) => {
    const openInConsole = () =>
        ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.OpenInConsole, {
            component,
            project,
            organization,
        });

    const openGitPage = () => ChoreoWebViewAPI.getInstance().openExternal(component.spec.source?.github?.repository);

    const { mutate: onDeleteComponent, isLoading: deletingComponent } = useMutation({
        mutationFn: () =>
            ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.DeleteComponent, {
                component,
                project,
                organization,
            }),
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

    return (
        <HeaderSectionView
            title={component.metadata.displayName}
            secondaryTitle={getComponentTypeText(getTypeForDisplayType(component?.spec?.type))}
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
                    title="Delete Component"
                    className="hover:text-vsc-errorForeground duration-200 text-vsc-descriptionForeground"
                >
                    <Codicon name="trash" />
                </Button>
            }
        />
    );
};
