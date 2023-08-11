import React from "react";

import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { AlertBox } from "../AlertBox";
import { useChoreoComponentsContext } from "../../../context/choreo-components-ctx";

export const NoComponentsAlert = () => {
    const { components, isLoadingComponents, componentLoadError } = useChoreoComponentsContext();
    const addComponentClick = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.component.create");
    };
    return (
        <>
            {!componentLoadError && !isLoadingComponents && components?.length === 0 && (
                <AlertBox
                    title="No Components Found"
                    subTitle="You don't have any components in this project yet. Start by clicking the 'Add Component' button to add your first component."
                    buttonTitle="Add Component"
                    iconName="add"
                    onClick={addComponentClick}
                />
            )}
        </>
    );
};
