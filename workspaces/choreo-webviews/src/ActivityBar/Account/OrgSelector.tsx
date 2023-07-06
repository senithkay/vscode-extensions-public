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
import { useContext } from "react";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import styled from "@emotion/styled";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    margin-left: 20px;
    gap: 5px;
`;
export const OrgSelector = () => {
    const { userOrgs } = useContext(ChoreoWebViewContext);

    return <Container>
        {userOrgs?.map((org) => {
            return <div key={org.id}>{org.name}</div>
        })}
    </Container>;
};
