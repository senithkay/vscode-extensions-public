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
import styled from "@emotion/styled";
import React from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
const IconLabel = styled.div `
    // To hide label in small screens
    @media (max-width: 320px) {
      display: none;
    }
`;
export const ProjectActionButton = (props) => {
    const { disabled, label, tooltip, onClick, iconName, icon } = props;
    return (React.createElement(React.Fragment, null,
        React.createElement(VSCodeButton, { appearance: "icon", onClick: () => onClick(), title: tooltip, disabled: disabled },
            iconName && (React.createElement(React.Fragment, null,
                React.createElement(Codicon, { name: iconName }),
                " \u00A0")),
            icon && (React.createElement(React.Fragment, null,
                icon,
                " \u00A0")),
            React.createElement(IconLabel, null, label))));
};
//# sourceMappingURL=ProjectActionButton.js.map