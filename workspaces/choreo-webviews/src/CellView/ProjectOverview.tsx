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
import { useEffect } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

const WizardContainer = styled.div`
    width: 100%;
    display  : flex;
    flex-direction: column;
`;

export interface CellViewProps {
    projectId?: string;
    orgName?: string;
}

export function CellView(props: CellViewProps) {

    const projectId = props.projectId ? props.projectId : '';
    const orgName = props.orgName ? props.orgName : '';


    return (
        <>
            <WizardContainer>
<h1>Cell View</h1>
            </WizardContainer>
        </>
    );
}
