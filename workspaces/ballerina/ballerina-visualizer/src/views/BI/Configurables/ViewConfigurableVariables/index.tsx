/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { ConfigVariable, EVENT_TYPE, FlowNode, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Button, Codicon, Typography, View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import { BodyText } from "../../../styles";
import { BIHeader } from "../../BIHeader";
import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow, VSCodeTag } from '@vscode/webview-ui-toolkit/react';
import { EditForm } from "../EditConfigurableVariables";
import { AddForm } from "../AddConfigurableVariables";
import { DiagnosticsPopUp } from "../../../../components/DiagnosticsPopUp";

const Container = styled.div`
    width: 100%;
`;

namespace S {

    export const Row = styled.div`
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    `;

    export const ConfigWrapper = styled.div`
        display: flex;
        flexDirection: row;
        justify-content: space-between;
        align-items: center;
    `;

    export const ConfigData = styled.div`
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    export const ConfigDataControls = styled.div`
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100px;
    `;
}

export interface ConfigProps {
    variableIndex?: number;
    isExternallauncher?: boolean;
}

export function ViewConfigurableVariables(props?: ConfigProps) {

    const { rpcClient } = useRpcContext();

    const [configVariables, setConfigVariables] = useState<ConfigVariable[]>([]);
    const [isEditConfigVariableFormOpen, setEditConfigVariableFormOpen] = useState<boolean>(false);
    const [isAddConfigVariableFormOpen, setAddConfigVariableFormOpen] = useState<boolean>(false);
    const [configIndex, setConfigIndex] = useState<number>(null);
    const [showProgressIndicator, setShowProgressIndicator] = useState(false);
    const selectedNodeRef = useRef<FlowNode>();

    const handleEditConfigVariableFormOpen = (index: number) => {
        setEditConfigVariableFormOpen(true);
        setConfigIndex(index);
    };

    const handleAddConfigVariableFormOpen = () => {
        console.log("Add Config Variable Form Opened");
        setAddConfigVariableFormOpen(true);
    };

    // Handler to close the child component
    const handleEditConfigFormClose = () => {
        setEditConfigVariableFormOpen(false);
        setConfigIndex(null);

        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.ViewConfigVariables,
            },
        });

    };


    const handleAddConfigFormClose = () => {
        setAddConfigVariableFormOpen(false);
        getConfigVariables();
    };

    const handleOnDeleteConfigVariable = async (index: number) => {
        const delConfig = configVariables[index];

        const projectPath: string = (await rpcClient.getVisualizerLocation()).projectUri
        const filePath = projectPath.concat('/' + delConfig.codedata.lineRange.fileName);

        setShowProgressIndicator(true);
        rpcClient
            .getBIDiagramRpcClient()
            .deleteFlowNode({
                filePath: filePath,
                flowNode: delConfig,
            })
            .then((response) => {
                console.log(">>> Updated source code after delete", response);
                if (response.textEdits) {
                    // clear memory
                    selectedNodeRef.current = undefined;
                } else {
                    console.error(">>> Error updating source code", response);
                    // handle error
                }
            })
            .finally(() => {
                setShowProgressIndicator(false);
                getConfigVariables();
            });
    };

    useEffect(() => {
        console.log(">>> Get Config Variables");
        getConfigVariables();
    }, []);

     // Effect to handle prop changes
    useEffect(() => {
        if (props.variableIndex !== undefined && configVariables.length > 0) {
            // Open child component if props are provided
            setEditConfigVariableFormOpen(true);
            setConfigIndex(props.variableIndex);
        }
    }, [props?.variableIndex, configVariables]);

    const getConfigVariables = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .getConfigVariables()
            .then((variables) => {
                setConfigVariables(variables.configVariables);
            });
    };

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Container>
                    <Typography variant="h2">Configurable variables</Typography>
                    <S.Row>
                        <BodyText>
                            View and manage configurable variables in the Ballerina project.
                        </BodyText>

                        <Button appearance="primary" onClick={handleAddConfigVariableFormOpen}>
                            <Codicon name="add" sx={{ marginRight: 5 }} />Add Config Variables
                        </Button>
                    </S.Row>

                    {
                        configVariables.length > 0 ?

                            <VSCodeDataGrid>
                                {
                                    configVariables.map((variable, index) => {
                                        return (
                                            <VSCodeDataGridRow key={index}>
                                                <VSCodeDataGridCell grid-column={`1`} style={{ padding: "10px" }}>
                                                    <S.ConfigWrapper>
                                                        <S.ConfigData>
                                                            <div style={{ display: "flex", marginRight: "20px"}}>
                                                                <VSCodeTag style={{
                                                                    width: "100px",
                                                                    textAlign: "center",
                                                                    textTransform: "lowercase !important",
                                                                    fontWeight: "bold"
                                                                }}>
                                                                    {String(variable.properties.type.value)}
                                                                </VSCodeTag>
                                                            </div>
                                                            <div style={{ display: "flex", marginRight: "20px"}}>
                                                                {
                                                                    typeof variable.properties.variable.value === 'string' ?
                                                                        variable.properties.variable.value : ''
                                                                }
                                                                {variable?.diagnostics?.hasDiagnostics &&
                                                                    <>&nbsp;&nbsp;&nbsp;&nbsp;<DiagnosticsPopUp node={variable} /></>
                                                                }
                                                            </div>
                                                            {
                                                                variable.properties.defaultable.value && variable.properties.defaultable.value !== null ?
                                                                    variable.properties.defaultable.value === "?" ?
                                                                        null
                                                                        :  <div style={{ display: "flex", marginRight: "20px"}}>=</div>
                                                                    : null
                                                            }
                                                            <div style={{ display: "flex"}}>
                                                                {variable.properties.defaultable.value && variable.properties.defaultable.value !== null ?
                                                                    variable.properties.defaultable.value === "?" ?
                                                                        null
                                                                        : String(variable.properties.defaultable.value)
                                                                    : null}
                                                            </div>
                                                        </S.ConfigData>

                                                        <S.ConfigDataControls>
                                                            <Button appearance="secondary" onClick={(event) => handleEditConfigVariableFormOpen(index)} aria-label="Edit">
                                                                <Codicon name="edit" />
                                                            </Button>
                                                            <Button appearance="secondary" onClick={(event) => handleOnDeleteConfigVariable(index)} aria-label="Dlete">
                                                                <Codicon name="trash" />
                                                            </Button>
                                                        </S.ConfigDataControls>
                                                    </S.ConfigWrapper>
                                                </VSCodeDataGridCell>
                                            </VSCodeDataGridRow>

                                        );
                                    })
                                }
                            </VSCodeDataGrid>
                            : null
                    }


                    {isEditConfigVariableFormOpen &&
                        <EditForm
                            isOpen={isEditConfigVariableFormOpen}
                            onClose={handleEditConfigFormClose}
                            variable={configVariables[configIndex]}
                            title="Edit Configurable Variable"
                        />
                    }

                    {isAddConfigVariableFormOpen &&
                        <AddForm
                            isOpen={isAddConfigVariableFormOpen}
                            onClose={handleAddConfigFormClose}
                            title="Add Configurable Variable"
                        />
                    }
                </Container>
            </ViewContent>
        </View>
    );
}

export default ViewConfigurableVariables;
