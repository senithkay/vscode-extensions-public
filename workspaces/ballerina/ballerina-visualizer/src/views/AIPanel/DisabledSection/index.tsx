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

export const DisabledWindow = () => {
    const { rpcClient } = useRpcContext();

    const Retry = () => {
        rpcClient.sendAIStateEvent(AIMachineEventType.RETRY);
    };

    return (
        <Container>
            <AlertBox
                buttonTitle="Retry"
                onClick={Retry}
                subTitle={
                    "An error occurred while trying to establish a connection with the WSO2 Copilot server. Please click retry to try again."
                }
                title={"Error in establishing Connection"}
            />
        </Container>
    );
};
