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
import React from "react";
import { useChoreoComponentsContext } from "../../../context/choreo-components-ctx";
import { ProjectActionLink } from "../ProjectActionLink";
import { useComponentPushAll } from '../../../hooks/use-component-push-all'

export const ComponentsPushAction = () => {
    const { hasPushableComponents, isLoadingComponents, componentsOutOfSync, hasLocalComponents } = useChoreoComponentsContext();
    const { handlePushAllComponentsClick, pushingAllComponents} = useComponentPushAll();

    let pushButtonTooltip = "";
    const pushButtonDisabled = pushingAllComponents || isLoadingComponents || !hasPushableComponents;
    if(!pushButtonDisabled) {
        pushButtonTooltip = "Some components are not created in Choreo. Click `Push to Choreo` to create them.";
    } else if(componentsOutOfSync && hasLocalComponents){
        pushButtonTooltip = "Components needs to be synced with remote repository first"
    }

    return (
        <ProjectActionLink 
            tooltip={pushButtonTooltip}
            label={pushingAllComponents ? "Pushing to Choreo..." : "Push to Choreo"}
            onClick={pushButtonDisabled ? undefined : handlePushAllComponentsClick}
            disabled={pushButtonDisabled}
        />
    );
};
