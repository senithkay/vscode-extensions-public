/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import * as React from 'react';

import styled from "@emotion/styled";
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { RecordFieldPortModel } from '../../Port';
import { MODULE_VARIABLE_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { TreeContainer } from '../commons/Tree/Tree';

import { DMModuleVarDecl } from "./index";
import { ModuleVariableItemWidget } from "./ModuleVariableItemWidget";

export interface ModuleVariableTreeWidgetProps {
    moduleVariables: DMModuleVarDecl[];
    engine: DiagramEngine;
    context: IDataMapperContext;
    getPort: (portId: string) => RecordFieldPortModel;
    handleCollapse: (portName: string, isExpanded?: boolean) => void;
}

export function ModuleVariableTreeWidget(props: ModuleVariableTreeWidgetProps) {
    const { engine, moduleVariables, getPort, handleCollapse } = props;
    const hasMappingsWithModuleVariables = moduleVariables.length > 0;

    return (
        <>
            {hasMappingsWithModuleVariables && (
                <TreeContainer>
                    <ModuleVarsHeader>
                        <HeaderText>Module Variables</HeaderText>
                    </ModuleVarsHeader>
                    {moduleVariables.map(moduleVar => {
                        return (
                            <>
                                <ModuleVariableItemWidget
                                    key={`${MODULE_VARIABLE_SOURCE_PORT_PREFIX}.${moduleVar.varName}`}
                                    id={`${MODULE_VARIABLE_SOURCE_PORT_PREFIX}.${moduleVar.varName}`}
                                    engine={engine}
                                    typeDesc={moduleVar.type}
                                    getPort={(portId: string) => getPort(portId) as RecordFieldPortModel}
                                    handleCollapse={handleCollapse}
                                    valueLabel={moduleVar.varName}
                                />
                            </>
                        );
                    })}
                </TreeContainer>
            )}
        </>
    );
}

const ModuleVarsHeader = styled.div`
    background: #f6f7fc;
    width: 100%;
    line-height: 35px;
    display: flex;
    justify-content: space-between;
`;

const HeaderText = styled.span`
    margin-left: 10px;
    min-width: 280px;
    font-size: 13px;
    font-weight: 600;
    font-family: "Gilmer",sans-serif;
`;
