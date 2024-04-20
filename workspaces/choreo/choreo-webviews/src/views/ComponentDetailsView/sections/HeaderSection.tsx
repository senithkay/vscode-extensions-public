import React, { FC } from "react";
import { ComponentKind, ComponentsDetailsWebviewProps, Organization, Project } from "@wso2-enterprise/choreo-core";
import { getTypeForDisplayType } from "../utils";
import { Button } from "../../../components/Button";
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { useMutation } from "@tanstack/react-query";

export const HeaderSection: FC<ComponentsDetailsWebviewProps> = ({
    component,
    organization,
    project,
    directoryPath,
}) => {
    // todo: reuse function from ComponentListItem
    const { mutate: deleteComponent, isLoading: deletingComponent } = useMutation({
        mutationFn: async () => {
            await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().deleteComponent({
                compHandler: component.metadata.name,
                projectId: project?.id!,
                orgId: organization?.id?.toString(),
                orgHandler: organization.handle,
            });
            await ChoreoWebViewAPI.getInstance().deleteFile(directoryPath);
            ChoreoWebViewAPI.getInstance().showInfoMsg(
                `Component ${component?.metadata?.name} has been successfully deleted`
            );
            ChoreoWebViewAPI.getInstance().refreshLinkedDirState();
        },
        onSuccess: () => ChoreoWebViewAPI.getInstance().closeWebView(),
    });

    // todo: reuse function from ComponentListItem
    const { mutate: confirmDelete } = useMutation({
        mutationFn: async () => {
            const accepted = await ChoreoWebViewAPI.getInstance().showConfirmMessage({
                message:
                    "Are you sure you want to delete this Choreo component? This action will not affect any local files and will only delete the component created in Choreo. Please note that this action is not reversible.",
                buttonText: "Delete",
            });
            if (accepted) {
                deleteComponent();
            }
        },
    });

    const openInConsole = () =>
        ChoreoWebViewAPI.getInstance().OpenComponentInConsole({
            componentHandler: component.metadata.name,
            orgHandler: organization.handle,
            projectHandler: project.handler,
        });

    const openGitPage = () => ChoreoWebViewAPI.getInstance().openExternal(component.spec.source?.github?.repository);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center flex-wrap gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{component.metadata.name}</h1>
                <h2 className="text-lg md:text-xl font-extralight opacity-60 md:mt-0.5">
                    {getTypeForDisplayType(component?.spec?.type)}
                </h2>
            </div>

            <div className="flex flex-wrap gap-2">
                <div>
                    <span className="font-extralight">Project:</span> {project.name}
                </div>
                <div>
                    <span className="opacity-70">Organization:</span> {organization.name}
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button appearance="secondary" onClick={() => openInConsole()}>
                    Open in Console
                </Button>
                <Button appearance="secondary" onClick={() => openGitPage()}>
                    Open Git Repository
                </Button>
                <Button appearance="secondary" onClick={() => confirmDelete()}>
                    Delete Component
                </Button>
            </div>
        </div>
    );
};
