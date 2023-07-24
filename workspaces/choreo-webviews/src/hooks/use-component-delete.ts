/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
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
