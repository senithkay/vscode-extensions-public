/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ComponentCard, IconLabel, AutoComplete, RequiredFormInput, FormView } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { VSCodeDropdown, VSCodeOption, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Controller, useForm } from "react-hook-form";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import AddConnection from "./ConnectionFormGenerator";

const LoaderWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 15px;
    height: 100px;
    width: 100%;
`;

const ProgressRing = styled(VSCodeProgressRing)`
    height: 50px;
    width: 50px;
    margin-top: auto;
    padding: 4px;
`;

const IconContainer = styled.div`
    width: 50px;

    & img {
        width: 50px;
    }
`;

const VersionTag = styled.div`
    color: #808080;
    font-size: 10px;
    padding-left: 2px;
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

const CardLabel = styled.div`
    display: flex;
    flex-direction: row;
    align-self: flex-start;
    width: 100%;
`;

const SampleGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
`;

const Field = styled.div`
    margin-bottom: 20px;
`;

const SubTitle = styled.div`
    margin-bottom: 10px;
`;

export interface ConnectionFormProps {
    path: string;
}

export function ConnectionForm(props: ConnectionFormProps) {
    const { rpcClient } = useVisualizerContext();
    const [localConnectors, setLocalConnectors] = useState<any[]>(undefined);
    const [connectionTypes, setConnectionTypes] = useState<any[]>();
    const [isGeneratingForm, setIsGeneratingForm] = useState(false);
    const [selectedConnector, setSelectedConnector] = useState<any>();
    const [selectedOperation, setSelectedOperation] = useState<string>();
    const { control, handleSubmit, watch, reset } = useForm();

    const fetchLocalConnectorData = async () => {
        const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({ documentUri: props.path, connectorName: "" });
        if (connectorData) {
            const connectorsWithIcons = await Promise.all(connectorData.connectors.map(async (connector) => {
                const iconPathUri = await rpcClient.getMiDiagramRpcClient().getIconPathUri({ path: connector.iconPath, name: "icon-small" });
                return { ...connector, iconPathUri };
            }));
            setLocalConnectors(connectorsWithIcons);
        } else {
            setLocalConnectors([]);
        }
    };

    useEffect(() => {
        fetchLocalConnectorData()
    }, []);

    const selectConnector = async (connector: any) => {
        setSelectedConnector(connector);
    }

    const selectOperation = async (connector: any, operation: string) => {
        setSelectedOperation(operation);
        await checkConnections(connector, operation);
    }

    const checkConnections = async (connector: any, operation: string): Promise<string[]> => {
        const formJSON = await rpcClient.getMiDiagramRpcClient().getConnectorForm({ uiSchemaPath: connector.uiSchemaPath, operation: operation });
        const allowedConnectionTypes = findAllowedConnectionTypes((formJSON as any).formJSON.elements);
        setConnectionTypes(allowedConnectionTypes);
        return allowedConnectionTypes;
    }

    const findAllowedConnectionTypes = (elements: any[]): string[] | undefined => {
        for (let element of elements) {
            if (element.type === 'attribute' && element.value.inputType === 'connection') {
                return element.value.allowedConnectionTypes;
            }
            if (element.type === 'attributeGroup') {
                const result: any[] = findAllowedConnectionTypes(element.value.elements);
                if (result) return result;
            }
        }
    };

    const onAddConnection = async () => {
        openOverview();
    };

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };


    return (
        <FormView title={`Add New Connection`} onClose={handleOnClose}>
            {isGeneratingForm ? (
                <LoaderWrapper>
                    <ProgressRing />
                    Generating options...
                </LoaderWrapper>
            ) : !selectedConnector ? (
                <>
                    <div>
                        <SubTitle>Local Connectors</SubTitle>
                        {localConnectors === undefined ? (
                            <LoaderWrapper>
                                <ProgressRing />
                                Loading connectors...
                            </LoaderWrapper>
                        ) : localConnectors.length === 0 ? (
                            <LoaderWrapper>
                                No local connectors available. Please add connectors to create connections..
                            </LoaderWrapper>
                        ) : (
                            <SampleGrid>
                                {localConnectors.map((connector: any) => (
                                    <ComponentCard
                                        key={connector.name}
                                        onClick={() => selectConnector(connector)}
                                        sx={{
                                            alignItems: 'center',
                                            border: '1px solid var(--vscode-editor-foreground)',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'left',
                                            marginBottom: 10,
                                            padding: 10,
                                            transition: '0.3s',
                                            width: '100px',
                                            height: '100px'
                                        }}
                                    >
                                        <CardContent>
                                            <CardLabel>
                                                <div style={{
                                                    width: '100%',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    textAlign: 'center',
                                                    paddingBottom: '10px'
                                                }}>
                                                    <IconLabel>
                                                        {connector.name}
                                                    </IconLabel>
                                                    <VersionTag>
                                                        {connector.version}
                                                    </VersionTag>
                                                </div>
                                            </CardLabel>
                                            <IconContainer>
                                                <img
                                                    src={connector.iconPathUri.uri}
                                                    alt="Icon"
                                                />
                                            </IconContainer>
                                        </CardContent>
                                    </ComponentCard>
                                ))}
                            </SampleGrid>
                        )}
                    </div>
                </>
            ) : (
                <div style={{ height: "calc(100vh - 100px)", overflow: "auto", paddingRight: "10px" }}>
                    <Controller
                        name={"Operation"}
                        control={control}
                        defaultValue={selectedOperation}
                        render={() => (
                            <Field>
                                <label>{"Operation"}</label> <RequiredFormInput />
                                <AutoComplete
                                    identifier={"operation"}
                                    items={
                                        selectedConnector?.actions.map((operation: any) => (
                                            operation.isHidden ? null : operation.name
                                        ))
                                    }
                                    value={selectedOperation}
                                    onValueChange={(e: any) => {
                                        selectOperation(selectedConnector, e);
                                    }}
                                    required={true} />
                            </Field>
                        )}
                    />
                    {connectionTypes && connectionTypes.length > 0 && (
                        <AddConnection
                            documentUri={props.path}
                            allowedConnectionTypes={connectionTypes}
                            onNewConnection={onAddConnection}
                            connector={selectedConnector} />
                    )}
                </div>
            )}
        </FormView>
    );
}