/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { TextField, Button, Codicon, Icon, ComponentCard, IconLabel, AutoComplete } from "@wso2-enterprise/ui-toolkit";
import React, { useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";
import SidePanelContext from "../SidePanelContexProvider";
import { getSVGIcon } from "../../../resources/icons/mediatorIcons/icons";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";

const SampleContainer = styled.div`
    display: grid;
    justify-items: center;
    padding: 16px;
    align-items: center;
    height: 90%;
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 30vh;
    width: 100vw;
`;

const ProgressRing = styled(VSCodeProgressRing)`
    height: 200px;
    width: 200px;
    margin-top: auto;
    padding: 4px;
`;

const SampleGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
`;

const IconContainer = styled.div`
    width: 40px;

    & img {
        width: 25px;
    }
`;

const ButtonGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 5px;
`;

export interface ConnectorPageProps {
    // nodePosition: any;
    // documentUri: string;
    setContent: any;
}

export function ConnectorPage(props: ConnectorPageProps) {
    const sidePanelContext = useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const [selectedConnector, setSelectedConnector] = useState(undefined);
    const [operation, setOperation] = useState<string>("");

    const fetchConnectors = async () => {
        const response = await fetch('https://raw.githubusercontent.com/rosensilva/connectors/main/connectors_list.json');
        const data = await response.json();
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            connectors: data.data,
        });
    };

    useEffect(() => {
        if (!sidePanelContext.connectors || sidePanelContext.connectors.length === 0) {
            fetchConnectors();
        }
    }, []);

    const setContent = (connector: any) => {
        setSelectedConnector(connector);
        props.setContent(connector, `${sidePanelContext.isEditing ? "Edit" : "Add"} ${connector}`);
    }

    const selectOperation = (operation: string) => {
        // getConnectorData
        const connectorUri = rpcClient.getMiDiagramRpcClient().getConnectorData({ connector: selectedConnector.name, url: selectedConnector.download_url });
        setOperation(operation);
    }

    const onBackClick = async () => {
        setSelectedConnector(undefined);
        setOperation("");
    }

    const onClick = async () => {
        console.log("submitted");
    };

    return (
        <>
            {!sidePanelContext.connectors ? (
                <LoaderWrapper>
                    <ProgressRing />
                </LoaderWrapper>
            ) : !selectedConnector ? (
                <div>
                    <h4>All Connectors</h4>
                    <ButtonGrid>
                        {sidePanelContext.connectors.sort((a: any, b: any) => a.rank - b.rank).map((connector: any) => (
                            <ComponentCard
                                key={connector.name}
                                onClick={() => setSelectedConnector(connector)}
                                sx={{
                                    '&:hover, &.active': {
                                        '.icon svg g': {
                                            fill: 'var(--vscode-editor-foreground)'
                                        },
                                        backgroundColor: 'var(--vscode-pickerGroup-border)',
                                        border: '1px solid var(--vscode-focusBorder)'
                                    },
                                    alignItems: 'center',
                                    border: '1px solid var(--vscode-editor-foreground)',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    height: 20,
                                    justifyContent: 'left',
                                    marginBottom: 10,
                                    padding: 10,
                                    transition: '0.3s',
                                    width: 180
                                }}
                            >
                                <IconContainer>
                                    {getSVGIcon("Aggregate")}
                                </IconContainer>
                                <div style={{
                                    width: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'left'
                                }}>
                                    <IconLabel>
                                        {connector.name}
                                    </IconLabel>
                                </div>
                            </ComponentCard>
                        ))}
                    </ButtonGrid>
                </div>) : (
                <>
                    <h4>All Operations</h4>
                    <ButtonGrid>
                        {Object.keys(selectedConnector.operations).map((operation: any) => (
                            <ComponentCard
                                key={operation}
                                onClick={() => selectOperation(operation)}
                                sx={{
                                    '&:hover, &.active': {
                                        '.icon svg g': {
                                            fill: 'var(--vscode-editor-foreground)'
                                        },
                                        backgroundColor: 'var(--vscode-pickerGroup-border)',
                                        border: '1px solid var(--vscode-focusBorder)'
                                    },
                                    alignItems: 'center',
                                    border: '1px solid var(--vscode-editor-foreground)',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    height: 20,
                                    justifyContent: 'left',
                                    marginBottom: 10,
                                    padding: 10,
                                    transition: '0.3s',
                                    width: 180
                                }}
                            >
                                <IconContainer>
                                    {getSVGIcon("loopback")}
                                </IconContainer>
                                <div style={{
                                    width: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'left'
                                }}>
                                    <IconLabel>{operation}</IconLabel>
                                </div>
                            </ComponentCard>
                        ))}
                    </ButtonGrid>
                    <div style={{
                        display: "flex",
                        textAlign: "right",
                        justifyContent: "flex-end",
                        marginTop: "10px",
                        marginRight: "10px",
                        gap: "10px"
                    }}>
                        <Button
                            appearance="secondary"
                            onClick={onBackClick}
                        >
                            Back
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={onClick}
                        >
                            Submit
                        </Button>
                    </div>
                </>
            )}
        </>
    )
}
