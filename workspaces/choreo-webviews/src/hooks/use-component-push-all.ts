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
import { Component, PUSH_ALL_COMPONENTS_TO_CHOREO_EVENT } from "@wso2-enterprise/choreo-core";
import { useChoreoComponentsContext } from "../context/choreo-components-ctx";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";

export function useComponentPushAll() {
    const queryClient = useQueryClient();
    const { choreoProject } = useChoreoWebViewContext();
    const { refreshComponents } = useChoreoComponentsContext()
    const { mutate: handlePushAllComponentsClick, isLoading: pushingAllComponents } =
    useMutation({
        mutationFn: (componentNames: string[]) => ChoreoWebViewAPI.getInstance().pushLocalComponentsToChoreo({
            projectId: choreoProject?.id,
            orgId: parseInt(choreoProject?.orgId),
            componentNames
        }),
        onError: (error: Error) => {
            if (error.message) {
                ChoreoWebViewAPI.getInstance().showErrorMsg(error.message);
            }
        },
        onMutate: () => {
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: PUSH_ALL_COMPONENTS_TO_CHOREO_EVENT,
            });
        },
        onSuccess: async (_, componentNames) => {
            await queryClient.cancelQueries({ queryKey: ["project_component_list", choreoProject?.id] });
            const previousComponents: Component[] | undefined = queryClient.getQueryData([
                "project_component_list",
                choreoProject?.id,
            ]);
            const updatedComponents = previousComponents?.map((item) => ({
                ...item,
                local: !componentNames.includes(item.name),
            }));
            queryClient.setQueryData(["project_component_list", choreoProject?.id], updatedComponents);
            refreshComponents();
        },
    });

    return { handlePushAllComponentsClick, pushingAllComponents };
}
