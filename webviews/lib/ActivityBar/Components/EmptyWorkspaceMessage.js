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
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { Separator } from './Separator';
const Container = styled.div `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    gap: 10px;
`;
const WideVSCodeButton = styled(VSCodeButton) `
    width: 100%;
    max-width: 300px;
    margin: 10px 0;
`;
export const EmptyWorkspaceMessage = (props) => {
    const openChoreoProject = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.project.open");
    };
    const createChoreoProject = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.project.create");
    };
    return (React.createElement(Container, null,
        props.projectUnavailable ? (React.createElement(React.Fragment, null,
            React.createElement("div", null, "This project is not available in Choreo."),
            React.createElement("div", null, "Please create a new project or open a different project"))) : (React.createElement("div", null, "You do not have a Choreo project in the current workspace.")),
        React.createElement(WideVSCodeButton, { appearance: "primary", onClick: openChoreoProject }, "Open Project"),
        React.createElement(Separator, { text: "OR" }),
        React.createElement(WideVSCodeButton, { appearance: "primary", onClick: createChoreoProject }, "Create Project")));
};
//# sourceMappingURL=EmptyWorkspaceMessage.js.map