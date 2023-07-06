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
import { useEnrichComponent } from "../../hooks/use-enrich-component";
import { ProgressIndicator } from "./ProgressIndicator";
import { DeploymentStatusText } from "./DeploymentStatusText";
import { RepositoryDetails } from "./RepositoryDetails";
import { BuildStatus } from "./BuildStatus";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
`;


export const ComponentDetails = (props: { component: Component}) => {
    const { enrichedComponent, isLoadingComponent, isRefetchingComponent } = useEnrichComponent(props.component);

    return (<Container>
        {(isLoadingComponent || isRefetchingComponent) && <ProgressIndicator />}
        {enrichedComponent && (
            <>
                <DeploymentStatusText enrichedComponent={enrichedComponent} />
                <RepositoryDetails enrichedComponent={enrichedComponent} />
                <BuildStatus enrichedComponent={enrichedComponent} />
            </>
        )}
    </Container>)
};
