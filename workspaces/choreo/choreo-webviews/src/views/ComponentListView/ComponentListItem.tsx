import React, { FC } from "react";
import { ComponentLink } from "@wso2-enterprise/choreo-core";
import { ContextMenu } from "../../Components/Atoms/ContextMenu";
import classNames from "classnames";
import { useMutation } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";

interface Props {
    item: ComponentLink;
    isListLoading?: boolean;
}

export const ComponentListItem: FC<Props> = ({ item, isListLoading }) => {
    const { mutate: confirmDelete } = useMutation({
        mutationFn: async () => {
            const accepted = await ChoreoWebViewAPI.getInstance().showConfirmMessage({
                message: "Are you sure you want to delete this component. This action is not reversible",
                buttonText: "Delete",
            });
            if (accepted) {
                deleteComponent();
            }
        },
    });

    const { mutate: deleteComponent, isLoading: deletingComponent } = useMutation({
        mutationFn: async () => {
            await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().deleteComponent({
                compHandler: item.linkContent.componentHandle,
                projectId: item.project?.id!,
                orgId: item.organization?.id?.toString(),
                orgHandler: item.linkContent.orgHandle,
            });
            await ChoreoWebViewAPI.getInstance().deleteFile(item.linkFullPath);
            ChoreoWebViewAPI.getInstance().showInfoMsg(
                `Component ${item.component?.metadata?.name} has been successfully deleted`
            );
            ChoreoWebViewAPI.getInstance().refreshLinkedDirState();
        },
    });

    const { mutate: unlinkComponent } = useMutation({
        mutationFn: async () => {
            const accepted = await ChoreoWebViewAPI.getInstance().showConfirmMessage({
                message: `Are you sure you want to unlink this component. This action will delete ${item.linkRelativePath} from the component directory`,
                buttonText: "Unlink",
            });
            if (accepted) {
                await ChoreoWebViewAPI.getInstance().deleteFile(item.linkFullPath);
                ChoreoWebViewAPI.getInstance().showInfoMsg(
                    `Component ${item.component?.metadata?.name} has been successfully unlinked`
                );
                ChoreoWebViewAPI.getInstance().refreshLinkedDirState();
            }
        },
    });

    const isItemEnriched = item.component;

    return (
        <div
            className={classNames({
                flex: true,
                "cursor-pointer hover:bg-vsc-list-hoverBackground": isItemEnriched,
                "animate-pulse cursor-progress": !isItemEnriched && isListLoading,
                "animate-pulse": deletingComponent,
            })}
        >
            <div className="flex-1 flex flex-col gap-0.5 pl-5 py-3 ">
                <h3 className="text-sm font-bold">{item.linkContent.componentHandle}</h3>
                <p className="text-xs">
                    Path: {item.workspaceName}/{item.componentRelativePath}
                </p>
                {!isListLoading && !isItemEnriched && (
                    <p className="text-xs text-vsc-errorForeground">
                        Inaccessible component. Please relink or log in again.
                    </p>
                )}
            </div>
            <div className="pt-1 pr-[6px]">
                {isItemEnriched && !deletingComponent && (
                    <ContextMenu
                        options={[
                            { label: "Open in Console" },
                            { label: "Unlink", onClick: () => unlinkComponent() },
                            { label: "Delete", onClick: () => confirmDelete() },
                        ]}
                    />
                )}
            </div>
        </div>
    );
};
