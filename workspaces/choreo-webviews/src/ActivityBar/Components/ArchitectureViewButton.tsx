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
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import React, { useContext } from "react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { OPEN_EDITABLE_ARCHITECTURE_DIAGRAM_EVENT } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";


export const ArchiViewButton = () => {
    
    const { choreoProject, selectedOrg } = useContext(ChoreoWebViewContext);

    const handleClick = () => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_EDITABLE_ARCHITECTURE_DIAGRAM_EVENT
        });
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.architecture.view", selectedOrg?.handle, choreoProject?.id);
    }
    
    return (
        <VSCodeButton
            appearance="primary"
            onClick={handleClick}
        >
            Architecture View

        </VSCodeButton>
    );
}
