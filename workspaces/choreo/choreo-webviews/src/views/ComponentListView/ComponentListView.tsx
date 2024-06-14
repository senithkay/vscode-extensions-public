import React, { FC, useEffect } from "react";
import { ComponentsListActivityViewProps } from "@wso2-enterprise/choreo-core";
import { ComponentsEmptyView } from "./ComponentsEmptyView";
import { ComponentListItem } from "./ComponentListItem";
import { NoContextView } from "./NoContextView";
import { InvalidWorkspaceView } from "./InvalidWorkspaceView";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";

export const ComponentListView: FC<ComponentsListActivityViewProps> = ({ directoryPath }) => {
    const queryClient = useQueryClient();

    const { data: linkedDirState, isLoading } = useQuery({
        queryKey: ["context_state"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getContextState(),
    });

    const { data: openedComponentKey } = useQuery({
        queryKey: ["active_component"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getWebviewStoreState(),
        select: (data) => data.openedComponentKey,
    });

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().refreshContextState();
        ChoreoWebViewAPI.getInstance().onContextStateChanged((contextState) => {
            queryClient.setQueryData(["context_state"], contextState);
        });
        ChoreoWebViewAPI.getInstance().onWebviewStateChanged((webviewState) => {
            queryClient.setQueryData(["active_component"], webviewState);
        });
    }, []);

    const [componentListRef] = useAutoAnimate();

    const validContextItems = Object.values(linkedDirState?.items ?? {}).filter((item) => item.project && item.org);

    if (!directoryPath) {
        return <InvalidWorkspaceView loading={isLoading || linkedDirState.loading} />;
    }

    if (validContextItems.length === 0) {
        return <NoContextView loading={isLoading || linkedDirState.loading} />;
    }

    if (linkedDirState?.components?.length === 0) {
        return (
            <ComponentsEmptyView
                loading={isLoading || linkedDirState.loading}
                items={validContextItems}
                selected={linkedDirState.selected}
            />
        );
    }

    return (
        <>
            {(isLoading || linkedDirState.loading) && <ProgressIndicator />}
            <div className="w-full flex flex-col py-2" ref={componentListRef}>
                {linkedDirState?.components?.map((item, index) => (
                    <div key={item.component?.metadata?.id}>
                        <ComponentListItem
                            item={item}
                            org={linkedDirState.selected?.org}
                            project={linkedDirState.selected?.project}
                            isListLoading={isLoading}
                            opened={
                                openedComponentKey ===
                                `${linkedDirState.selected?.org?.handle}-${linkedDirState.selected?.project?.handler}-${item?.component.metadata.name}`
                            }
                        />
                        {index !== linkedDirState.components?.length - 1 && (
                            <div className="h-[0.5px] bg-vsc-dropdown-border opacity-70" />
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};
