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
import { Component } from "@wso2-enterprise/choreo-core";
import { useChoreoComponentsContext } from "../context/choreo-components-ctx";

export function useComponentPush(component: Component) {
    const queryClient = useQueryClient();
    const { refreshComponents } = useChoreoComponentsContext()
    const { mutate: handlePushComponentClick, isLoading: pushingSingleComponent } = useMutation({
        mutationFn: (componentName: string) =>
            ChoreoWebViewAPI.getInstance().pushLocalComponentToChoreo({
                projectId: component.projectId,
                componentName,
            }),
        onSuccess: async (_, name) => {
            await queryClient.cancelQueries({
                queryKey: ["project_component_list", component.projectId],
            });
            const previousComponents: Component[] | undefined = queryClient.getQueryData([
                "project_component_list",
                component.projectId,
            ]);
            const updatedComponents = previousComponents?.map((item) =>
                item.name === name ? { ...item, local: false } : item
            );
            queryClient.setQueryData(["project_component_list", component.projectId], updatedComponents);
            refreshComponents();
        },
    });

    return { handlePushComponentClick, pushingSingleComponent };
}
