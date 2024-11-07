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
import { ConfigVariable, FlowNode } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Button, Codicon,Typography, View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import { BodyText } from "../../../styles";
import { BIHeader } from "../../BIHeader";
import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow } from '@vscode/webview-ui-toolkit/react';
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
}

export function ViewConfigurableVariables() {

    const { rpcClient } = useRpcContext();

    const [configVariables, setConfigVariables] = useState<ConfigVariable[]>([]);
    const [isEditConfigVariableFormOpen, setEditConfigVariableFormOpen] = useState<boolean>(false);
    const [isAddConfigVariableFormOpen, setAddConfigVariableFormOpen] = useState<boolean>(false);
    const [configIndex, setConfigIndex] = useState<number>(0);
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

    const handleEditConfigFormClose = () => {
        setEditConfigVariableFormOpen(false);
        getConfigVariables();
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
                                <VSCodeDataGridRow row-type="header">
                                    <VSCodeDataGridCell cell-type="columnheader" grid-column={`1`}>
                                        Variable
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell cell-type="columnheader" grid-column={`2`}>
                                        Type
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell cell-type="columnheader" grid-column={`3`}>
                                        Value
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell cell-type="columnheader" grid-column={`4`}>
                                        &nbsp;
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell cell-type="columnheader" grid-column={`5`}>
                                        &nbsp;
                                    </VSCodeDataGridCell>
                                </VSCodeDataGridRow>

                                {
                                    configVariables.map((variable, index) => {
                                        return (
                                            <VSCodeDataGridRow key={index}>
                                                <VSCodeDataGridCell grid-column={`1`}>
                                                    <div style={{ display: "flex" }}>
                                                        {
                                                            typeof variable.properties.variable.value === 'string' ?
                                                                variable.properties.variable.value : ''
                                                        }
                                                        {variable?.diagnostics?.hasDiagnostics &&
                                                            <>&nbsp;&nbsp;&nbsp;&nbsp;<DiagnosticsPopUp node={variable} /></>
                                                        }</div>
                                                </VSCodeDataGridCell>
                                                <VSCodeDataGridCell grid-column={`2`}>{variable.properties.type.value}</VSCodeDataGridCell>
                                                <VSCodeDataGridCell grid-column={`3`}>
                                                    {variable.properties.defaultable.value && variable.properties.defaultable.value !== null ?
                                                        variable.properties.defaultable.value === "?" ?
                                                            null
                                                            : variable.properties.defaultable.value
                                                        : null}
                                                </VSCodeDataGridCell>
                                                <VSCodeDataGridCell grid-column={`4`} style={{ display: "flex", justifyContent: "center" }}>
                                                    <Codicon name="edit" onClick={(event) => handleEditConfigVariableFormOpen(index)} />
                                                </VSCodeDataGridCell>
                                                <VSCodeDataGridCell grid-column={`5`} style={{ display: "flex", justifyContent: "center" }}>
                                                    <Codicon name="trash" onClick={(event) => handleOnDeleteConfigVariable(index)} />
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
