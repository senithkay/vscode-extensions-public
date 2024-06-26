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
import { ButtonWrapper, Codicon, ProgressRing, Tooltip } from '@wso2-enterprise/ui-toolkit';
import { SwaggerPanel } from './SwaggerPanel';

const ProxyContent = styled.div`
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    cursor: pointer;
    background-color: var(--vscode-editorHoverWidget-background);
    &:hover {
        background-color: var(--vscode-list-hoverBackground);
    };
    display: grid;
    grid-template-columns: 2fr 3fr 3fr 0.75fr;
    overflow: hidden;
    gap: 10px;
`;

const ApiContent = styled.div`
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    cursor: pointer;
    background-color: var(--vscode-editorHoverWidget-background);
    &:hover {
        background-color: var(--vscode-list-hoverBackground);
    };
    display: grid;
    grid-template-columns: 1fr 3fr 0.75fr;
    overflow: hidden;
    gap: 10px;
`;

const Details = styled.div`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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

const ServiceCard = styled.div`
    border: 0.5px solid var(--vscode-editor-foreground);
    border-radius: 2px;
    cursor: pointer;
    margin-bottom: 15px;
    padding: 10px;
`;

const ServerHeader = styled.div`
    display: flex;
    margin-top: 5px;
    margin-bottom: 20px;
`;

const ServiceIcon = styled.div`
    width: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
`;

const ServiceTitle = styled.h3`
    margin: 0;
`;

const HeaderTitle = styled.div`
    display: flex;
`;

const ProxyContentHeader = styled.div`
    padding: 10px;
    display: grid;
    grid-template-columns: 2fr 3fr 3fr 0.75fr;
    overflow: hidden;
`;

const APIContentHeader = styled.div`
    padding: 10px;
    display: grid;
    grid-template-columns: 1fr 3fr 0.75fr;
    overflow: hidden;
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
                <ServiceCard>
                    <ServerHeader>
                        <ServiceIcon>
                            <Codicon name={'globe'} />
                        </ServiceIcon>
                        <ServiceTitle>Deployed APIs</ServiceTitle>
                    </ServerHeader>
                    <APIContentHeader>
                        <HeaderTitle>
                            API Name
                        </HeaderTitle>
                        <HeaderTitle>
                            URL
                        </HeaderTitle>
                    </APIContentHeader>
                    <hr style={{
                        borderColor: "var(--vscode-panel-border)", marginBottom: '15px'
                    }} />
                    {Object.entries(services.api.list).map(([_, entry]) => (
                        <>
                            <ApiContent>
                                <Details style={{ fontWeight: 'bold' }}>
                                    {entry.name}
                                </Details>
                                <Details>
                                    {entry.url}
                                </Details>
                                <VSCodeButton
                                    appearance="primary"
                                    onClick={() => onTryit(entry.name)} title={"Try service"} style={{ width: 'max-content', justifySelf: 'flex-end' }}
                                >
                                    <ButtonWrapper>{"Try it"}</ButtonWrapper>
                                </VSCodeButton>
                            </ApiContent>

                        </>
                    ))}
                </ServiceCard>
            )
        }
    }

    const proxyServices = () => {
        if (services?.proxy?.count > 0) {
            return (
                <ServiceCard>
                    <ServerHeader>
                        <ServiceIcon>
                            <Codicon name={'arrow-swap'} />
                        </ServiceIcon>
                        <ServiceTitle>Deployed Proxy Services</ServiceTitle>
                    </ServerHeader>
                    <ProxyContentHeader>
                        <HeaderTitle>
                            Proxy Name
                        </HeaderTitle>
                        <HeaderTitle>
                            WSDL 1.1
                        </HeaderTitle>
                        <HeaderTitle>
                            WSDL 2.0
                        </HeaderTitle>
                    </ProxyContentHeader>
                    <hr style={{
                        borderColor: "var(--vscode-panel-border)", marginBottom: '15px'
                    }} />
                    {Object.entries(services.proxy.list).map(([_, entry]) => (
                        <>
                            <ProxyContent>
                                <Details style={{ fontWeight: 'bold' }}>
                                    {entry.name}
                                </Details>
                                <Tooltip content={entry.wsdl1_1} position="bottom" containerSx={{ display: 'grid' }}>
                                    <Details>
                                        {entry.wsdl1_1}
                                    </Details>
                                </Tooltip>
                                <Tooltip content={entry.wsdl2_0} position="bottom" containerSx={{ display: 'grid' }}>

                                    <Details>
                                        {entry.wsdl2_0}
                                    </Details>
                                </Tooltip>
                                <VSCodeButton
                                    appearance="primary"
                                    onClick={onTryit} title={"Try service"} style={{ width: 'max-content', justifySelf: 'flex-end' }}
                                >
                                    <ButtonWrapper>{"Try it"}</ButtonWrapper>
                                </VSCodeButton>
                            </ProxyContent>
                        </>
                    ))}
                </ServiceCard>
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
