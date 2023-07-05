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
import React, { useCallback, useContext } from "react";
import styled from "@emotion/styled";
import { Component } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { mapBuildStatus } from "../../ProjectOverview/ComponentList";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { useSelectedOrg } from "../../hooks/use-selected-org";

const Container = styled.div`
    display: flex;
    flex-direction: row;
`;

export const BuildStatus: React.FC<{ enrichedComponent: Component }> = (props) => {
    const { enrichedComponent: { buildStatus, handler } } = props;
    const { choreoUrl, choreoProject } = useContext(ChoreoWebViewContext);
    const { selectedOrg } = useSelectedOrg();

    const componentBaseUrl = `${choreoUrl}/organizations/${selectedOrg?.handle}/projects/${choreoProject?.id}/components/${handler}`;
    const componentDeployLink = `${componentBaseUrl}/deploy`;

    
    const openBuildInfoInConsole = useCallback(() => {
        ChoreoWebViewAPI.getInstance().openExternal(componentDeployLink)
    }, [componentBaseUrl]);

    const buildStatusMappedValue = buildStatus && mapBuildStatus(buildStatus?.status, buildStatus?.conclusion as string);

    return (
        <Container>
            <div>Build Status:&nbsp;</div>
            {buildStatusMappedValue && (
                <>
                    <VSCodeLink
                        onClick={openBuildInfoInConsole}
                        style={{ color: buildStatusMappedValue.color }}
                    >
                        {buildStatusMappedValue.text}
                    </VSCodeLink>
                </>
            )}
            {!buildStatusMappedValue && <div>N/A</div>}
        </Container>
    );
};
