import React, { FC } from "react";
import { CommandIds, ComponentsDetailsWebviewProps } from "@wso2-enterprise/choreo-core";
import { getComponentTypeText, getTypeForDisplayType } from "../utils";
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { HeaderSection as HeaderSectionView } from "../../../components/HeaderSection";
import { Button } from "../../../components/Button";
import { Codicon } from "../../../components/Codicon";
import { useMutation } from "@tanstack/react-query";

export const HeaderSection: FC<ComponentsDetailsWebviewProps> = ({
    component,
    organization,
    project,
}) => {
    const openInConsole = () =>
        ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.OpenComponentInConsole, {
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

    return (
        <HeaderSectionView
            title={component.metadata.displayName}
            secondaryTitle={getComponentTypeText(getTypeForDisplayType(component?.spec?.type))}
            tags={[
                { label: "Project", value: project.name },
                { label: "Organization", value: organization.name },
            ]}
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
                >
                    <Codicon name="trash" />
                </Button>
            }
        />
    );
};
