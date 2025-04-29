/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { AIMachineStateValue } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import AIChat from './components/AIChat';
import { DisabledWindow } from './DisabledSection';
import LoginPanel from './LoginPanel';
import { LoadingRing } from '../../components/Loader';
import WaitingForLogin from './WaitingForLoginSection';

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    width: 100vw;
`;

const ProgressRing = styled(VSCodeProgressRing)`
    height: 40px;
    width: 40px;
    margin-top: auto;
    padding: 4px;
`;

const AIPanel = (props: { state: AIMachineStateValue }) => {
    const { rpcClient } = useRpcContext();
    const [viewComponent, setViewComponent] = useState<React.ReactNode>();

    useEffect(() => {
        fetchContext();
    }, [props.state]);

    const fetchContext = () => {
        rpcClient.getAiPanelRpcClient().getAIMachineSnapshot().then((snapshot) => {
            switch (snapshot.state) {
                case "Initialize":
                    setViewComponent(<LoadingRing />);
                    break;
                case "Unauthenticated":
                    setViewComponent(<LoginPanel />);
                    break;
                case "Authenticating":
                    setViewComponent(<WaitingForLogin />);
                    break;
                case "Authenticated":
                    setViewComponent(<AIChat />);
                    break;
                case "Disabled":
                    setViewComponent(<DisabledWindow />);
                    break;
                default:
                    setViewComponent(<h1>{snapshot.state}</h1>);
            }
        });
    }

    return (
        <div style={{
            height: "100%"
        }}>
            {!viewComponent ? (
                <LoaderWrapper>
                    <ProgressRing />
                </LoaderWrapper>
            ) : <div style={{ height: "100%" }}>
                {viewComponent}
            </div>}
        </div>
    );
};

export default AIPanel;   
