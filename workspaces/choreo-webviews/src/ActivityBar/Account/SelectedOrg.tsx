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
import { ViewTitle } from "../Components/ViewTitle";
import { ViewHeader } from "../Components/ViewHeader";
import { useOrgOfCurrentProject } from "../../hooks/use-org-of-current-project";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 10px;
    width: 100%;
    min-height: 62px;
`;

const Body = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;

export const CurrentOrganization = () => {

    const org = useOrgOfCurrentProject();

    return <Container>
        <ViewHeader>
            <ViewTitle>
                Project Organization
            </ViewTitle>
        </ViewHeader>
        <Body>
            {!org && <div>fetching organization info...</div>}
            <div>{org?.name}</div>
            <div style={{ color: "var(--vscode-descriptionForeground)"}}>{org?.handle}</div>
        </Body>
    </Container>;
};
