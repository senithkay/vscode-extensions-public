/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import React, { Fragment, useEffect, useState } from 'react';
import { RuntimeServicesResponse } from '@wso2-enterprise/mi-core';
import styled from '@emotion/styled';
import { View, ViewContent, ViewHeader } from './components/View';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { ButtonWrapper, ProgressRing } from '@wso2-enterprise/ui-toolkit';

const EntryContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    cursor: pointer;
    background-color: var(--vscode-editorHoverWidget-background);
    &:hover {
        background-color: var(--vscode-list-hoverBackground);
    }
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    width: 100vw;
`;

export function RuntimeServicePanel() {
    const { rpcClient } = useVisualizerContext();
    const [services, setAvailableServices] = useState<RuntimeServicesResponse>();

    useEffect(() => {
        if (rpcClient) {

            rpcClient.getMiVisualizerRpcClient().getAvailableRuntimeServices().then((services) => {
                setAvailableServices(services);
                console.log(services);
            });
        }
    }, [rpcClient]);

    const onTryit = () => {
        // Find the filePath for the given service name
        // Call the LS and get the OAPI spec
        // Open the swagger view

    };

    const apiServices = () => {
        if (services?.api?.count > 0) {
            const resourceMethods = "";
            return (
                <div>
                    <h3>Deployed APIs</h3>

                    {Object.entries(services.api.list).map(([_, entry]) => (
                        <>
                            <EntryContainer>
                                <div style={{ flex: 2, fontWeight: 'bold' }}>
                                    {entry.name}
                                </div>
                                <div style={{ flex: 9 }}>
                                    {entry.url}
                                </div>
                                {/* <VSCodeButton appearance="secondary" onClick={onTryit} title={"Try service"} disabled={false} style={{ marginRight: 8 }}>
                                    <ButtonWrapper style={{ minWidth: "50px" }}>{"Try it"}</ButtonWrapper>
                                </VSCodeButton> */}
                            </EntryContainer>
                        </>
                    ))}
                </div>
            )
        }
    }

    const proxyServices = () => {
        if (services?.proxy?.count > 0) {
            return (
                <div>
                    <h3>Deployed Proxy Services</h3>
                    {Object.entries(services.proxy.list).map(([_, entry]) => (
                        <>
                            <EntryContainer style={{ overflow: 'scroll' }}>
                                <div style={{ flex: 1, fontWeight: 'bold', marginRight: '10px' }}>
                                    {entry.name}
                                </div>
                                <div style={{ flex: '1 1 40%', marginRight: '10px' }}>
                                    {entry.wsdl1_1}
                                </div>
                                <div style={{ flex: '1 1 40%', marginRight: '10px' }}>
                                    {entry.wsdl2_0}
                                </div>
                                {/* <VSCodeButton appearance="secondary" onClick={onTryit} title={"Try service"} disabled={false} style={{ marginRight: 8 }}>
                                    <ButtonWrapper style={{ minWidth: "50px" }}>{"Try it"}</ButtonWrapper>
                                </VSCodeButton> */}
                            </EntryContainer>
                        </>
                    ))}
                </div>
            )
        }
    }



    return (
        <View>
            <ViewHeader title={"Available Runtime Services"} ></ViewHeader>
            <ViewContent padding={true}>
                {services ?
                    (
                        <Fragment>
                            {apiServices()}
                            {proxyServices()}
                        </Fragment>
                    ) :
                    (
                        <LoaderWrapper>
                            <ProgressRing />
                        </LoaderWrapper>
                    )
                }
            </ViewContent>
        </View>
    );
}