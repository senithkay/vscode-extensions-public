/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { useEffect, useState, Fragment } from "react";
import { View, ViewContent, ViewHeader } from './../../components/View';
import styled from '@emotion/styled';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { ButtonWrapper, Codicon, ProgressRing } from '@wso2-enterprise/ui-toolkit';

type BiServerRunStatus = 'Running' | 'Stopped';

export interface RuntimeServiceDetails {
    count: number;
    list: unknown;
}

export interface RuntimeServicesResponse {
    api: RuntimeServiceDetails | undefined;
}

export function RuntimeServicesPanel() {

    const { rpcClient } = useRpcContext();
    const [services, setAvailableServices] = useState<RuntimeServicesResponse>();
    const [serverRunStatus, setServerRunStatus] = useState<BiServerRunStatus>('Running' as BiServerRunStatus);

    useEffect(() => {
        const runtimeServices : RuntimeServicesResponse = {
            api: {
                count: 2,
                list: [
                    {
                        name: "TestAPI",
                        url: "http://localhost:9090/test"
                    },
                    {
                        name: "TestAPI2",
                        url: "http://localhost:9090/test2"
                    }
                ]
            }
        };
        setAvailableServices(runtimeServices);
    });

    rpcClient.onBiRunningStateChanged(() => {
    });

    const renderRuntimeServices = () => {
        if (services?.api?.count === 0) {
            return (
                <div>No Runtime Services Available</div>
            );
        }
        return (<>{httpServices()}</>);
    }

    const onTryit = async (name: any) => {
    };

    const httpServices = () => {
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

    return <View>
        <>
        <ViewHeader title={"Available Runtime Services"} codicon='server' >
            <ServerStatus>
                <ServerStatusIcon isRunning={serverRunStatus === "Running" ? true : false} />
                <div>Server Status: {serverRunStatus}</div>
            </ServerStatus>
        </ViewHeader>
        <ViewWrapper>
            <ViewContent padding={true}>
                {services ?
                    (
                        <Fragment>
                            {renderRuntimeServices()}
                        </Fragment>
                    ) :
                    (
                        <LoaderWrapper>
                            <ProgressRing />
                        </LoaderWrapper>
                    )
                }
            </ViewContent>
        </ViewWrapper>
        </>
    </View>;
}

const ServerStatus = styled.div`
    align-items: center;
    padding: 10px;
    background-color: var(--vscode-editorHoverWidget-background);
    &:hover {
        background-color: var(--vscode-list-hoverBackground);
    };
    display: flex;
`;

export type CircleStyleProp = {
    isRunning: boolean;
};

const ServerStatusIcon = styled.div<CircleStyleProp>`
    width: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
    width: 8px;
    height: 8px;
    border: 2px solid ${(props: CircleStyleProp) => (props.isRunning ? "green" : "red")};
    background: ${(props: CircleStyleProp) => (props.isRunning ? "green" : "red")};
    border-radius: 50%;
`;

const ViewWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: scroll;
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    width: 100vw;
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

const APIContentHeader = styled.div`
    padding: 10px;
    display: grid;
    grid-template-columns: 1fr 3fr 0.75fr;
    overflow: hidden;
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
