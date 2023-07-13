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
import { AutoComplete } from "@wso2-enterprise/ui-toolkit";
import { Organization } from "@wso2-enterprise/choreo-core";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    margin-left: 20px;
    gap: 5px;
`;
export const OrgSelector = (props: { onChange: (newOrg: Organization) => void; }) => {
    const { userOrgs, selectedOrg } = useContext(ChoreoWebViewContext);

    const onChange = (newOrgName: string) => {
        const newOrg = userOrgs?.find((org) => org.name === newOrgName);
        if (newOrg) {
            props.onChange(newOrg);
        }
    };
    return <Container>
        <AutoComplete
            selectedItem={selectedOrg?.name}
            items={userOrgs?.map((org) => org.name) || []}
            onChange={onChange}
        />
    </Container>;
};
