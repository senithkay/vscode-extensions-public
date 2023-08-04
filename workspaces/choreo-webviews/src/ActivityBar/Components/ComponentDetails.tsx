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
import { ErrorBanner } from "../../Commons/ErrorBanner";
import { DataGrid } from "@wso2-enterprise/ui-toolkit";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: flex-start;
  gap: 10px;
`;

const ErrorBannerWrap = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`

export const ComponentDetails = (props: {
    component: Component,
    handleSourceControlClick: () => void,
    loading: boolean,
}) => {
    const { component, handleSourceControlClick, loading } = props;
    const { buildData, isLoadingBuild } = useComponentBuildStatus(props.component);
    const { devDeploymentData, isLoadingDeployment } = useComponentDeploymentStatus(props.component);

    return (
        <Container>
            {!component.repository && (
                <ErrorBannerWrap>
                    <ErrorBanner errorMsg="Git repository of the component is no longer accessible to Choreo." />
                </ErrorBannerWrap>
            )}
            <DataGrid
                data={[
                    [
                        { gridColumn: '1', isHeader: true, content: 'Version' },
                        { gridColumn: '2', content: component.version },
                    ],
                    [
                        { gridColumn: '1', isHeader: true, content: 'Build' },
                        { gridColumn: '2', content:
                                <BuildStatusText
                                    buildStatus={buildData}
                                    handler={props.component.handler}
                                    loading={isLoadingBuild}
                                    localComponent={props.component.local}
                                />
                        },
                    ],
                    [
                        { gridColumn: '1', isHeader: true, content: 'Deployment' },
                        { gridColumn: '2', content:
                                <DeploymentStatusText
                                    deployment={devDeploymentData}
                                    handler={props.component.handler}
                                    loading={isLoadingDeployment}
                                    localComponent={props.component.local}
                                />
                        },
                    ],
                    [
                        { gridColumn: '1', isHeader: true, content: 'Action' },
                        { gridColumn: '2', content:
                                <ComponentDetailActions
                                    component={component}
                                    handleSourceControlClick={handleSourceControlClick}
                                    loading={loading}
                                />
                        },
                    ],
                ]}
            />
        </Container>
    );
};
