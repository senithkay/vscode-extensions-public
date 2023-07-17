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
import { useComponentPushAll } from "../../../hooks/use-component-push-all";
import { AlertBox } from "../AlertBox";

export const ComponentsPushAlert = () => {
    const { hasPushableComponents, isLoadingComponents, pushableComponents } = useChoreoComponentsContext();
    const { handlePushAllComponentsClick, pushingAllComponents } = useComponentPushAll();

    return (
        <>
            {!isLoadingComponents && hasPushableComponents && (
                <AlertBox
                    subTitle="Some components are not created in Choreo. Please click `Push to Choreo` to create them."
                    buttonTitle={pushingAllComponents ? "Pushing to Choreo..." : "Push to Choreo"}
                    buttonDisabled={pushingAllComponents}
                    iconName="cloud-upload"
                    onClick={() => handlePushAllComponentsClick(pushableComponents.map((item) => item.name))}
                />
            )}
        </>
    );
};
