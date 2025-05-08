/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { AIMachineEventType } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';

import { AlertBox } from "../AlertBox";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    gap: 8px;
`;

const WaitingForLogin = () => {
    const { rpcClient } = useRpcContext();

    const cancelLogin = () => {
        rpcClient.sendAIStateEvent(AIMachineEventType.CANCEL_LOGIN);
    };

    return (
        <Container>
            <AlertBox
                buttonTitle="Cancel"
                onClick={cancelLogin}
                subTitle={
                    "Waiting for the login credentials. Please sign in to your WSO2 Copilot account in the browser window to continue."
                }
                title={"Waiting for Login"}
            />
        </Container>
    );
};

export default WaitingForLogin;
