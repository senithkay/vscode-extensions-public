/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { ConfigVariable } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Button, Codicon, Typography, View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import { BodyText } from "../../../styles";
import { BIHeader } from "../../BIHeader";
import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow } from '@vscode/webview-ui-toolkit/react';
import { EditForm } from "../EditConfigurableVariables";
import { AddForm } from "../AddConfigurableVariables";

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
    const [dataSaved, setDataSaved] = useState(true);

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
    };

    const handleAddConfigFormClose = () => {
        setAddConfigVariableFormOpen(false);
        setDataSaved(true);
    };

    useEffect(() => {
        if (dataSaved) {
            getConfigVariables();
            setDataSaved(false);
        }
    }, [dataSaved]);

    const getConfigVariables = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .getConfigVariables()
            .then((variables) => {
                setConfigVariables(variables.configVariables);
                setDataSaved(false);
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
                                    <VSCodeDataGridCell cell-type="columnheader" grid-column={`1 + 1`}>
                                        Variable
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell cell-type="columnheader" grid-column={`1 + 1`}>
                                        Type
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell cell-type="columnheader" grid-column={`1 + 1`}>
                                        Value
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell cell-type="columnheader" grid-column={`1 + 1`}>
                                        &nbsp;
                                    </VSCodeDataGridCell>
                                </VSCodeDataGridRow>

                                {
                                    configVariables.map((variable, index) => {
                                        return (
                                            <VSCodeDataGridRow key={variable.properties.variable.value + index}>
                                                <VSCodeDataGridCell grid-column={`1 + 1`}>{variable.properties.variable.value}</VSCodeDataGridCell>
                                                <VSCodeDataGridCell grid-column={`1 + 1`}>{variable.properties.type.value}</VSCodeDataGridCell>
                                                <VSCodeDataGridCell grid-column={`1 + 1`}>
                                                    {
                                                        variable.properties.defaultable.value &&
                                                            variable.properties.defaultable.value !== "null" ?
                                                            variable.properties.defaultable.value === "?" ?
                                                                null
                                                                : variable.properties.defaultable.value.replaceAll('"', '')
                                                            : null
                                                    }
                                                </VSCodeDataGridCell>
                                                <VSCodeDataGridCell grid-column={`1 + 1`} style={{ display: "flex" }}>
                                                    <Codicon name="edit" onClick={(event) => handleEditConfigVariableFormOpen(index)} />
                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                    <Codicon name="trash" />
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
