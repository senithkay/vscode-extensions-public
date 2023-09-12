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
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { useChoreoWebViewContext } from "../../../context/choreo-web-view-ctx";
import { ProjectActionButton } from "../ProjectActionButton";
import { OPEN_CONSOLE_PROJECT_OVERVIEW_PAGE_EVENT } from "@wso2-enterprise/choreo-core";
import { Icon } from "@wso2-enterprise/ui-toolkit";

export const OpenConsoleButton = () => {
    const { choreoProject, choreoUrl, currentProjectOrg } = useChoreoWebViewContext();

    const projectURL = `${choreoUrl}/organizations/${currentProjectOrg?.handle}/projects/${choreoProject?.id}`;

    const openProjectInChoreoConsole = () => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_CONSOLE_PROJECT_OVERVIEW_PAGE_EVENT
        });
        ChoreoWebViewAPI.getInstance().openExternal(projectURL);
    };
    const icon = (<Icon name="choreo" />);

    return (
        <ProjectActionButton
            tooltip="Open project in Choreo Console"
            onClick={openProjectInChoreoConsole}
            label="Console"
            icon={icon}
        />
    );
};
