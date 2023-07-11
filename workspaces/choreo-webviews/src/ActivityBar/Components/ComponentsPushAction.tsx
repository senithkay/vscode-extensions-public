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
import React, { useContext } from "react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Component, PUSH_ALL_COMPONENTS_TO_CHOREO_EVENT } from "@wso2-enterprise/choreo-core";
import { useChoreoComponentsContext } from "../../context/choreo-components-ctx";
import { ProjectActionLink } from "./ProjectActionLink";


export const ComponentsPushAction = () => {
    const { refreshComponents, hasPushableComponents, isLoadingComponents, componentsOutOfSync, hasLocalComponents } = useChoreoComponentsContext();
    const { choreoProject } = useContext(ChoreoWebViewContext);
    const queryClient = useQueryClient();
    

    const { mutate: handlePushToChoreoClick, isLoading: pushingComponent } =
    useMutation({
        mutationFn: () => ChoreoWebViewAPI.getInstance().pushLocalComponentsToChoreo(choreoProject?.id ?? ""),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        onMutate: () => {
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: PUSH_ALL_COMPONENTS_TO_CHOREO_EVENT
            })
        },
        onSuccess: async () => {
            await queryClient.cancelQueries({ queryKey: ["overview_component_list", choreoProject?.id] })
            const previousComponents: Component[] | undefined = queryClient.getQueryData(["overview_component_list", choreoProject?.id])
            const updatedComponents = previousComponents?.map(item => ({ ...item, local: false }));
            queryClient.setQueryData(["overview_component_list", choreoProject?.id], updatedComponents)
            refreshComponents()
        },
    });

    let pushButtonTooltip = "";
    const pushButtonDisabled = pushingComponent || isLoadingComponents || !hasPushableComponents;
    if(!pushButtonDisabled) {
        pushButtonTooltip = "Some components are not created in Choreo. Click `Push to Choreo` to create them.";
    } else if(componentsOutOfSync && hasLocalComponents){
        pushButtonTooltip = "Components needs to be synced with remote repository first"
    }

    return (
        <ProjectActionLink 
            tooltip={pushButtonTooltip}
            label={pushingComponent ? "Pushing to Choreo..." : "Push to Choreo"}
            onClick={pushButtonDisabled ? undefined : handlePushToChoreoClick}
            disabled={pushButtonDisabled}
        />
    );
};
