import React, { FC } from "react";
import { CommandIds, ComponentsDetailsWebviewProps } from "@wso2-enterprise/choreo-core";
import { getComponentTypeText, getTypeForDisplayType } from "../utils";
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { ContextMenu } from "../../../components/ContextMenu";
import { HeaderSection as HeaderSectionView } from "../../../components/HeaderSection";

export const HeaderSection: FC<ComponentsDetailsWebviewProps> = ({
    component,
    organization,
    project,
    directoryPath,
}) => {
    const openInConsole = () =>
        ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.OpenComponentInConsole, {
            component,
            project,
            organization,
        });

    const openGitPage = () => ChoreoWebViewAPI.getInstance().openExternal(component.spec.source?.github?.repository);

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
            menu={
                <ContextMenu
                    webviewSection={directoryPath ? "validLinkItem" : "invalidLinkItem"}
                    params={{
                        component: component,
                        project: project,
                        organization: organization,
                        componentPath: directoryPath,
                    }}
                />
            }
        />
    );
};
