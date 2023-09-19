import React from "react";
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { AlertBox } from "../AlertBox";
import { useChoreoComponentsContext } from "../../../context/choreo-components-ctx";
export const NoComponentsAlert = () => {
    const { components, isLoadingComponents } = useChoreoComponentsContext();
    const addComponentClick = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.component.create");
    };
    return (React.createElement(React.Fragment, null, !isLoadingComponents && (components === null || components === void 0 ? void 0 : components.length) === 0 && (React.createElement(AlertBox, { title: "No Components Found", subTitle: "You don't have any components in this project yet. Start by clicking the 'Add Component' button to add your first component.", buttonTitle: "Add Component", iconName: "add", onClick: addComponentClick }))));
};
//# sourceMappingURL=NoComponentsAlert.js.map