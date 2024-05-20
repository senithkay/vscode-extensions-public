/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode, useMemo } from 'react';

import styled from "@emotion/styled";
import { Button, Codicon, Icon } from '@wso2-enterprise/ui-toolkit';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { InputOutputPortModel } from '../../Port';
import { SUB_MAPPING_INPUT_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { TreeContainer } from '../commons/Tree/Tree';
import { DMSubMapping } from "./index";
import { useIONodesStyles } from '../../../styles';
import { SubMappingItemWidget } from './SubMappingItemWidget';

export interface LetExpressionTreeWidgetProps {
    subMappings: DMSubMapping[];
    engine: DiagramEngine;
    context: IDataMapperContext;
    getPort: (portId: string) => InputOutputPortModel;
}

export function SubMappingTreeWidget(props: LetExpressionTreeWidgetProps) {
    const { engine, subMappings, context, getPort } = props;
    const searchValue = useDMSearchStore.getState().inputSearch;
    const classes = useIONodesStyles();
    const isFocusedView = context.views.length > 1;

    const onClick = () => {
        // TODO 
    };

    const subMappingItems: ReactNode[] = subMappings.map(mapping => {
        return (
            <SubMappingItemWidget
                key={`${SUB_MAPPING_INPUT_SOURCE_PORT_PREFIX}.${mapping.name}`}
                id={`${SUB_MAPPING_INPUT_SOURCE_PORT_PREFIX}.${mapping.name}`}
                engine={engine}
                declaration={mapping.declaration}
                context={context}
                type={mapping.type}
                getPort={(portId: string) => getPort(portId) as InputOutputPortModel}
                valueLabel={mapping.name}
            />
        );
    }).filter(mapping => !!mapping);

    return (
        <>
            {subMappingItems.length > 0 ? (
                <TreeContainer data-testid={"local-variables-node"}>
                    <SubMappingsHeader>
                        <HeaderText>Sub Mappings</HeaderText>
                        {!isFocusedView && (
                            <Button
                                appearance="icon"
                                tooltip="Edit"
                                onClick={onClick}
                                data-testid={"edit-local-variables-btn"}
                                sx={{ paddingRight: "8px" }}
                            >
                                <Icon name="editIcon" />
                            </Button>
                        )}
                    </SubMappingsHeader>
                    {subMappingItems}
                </TreeContainer>
            ) : !isFocusedView && !searchValue && (
                <Button
                    className={classes.addLocalVariableButton}
                    appearance='icon'
                    aria-label="add"
                    onClick={onClick}
                    data-testid={"add-local-variable-btn"}
                >
                    <Codicon name="add" iconSx={{ color: "var(--button-primary-foreground)"}} />
                    <div>Add Sub Mapping</div>
                </Button>
            )}
        </>
    );
}

const SubMappingsHeader = styled.div`
    background: var(--vscode-editorWidget-background);
    width: 100%;
    line-height: 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: default;
`;

const HeaderText = styled.span`
    margin-left: 10px;
    min-width: 280px;
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-inputOption-activeForeground)
`;
