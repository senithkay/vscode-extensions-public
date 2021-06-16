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
import React, { useContext, useEffect, useRef, useState } from 'react';

import {
    CaptureBindingPattern,
    LocalVarDecl,
    STKindChecker,
    STNode,
} from '@ballerina/syntax-tree';

import { PrimitiveBalType } from '../../../ConfigurationSpec/types';
import { Context as DiagramContext } from '../../../Contexts/Diagram';
import { STModification } from '../../../Definitions';
import { GenerationType } from '../ConfigForms/ProcessConfigForms/ProcessOverlayForm/AddDataMappingConfig/OutputTypeSelector';
import "../DataMapper/components/InputTypes/style.scss";
import { DataMapperInputTypeInfo, DataMapperOutputTypeInfo } from '../Portals/ConfigForm/types';

import { DataMapperWrapper } from './components/DataMapperWrapper';
import './components/InputTypes/style.scss';
import { Provider as DataMapperViewProvider } from './context/DataMapperViewContext';
// import { dataMapperSizingAndPositioning } from './util';
import { DataMapperState } from './util/types';
import { FieldViewState } from './viewstate';

interface DataMapperProps {
    width: number;
}

export function DataMapper(props: DataMapperProps) {
    const {
        state, dataMapperStart, updateDataMapperConfig
    } = useContext(DiagramContext);

    const {
        appInfo,
        stSymbolInfo,
        onMutate,
        dataMapperConfig,
        currentApp,
        onFitToScreen,
        langServerURL,
        getDiagramEditorLangClient
    } = state;

    // ToDo: Get the modifyDiagram from the proper context.
    const dispatchMutations = (mutations: STModification[], options: any = {}) => {
        onMutate('DIAGRAM', { mutations, ...options });
    }

    useEffect(() => {
        onFitToScreen(appInfo?.currentApp?.id);
    }, []);

    const [showAddVariableForm, setShowAddVariableForm] = useState(false);
    const squashConstants = false;

    let outputSTNode; //

    let maxFieldWidth: number = 200;
    const inputSTNodes: STNode[] = [];
    let constantMap: Map<string, FieldViewState> = new Map();
    let constantList: FieldViewState[] = [];

    if (dataMapperConfig) {
        const inputVariableInfo: DataMapperInputTypeInfo[] = dataMapperConfig.inputTypes;

        inputVariableInfo.forEach(varInfo => {
            stSymbolInfo.variables.get(varInfo.type).forEach((node: STNode) => {
                let varName: string;
                if (STKindChecker.isLocalVarDecl(node)) {
                    varName = (node.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
                } else if (STKindChecker.isRequiredParam(node)) {
                    varName = node.paramName.value;
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
                    outputType = typeInfo.moduleName !== currentApp.name ?
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
                        .find((node: LocalVarDecl) => node.position.startLine === dataMapperConfig.outputType.startLine)
                    : undefined;
            } else {
                const outputTypeVariables = stSymbolInfo.variables.size > 0 ?
                    stSymbolInfo.assignmentStatement.get(outputTypeConfig.variableName)
                    : undefined;
                outputSTNode = outputTypeVariables ?
                    outputTypeVariables
                        .find((node: LocalVarDecl) => node.position.startLine === dataMapperConfig.outputType.startLine)
                    : undefined;
            }
        }

        // const sizingAndPositioningResult = dataMapperSizingAndPositioning(
        //     inputSTNodes, outputSTNode, stSymbolInfo, showAddVariableForm, dataMapperConfig, updateDataMapperConfig);

        // constantMap = sizingAndPositioningResult.constantMap;
        // constantList = sizingAndPositioningResult.constantList;
        // maxFieldWidth = sizingAndPositioningResult.maxFieldWidth;
    }

    const initialState: DataMapperState = {
        inputSTNodes,
        outputSTNode,
        stSymbolInfo,
        showAddVariableForm: false,
        showConfigureOutputForm: state.isMutationProgress ? false : outputSTNode === undefined,
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
        getDiagramEditorLangClient
    }

    return (
        <>
            <DataMapperViewProvider initialState={initialState} >
                <DataMapperWrapper {...initialState} />
            </DataMapperViewProvider>
        </>
    )

}
