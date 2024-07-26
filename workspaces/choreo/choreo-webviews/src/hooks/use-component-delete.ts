/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { Component, DELETE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT } from "@wso2-enterprise/choreo-core";
import { useChoreoComponentsContext } from "../context/choreo-components-ctx";

export function useComponentDelete(component: Component) {
    const queryClient = useQueryClient();
    const { refreshComponents } = useChoreoComponentsContext()
    const { mutate: handleDeleteComponentClick, isLoading: deletingComponent } = useMutation({
        mutationFn: (component: Component) => ChoreoWebViewAPI.getInstance().deleteComponent({ component, projectId: component.projectId }),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        onMutate: () => {
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: DELETE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT,
                properties: {  component: component.name },
            })
        },
        onSuccess: async (data) => {
            if (data) {
                await queryClient.cancelQueries({ queryKey: ["project_component_list", component.projectId] })
                const previousComponents: Component[] | undefined = queryClient.getQueryData(["project_component_list", component.projectId])
                const filteredComponents = previousComponents?.filter(item => data.local ? item.name !== data.name : item.id !== data.id);
                queryClient.setQueryData(["project_component_list", component.projectId], filteredComponents)
                refreshComponents();
            }
        },
    });

    return { handleDeleteComponentClick, deletingComponent };
}
