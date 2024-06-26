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
import { RuntimeServicesResponse, SwaggerData, MiServerRunStatus } from '@wso2-enterprise/mi-core';
import styled from '@emotion/styled';
import { View, ViewContent, ViewHeader } from './components/View';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { ButtonWrapper, Codicon, ProgressRing } from '@wso2-enterprise/ui-toolkit';
import { set } from 'lodash';
import { SwaggerPanel } from './SwaggerPanel';

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

const NavigationContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-start: left;
`;

export interface SwaggerDetails {
    isSwaggerTriggered: boolean;
    swaggerData?: SwaggerData;
}

export function RuntimeServicePanel() {
    const { rpcClient } = useVisualizerContext();
    const [services, setAvailableServices] = useState<RuntimeServicesResponse>();
    const [isSwaggerEnabled, setSwaggerEnabled] = useState<SwaggerDetails>({ isSwaggerTriggered: false });
    const [serverRunStatus, setServerRunStatus] = useState<MiServerRunStatus>('Running' as MiServerRunStatus);

    useEffect(() => {
        if (rpcClient) {

            rpcClient.getMiVisualizerRpcClient().getAvailableRuntimeServices().then((services) => {
                setAvailableServices(services);
            });
        }
    }, [rpcClient]);

    rpcClient.onSwaggerSpecReceived((data: SwaggerData) => {
        setSwaggerEnabled({
            isSwaggerTriggered: true,
            swaggerData: data
        });
    });

    rpcClient.onMiServerRunStateChanged((newState: MiServerRunStatus) => {
        setServerRunStatus(newState);
    });

    const onTryit = async (name: any) => {
        const api_resource = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
            documentIdentifier: undefined,
            resourceType: "api"
        });

        const resource = api_resource.resources.find((resource: any) => resource.name === name);
        const aboslutePath = resource?.absolutePath;

        if (aboslutePath) {
            const swaggerResponse = await rpcClient.getMiDiagramRpcClient().getOpenAPISpec({
                apiName: name,
                apiPath: aboslutePath
            });
        }
    };

    // TODO: Refactor service rendering
    // TODO: Support Data services

    const apiServices = () => {
        if (services?.api?.count > 0) {
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
                                <VSCodeButton appearance="primary" onClick={() => onTryit(entry.name)} title={"Try service"} style={{ marginRight: 8 }}>
                                    <ButtonWrapper>{"Try it"}</ButtonWrapper>
                                </VSCodeButton>
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
                                <VSCodeButton appearance="primary" onClick={onTryit} title={"Try service"} style={{ marginRight: 8 }}>
                                    <ButtonWrapper>{"Try it"}</ButtonWrapper>
                                </VSCodeButton>
                            </EntryContainer>
                        </>
                    ))}
                </div>
            )
        }
    }

    const handleBackButtonClick = () => {
        setSwaggerEnabled({
            isSwaggerTriggered: false
        });
    }

    return (
        <View>
            <>
                {isSwaggerEnabled.isSwaggerTriggered && isSwaggerEnabled.swaggerData ?
                    <>
                        <NavigationContainer id="nav-bar-main">
                            <VSCodeButton appearance="icon" title="Go Back" onClick={handleBackButtonClick}>
                                <Codicon name="arrow-left" />
                            </VSCodeButton>
                        </NavigationContainer>
                        <ViewHeader title={"Swagger View"} >
                            <div>Server Status: {serverRunStatus}</div>
                        </ViewHeader>
                        <SwaggerPanel swaggerData={isSwaggerEnabled.swaggerData} />
                    </>
                    :
                    <>
                        <ViewHeader title={"Available Runtime Services"} codicon='server' >
                            <div>Server Status: {serverRunStatus}</div>
                        </ViewHeader>

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
                    </>
                }
            </>
        </View>
    );
}
