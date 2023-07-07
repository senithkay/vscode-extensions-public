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
import { Component } from "@wso2-enterprise/choreo-core";
import { useComponentBuildStatus } from "../../hooks/use-component-build-status";
import { useComponentDeploymentStatus } from "../../hooks/use-component-deployment-status";
import { DeploymentStatusText } from "./DeploymentStatusText";
import { ComponentDetailActions } from './ComponentDetailActions';
import { BuildStatusText } from "./BuildStatusText";
import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow } from "@vscode/webview-ui-toolkit/react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: flex-start;
  gap: 10px;
`;

export const ComponentDetails = (props: {
    component: Component,
    handleSourceControlClick: () => void,
    reachedChoreoLimit: boolean,
    loading: boolean,
    refetchComponents: () => void,
}) => {
    const { component, handleSourceControlClick, reachedChoreoLimit, loading, refetchComponents } = props;
    const { buildData, isLoadingBuild } = useComponentBuildStatus(props.component);
    const { devDeploymentData, isLoadingDeployment } = useComponentDeploymentStatus(props.component);

    return (
        <Container>
            <VSCodeDataGrid aria-label="Components">
                <VSCodeDataGridRow>
                    <VSCodeDataGridCell gridColumn="1">
                        Version
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell gridColumn="2">
                        {component.version}
                    </VSCodeDataGridCell>
                </VSCodeDataGridRow>
                <VSCodeDataGridRow>
                    <VSCodeDataGridCell gridColumn="1">
                        Build
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell gridColumn="2">
                        <BuildStatusText
                            buildStatus={buildData}
                            handler={props.component.handler}
                            loading={isLoadingBuild}
                            localComponent={props.component.local}
                        />
                    </VSCodeDataGridCell>
                </VSCodeDataGridRow>
                <VSCodeDataGridRow>
                    <VSCodeDataGridCell gridColumn="1">
                        Deployment
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell gridColumn="2">
                        <DeploymentStatusText
                            deployment={devDeploymentData}
                            loading={isLoadingDeployment}
                            localComponent={props.component.local}
                        />
                    </VSCodeDataGridCell>
                </VSCodeDataGridRow>
                <VSCodeDataGridRow>
                    <VSCodeDataGridCell gridColumn="1">
                        Action
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell gridColumn="2">
                        <ComponentDetailActions
                            component={component}
                            handleSourceControlClick={handleSourceControlClick}
                            reachedChoreoLimit={reachedChoreoLimit}
                            refetchComponents={refetchComponents}
                            loading={loading}
                        />
                    </VSCodeDataGridCell>
                </VSCodeDataGridRow>
            </VSCodeDataGrid>
        </Container>
    );
};
