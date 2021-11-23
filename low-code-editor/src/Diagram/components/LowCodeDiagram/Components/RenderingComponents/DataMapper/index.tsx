/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
/* tslint:disable:jsx-no-multiline-js */
import React, { useContext, useEffect, useState } from 'react';

import {
    AssignmentStatement,
    CaptureBindingPattern,
    STKindChecker,
    STNode,
} from '@wso2-enterprise/syntax-tree';

import { Context as DiagramContext } from '../../../../../../Contexts/Diagram';
import { GenerationType } from '../../../../FormComponents/ConfigForms/ProcessConfigForms/ProcessForm/AddDataMappingConfig/OutputTypeSelector';
import { DataMapperInputTypeInfo, DataMapperOutputTypeInfo } from '../../../../FormComponents/Types';

import { DataMapperWrapper } from './components/DataMapperWrapper';
import './components/InputTypes/style.scss';
import { Provider as DataMapperViewProvider } from './context/DataMapperViewContext';
import { DEFAULT_FIELD_WIDTH } from './util/datamapper-sizing-visitor';
import { DataMapperState } from './util/types';
import { FieldViewState } from './viewstate';

interface DataMapperProps {
    width: number;
}

export function DataMapper(props: DataMapperProps) {
    const {
        state: {
            dataMapperConfig,
        },
        actions: {
            dataMapperStart, updateDataMapperConfig
        },
        api: {
            panNZoom: { fitToScreen },
            code: {
                modifyDiagram: dispatchMutations
            },
            ls: {
                getDiagramEditorLangClient
            }
        },
        props: {
            stSymbolInfo,
            isMutationProgress,
            langServerURL
        }
    } = useContext(DiagramContext);

    useEffect(() => {
        fitToScreen();
    }, []);

    const [showAddVariableForm, setShowAddVariableForm] = useState(false);
    const squashConstants = false;

    let outputSTNode; //

    const maxFieldWidth: number = DEFAULT_FIELD_WIDTH;
    const inputSTNodes: STNode[] = [];
    const constantMap: Map<string, FieldViewState> = new Map();
    const constantList: FieldViewState[] = [];

    if (dataMapperConfig) {
        const inputVariableInfo: DataMapperInputTypeInfo[] = dataMapperConfig.inputTypes;

        inputVariableInfo.forEach(varInfo => {
            stSymbolInfo.variables.get(varInfo.type).forEach((node: STNode) => {
                let varName: string;
                if (STKindChecker.isLocalVarDecl(node)) {
                    varName = (node.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
                } else if (STKindChecker.isRequiredParam(node)) {
                    varName = node.paramName.value;
                } else if (node.kind === 'ResourcePathSegmentParam') {
                    varName = (node as any).paramName.value; // todo: change when syntax tree interfaces are updated
                }

                if (varName === varInfo.name) {
                    inputSTNodes.push(node);
                }
            });
        });

        let outputType: string = '';

        if (dataMapperConfig.outputType?.type) {
            switch (dataMapperConfig.outputType.type) {
                case 'record':
                    const typeInfo = dataMapperConfig.outputType.typeInfo;
                    outputType = !dataMapperConfig.outputType.typeDefInSameModule ?
                        `${typeInfo.moduleName}:${typeInfo.name}`
                        : typeInfo.name;
                    break;
                case 'json':
                    outputType = 'json';
                    break;
                default:
                    outputType = dataMapperConfig.outputType.type;
            }
        }

        const outputTypeConfig = dataMapperConfig.outputType as DataMapperOutputTypeInfo;

        if (outputTypeConfig) {
            if (outputTypeConfig.generationType === GenerationType.NEW) {
                const outputTypeVariables = stSymbolInfo.variables.size > 0 ? stSymbolInfo.variables.get(outputType) : undefined;
                outputSTNode = outputTypeVariables ?
                    outputTypeVariables
                        .find((node: STNode) => {
                            if (STKindChecker.isLocalVarDecl(node)) {
                                const varName =
                                    (node.typedBindingPattern.bindingPattern as CaptureBindingPattern)
                                        .variableName.value;
                                return varName === outputTypeConfig.variableName;
                            }
                        })
                    : undefined;
            } else {
                const outputTypeVariables = stSymbolInfo.assignmentStatement.size > 0 ?
                    stSymbolInfo.assignmentStatement.get(outputTypeConfig.variableName)
                    : undefined;
                outputSTNode = outputTypeVariables ?
                    outputTypeVariables
                        .find((node: AssignmentStatement) =>
                            node.position.startLine === dataMapperConfig.outputType.startLine)
                    : undefined;
            }
        }
    }

    const initialState: DataMapperState = {
        inputSTNodes,
        outputSTNode,
        stSymbolInfo,
        showAddVariableForm: false,
        showConfigureOutputForm: isMutationProgress ? false : outputSTNode === undefined,
        isExistingOutputSelected: false,
        isJsonRecordTypeSelected: false,
        showAddJsonFieldForm: false,
        dataMapperConfig,
        maxFieldWidth,
        updateDataMapperConfig,
        dataMapperStart,
        dispatchMutations,
        constantMap,
        constantList,
        squashConstants,
        isInitializationInProgress: true,
        langServerURL,
        getDiagramEditorLangClient,
        // draftArrows: []
    }

    return (
        <>
            <DataMapperViewProvider initialState={initialState} >
                <DataMapperWrapper {...initialState} />
            </DataMapperViewProvider>
        </>
    )

}
