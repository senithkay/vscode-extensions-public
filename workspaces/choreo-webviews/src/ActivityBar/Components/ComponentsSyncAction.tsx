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
import React, { useCallback } from "react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { OPEN_SOURCE_CONTROL_VIEW_EVENT } from "@wso2-enterprise/choreo-core";
import { useChoreoComponentsContext } from "../../context/choreo-components-ctx";
import { ProjectActionLink } from "./ProjectActionLink";

export const ComponentsSyncAction = () => {
    const { hasLocalComponents, componentsOutOfSync } = useChoreoComponentsContext()

    const handleSourceControlClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_SOURCE_CONTROL_VIEW_EVENT
        });
        ChoreoWebViewAPI.getInstance().triggerCmd("workbench.scm.focus");
    }, []);

    let syncButtonTooltip = "";
    if(componentsOutOfSync){
        if(hasLocalComponents) {
            syncButtonTooltip = "Some components are not in sync with the upstream repository. Please commit and push them before pushing to Choreo."
        }else{
            syncButtonTooltip = "Some components have changes which are not yet pushed to git repository. Please commit them to be visible on Choreo"
        }
    }

    return (
        <ProjectActionLink 
            label="Sync repo changes"
            tooltip={syncButtonTooltip}
            onClick={componentsOutOfSync ? handleSourceControlClick : undefined}
            disabled={!componentsOutOfSync}
        />            
    );
};
