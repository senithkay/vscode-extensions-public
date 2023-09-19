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
import React, { useMemo } from "react";
import { useChoreoComponentsContext } from "../../../context/choreo-components-ctx";
import { useComponentPushAll } from "../../../hooks/use-component-push-all";
import { AlertBox } from "../AlertBox";
export const ComponentsPushAlert = () => {
    const { isLoadingComponents, localComponents, hasLocalComponents } = useChoreoComponentsContext();
    const { handlePushAllComponentsClick, pushingAllComponents } = useComponentPushAll();
    const dirtyLocalComponents = useMemo(() => {
        return localComponents === null || localComponents === void 0 ? void 0 : localComponents.some((component) => component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits);
    }, [localComponents]);
    const buttonDisabled = pushingAllComponents || dirtyLocalComponents;
    return (React.createElement(React.Fragment, null, !isLoadingComponents && hasLocalComponents && (React.createElement(AlertBox, { subTitle: `Some components are not created in Choreo. ${dirtyLocalComponents
            ? "Please commit and push them to your remote Git repository before pushing to Choreo."
            : "Please click `Push to Choreo` to create them ."}`, buttonTitle: pushingAllComponents ? "Pushing to Choreo..." : "Push to Choreo", buttonDisabled: buttonDisabled, iconName: "cloud-upload", onClick: () => {
            if (!buttonDisabled) {
                handlePushAllComponentsClick(localComponents.map((item) => item.name));
            }
        } }))));
};
//# sourceMappingURL=ComponentsPushAlert.js.map