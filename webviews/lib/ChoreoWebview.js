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
import styled from "@emotion/styled";
import { ComponentWizard } from "./MultiStepComponentWizard/ComponentWizard";
import { ProjectWizard } from "./ProjectWizard/ProjectWizard";
import { ChoreoArchitectureView } from "./ChoreoArchitectureView/ArchitectureView";
import { ChoreoWebviewQueryClientProvider } from "./utilities/query/query";
import { ProjectView } from "./ActivityBar/ProjectView";
import { AccountView } from "./ActivityBar/AccountView";
import { ChoreoComponentsContextProvider } from "./context/choreo-components-ctx";
import { ChoreoWebViewContextProvider } from "./context/choreo-web-view-ctx";
export const Main = styled.main `
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 100vh;
`;
function ChoreoWebview(props) {
    const { type, orgName, projectId, choreoUrl, componentCreateMode } = props;
    return (React.createElement(ChoreoWebviewQueryClientProvider, null,
        React.createElement(Main, null, (() => {
            switch (type) {
                case "ChoreoArchitectureView":
                    return React.createElement(ChoreoArchitectureView, { projectId: projectId, orgName: orgName });
                case "ProjectCreateForm":
                    return (React.createElement(ChoreoWebViewContextProvider, { choreoUrl: choreoUrl, ctxOrgId: orgName },
                        React.createElement(ProjectWizard, { orgId: orgName })));
                case "ComponentCreateForm":
                    return (React.createElement(ChoreoWebViewContextProvider, { choreoUrl: choreoUrl },
                        React.createElement(ComponentWizard, { componentCreateMode: componentCreateMode })));
                case "ActivityBarAccountView":
                    return (React.createElement(ChoreoWebViewContextProvider, { choreoUrl: choreoUrl },
                        React.createElement(AccountView, null)));
                case "ActivityBarProjectView":
                    return (React.createElement(ChoreoWebViewContextProvider, { choreoUrl: choreoUrl },
                        React.createElement(ChoreoComponentsContextProvider, null,
                            React.createElement(ProjectView, null))));
                default:
                    return null;
            }
        })())));
}
export default ChoreoWebview;
//# sourceMappingURL=ChoreoWebview.js.map