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
// tslint:disable: jsx-no-lambda
// tslint:disable: jsx-no-multiline-js
// tslint:disable: jsx-wrap-multiline
// tslint:disable: no-unused-expression

import React, { useContext, useEffect, useState } from 'react';

import { CaptureBindingPattern, LocalVarDecl, STKindChecker, STNode } from '@ballerina/syntax-tree';

import { FormField, PrimitiveBalType, WizardType } from '../../../../../../ConfigurationSpec/types';
import { Context as DiagramContext } from '../../../../../../Contexts/Diagram';
import { STModification } from '../../../../../../Definitions';
import { getAllVariables } from '../../../../../utils/mixins';
import { createPropertyStatement, updatePropertyStatement } from '../../../../../utils/modification-util';
import { DraftInsertPosition } from '../../../../../view-state/draft';
import { wizardStyles } from "../../../../ConfigForms/style";
import { FormAutocomplete } from '../../../../Portals/ConfigForm/Elements/Autocomplete';
import { PrimaryButton } from '../../../../Portals/ConfigForm/Elements/Button/PrimaryButton';
import { SecondaryButton } from '../../../../Portals/ConfigForm/Elements/Button/SecondaryButton';
import { SelectDropdownWithButton } from '../../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton';
import { FormJson } from '../../../../Portals/ConfigForm/Elements/Json/FormJson';
import { SwitchToggle } from '../../../../Portals/ConfigForm/Elements/SwitchToggle';
import { FormTextInput } from '../../../../Portals/ConfigForm/Elements/TextField/FormTextInput';
import { useStyles as formStyles } from "../../../../Portals/ConfigForm/forms/style";
import { DataMapperConfig, DataMapperInputTypeInfo, DataMapperOutputTypeInfo } from '../../../../Portals/ConfigForm/types';
import { checkVariableName, genVariableName } from '../../../../Portals/utils';
import { Context as DataMapperContext } from '../../../context/DataMapperViewContext';
import { getDefaultValueForType, resetJsonValueToDefault } from '../../../util';

export enum GenerationType {
    ASSIGNMENT,
    NEW
}

export function OutputTypeConfigForm() {
    const { state: diagramState, props: { currentApp, stSymbolInfo: symbolInfo } } = useContext(DiagramContext);
    const { targetPosition } = diagramState;
    const targetpos = targetPosition as DraftInsertPosition;
    const {
        state: {
            dataMapperConfig,
            maxFieldWidth: fieldWidth,
            stSymbolInfo,
            dispatchMutations: onMutate,
            updateDataMapperConfig,
            outputSTNode,
            isExistingOutputSelected,
            isJsonRecordTypeSelected
        },
        dataMapperViewRedraw,
        toggleOutputConfigureForm,
        toggleSelectExistingOutputForm,
        toggleJsonRecordTypeOutputForm,
    } = useContext(DataMapperContext);

    const [isSaved] = useState(dataMapperConfig.outputType?.saved
        || dataMapperConfig.wizardType === WizardType.EXISTING);
    let defaultVariableName;

    if (dataMapperConfig.outputType && isSaved) {
        if (outputSTNode) {
            if (STKindChecker.isLocalVarDecl(outputSTNode)) {
                const captureBindingPattern: CaptureBindingPattern
                    = outputSTNode.typedBindingPattern.bindingPattern as CaptureBindingPattern;
                defaultVariableName = captureBindingPattern.variableName.value;
            } else {
                defaultVariableName = (dataMapperConfig as DataMapperConfig).outputType.variableName;
            }
        } else {
            defaultVariableName = (dataMapperConfig as DataMapperConfig).outputType.variableName;
        }
    } else {
        defaultVariableName = stSymbolInfo ?
            genVariableName('mappedValue', getAllVariables(stSymbolInfo)) : 'mappedValue';
    }

    const defaultGenerationType = (dataMapperConfig as DataMapperConfig).outputType?.generationType ?
        (dataMapperConfig as DataMapperConfig).outputType.generationType : GenerationType.NEW;

    let defaultDataType = 'string';
    let defaultJsonValue = '{}';


    if ((dataMapperConfig as DataMapperConfig).outputType?.type) {
        switch ((dataMapperConfig as DataMapperConfig).outputType?.type) {
            case 'json':
                defaultDataType = (dataMapperConfig as DataMapperConfig).outputType?.type;
                if (dataMapperConfig.outputType.saved && outputSTNode) {
                    if (STKindChecker.isAssignmentStatement(outputSTNode)
                        && STKindChecker.isMappingConstructor(outputSTNode.expression)) {
                        dataMapperConfig.outputType.sampleStructure = outputSTNode.expression.source;
                    } else if (STKindChecker.isLocalVarDecl(outputSTNode)
                        && STKindChecker.isMappingConstructor(outputSTNode.initializer)) {
                        dataMapperConfig.outputType.sampleStructure = outputSTNode.initializer.source;
                    }

                    defaultJsonValue = getDefaultValueForType(dataMapperConfig.outputType,
                        stSymbolInfo.recordTypeDescriptions, "")
                }
                break;
            case 'record':
                defaultDataType = (dataMapperConfig as DataMapperConfig).outputType?.type;
                break;
            default:
                defaultDataType = (dataMapperConfig as DataMapperConfig).outputType?.type;
        }
    }

    const [config] = useState(dataMapperConfig);
    const [generationType, setGenerationType] = useState<GenerationType>(defaultGenerationType);
    const [selectedDataType, setSelectedDataType] = useState<string>(defaultDataType);
    const [variableName, setVariableName] = useState<string>(defaultVariableName);
    const [variableNameError, setVariableNameError] = useState(defaultJsonValue);
    const [jsonValue, setJsonValue] = useState('');
    const [isJsonValid, setIsJsonValid] = useState(false);
    const [variableNameValid, setVariableNameValid] = useState(false);
    const [isVariableOptional, setIsVariableOptional] = useState(false);

    const formClasses = formStyles();
    const overlayClasses = wizardStyles();

    useEffect(() => {
        if (isSaved) {
            if (generationType === GenerationType.ASSIGNMENT) {
                toggleSelectExistingOutputForm();
            }

            if (defaultDataType === PrimitiveBalType.Json || defaultDataType === PrimitiveBalType.Record) {
                toggleJsonRecordTypeOutputForm();
            }

            dataMapperViewRedraw(outputSTNode);
        }
    }, []);

    const variables: DataMapperInputTypeInfo[] = [];

    // form field model for json type form
    const jsonFormField: FormField = {typeName: 'json', value: defaultJsonValue };

    stSymbolInfo.variables.forEach((definedVars: STNode[], type: string) => {
        definedVars
            .forEach((el: STNode) => {
                if (STKindChecker.isLocalVarDecl(el)) {
                    if (type !== 'var') {
                        variables.push({
                            name: (el.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value,
                            type,
                            // node: el
                        });
                    }
                } else if (STKindChecker.isRequiredParam(el)) {
                    // variables.push({
                    //     name: el.paramName.value,
                    //     type,
                    //     // node: el
                    // })
                }
            });
    });

    const handleOptionalToggleChange = () => {
        setIsVariableOptional(true);
    }

    const handleVariableNameChange = (value: string) => {
        config.outputType.variableName = value;
        setVariableName(value);
    }

    const handleOnJsonValueChange = (value: string) => {
        setJsonValue(value);
    }

    const handleUpdateRecordType = (evt: any, option: DataMapperOutputTypeInfo) => {
        config.outputType = {
            ...option,
            generationType,
            variableName,
            typeDefInSameModule: true
        }
    }

    const handleOnTypeChange = (value: string) => {
        switch (value.toLocaleLowerCase()) {
            case 'record':
                if (!isJsonRecordTypeSelected) {
                    toggleJsonRecordTypeOutputForm();
                };
                dataMapperViewRedraw(outputSTNode);
                setSelectedDataType(PrimitiveBalType.Record);
                break;
            case 'json':
                config.outputType = {
                    type: value.toLocaleLowerCase(),
                    generationType,
                    variableName
                }
                if (!isJsonRecordTypeSelected) {
                    toggleJsonRecordTypeOutputForm();
                };
                dataMapperViewRedraw(outputSTNode);
                setSelectedDataType(PrimitiveBalType.Json);
                break;
            default:
                config.outputType = {
                    type: value.toLocaleLowerCase(),
                    generationType,
                    variableName
                }
                if (isJsonRecordTypeSelected) {
                    toggleJsonRecordTypeOutputForm();
                };
                setSelectedDataType(value.toLocaleLowerCase());
        }
        dataMapperViewRedraw(outputSTNode);
    }

    const handleOnCancelBtnClick = () => {
        if (isJsonRecordTypeSelected) {
            toggleJsonRecordTypeOutputForm();
        }

        if (isExistingOutputSelected) {
            toggleSelectExistingOutputForm();
        }

        toggleOutputConfigureForm();
        dataMapperViewRedraw(outputSTNode);
    }

    const handleOnVariableSelect = (evt: any, variableOption: DataMapperInputTypeInfo) => {
        const nodeList: STNode[] = stSymbolInfo.variables.get(variableOption.type);
        const localVarDecl: LocalVarDecl = nodeList && nodeList.length > 0 ? nodeList[0] as LocalVarDecl : undefined;

        let typeInfo;
        let sampleStructure;

        if (localVarDecl) {
            const typeData = localVarDecl.typeData;
            if (typeData) {
                const typeSymbol = typeData.typeSymbol;
                if (typeSymbol) {
                    const moduleId = typeSymbol.moduleID;
                    if (moduleId) {
                        typeInfo = {
                            ...moduleId,
                            name: typeSymbol.name
                        }
                    }
                }
            }

            if (variableOption.type === PrimitiveBalType.Json) {
                if (localVarDecl.initializer && STKindChecker.isMappingConstructor(localVarDecl.initializer)) {
                    try {
                        const jsonStructure = JSON.parse(localVarDecl.initializer.source);
                        resetJsonValueToDefault(jsonStructure);
                        sampleStructure = JSON.stringify(jsonStructure);
                    } catch (e) {
                        sampleStructure = localVarDecl.initializer.source;
                    }
                }
            }
        }

        config.outputType = {
            type: variableOption.type,
            generationType,
            typeInfo,
            variableName: variableOption.name,
            sampleStructure,
        }
        setVariableName(variableOption.name);
    }

    const handleOutputConfigTypeChange = () => {
        if (generationType === GenerationType.NEW) {
            setGenerationType(GenerationType.ASSIGNMENT);
            toggleSelectExistingOutputForm(true);
        } else {
            setGenerationType(GenerationType.NEW);
            isExistingOutputSelected && toggleSelectExistingOutputForm();
            isJsonRecordTypeSelected && toggleJsonRecordTypeOutputForm(false);
            setSelectedDataType(PrimitiveBalType.String);
        }
        dataMapperViewRedraw(outputSTNode);
    }

    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("Data Mapper function name", value,
                variableName, symbolInfo);
            if (varValidationResponse?.error) {
                setVariableNameError(varValidationResponse.message);
                setVariableNameValid(false);
                return false;
            }
        }

        setVariableNameValid(true);
        return true;
    };

    const validateJsonExpression = (fieldName: string, isInvalid: boolean) => {
        if (!isInvalid) {
            config.outputType.sampleStructure = jsonValue;
            setIsJsonValid(true);
        } else {
            setIsJsonValid(false);
        }
    }

    const handleSave = () => {
        const modifications: STModification[] = [];

        if (isSaved) {
            config.outputType.startLine = outputSTNode ? outputSTNode.position.startLine : targetpos.line;
            const defaultReturn = getDefaultValueForType(config.outputType, stSymbolInfo.recordTypeDescriptions, "");

            let outputType = '';

            switch (config.outputType.type) {
                case 'json':
                    outputType = 'json';
                    break;
                case 'record':
                    const outputTypeInfo = config.outputType?.typeInfo;
                    outputType = config.outputType?.typeDefInSameModule ?
                        outputTypeInfo.name
                        : `${outputTypeInfo.moduleName}:${outputTypeInfo.name}`
                    break;
                default:
                    outputType = config.outputType.type;
            }

            const variableDefString = `${config.outputType.generationType === GenerationType.NEW ? outputType : ''}${isVariableOptional ? '?' : ''} ${variableName} = ${defaultReturn};`
            const dataMapperFunction: STModification = updatePropertyStatement(variableDefString, outputSTNode.position);
            modifications.push(dataMapperFunction);
        } else {
            config.outputType.startLine = targetpos.line;
            const defaultReturn = getDefaultValueForType(config.outputType, stSymbolInfo.recordTypeDescriptions, "");

            let outputType = '';

            switch (config.outputType.type) {
                case 'json':
                    outputType = 'json';
                    break;
                case 'record':
                    const outputTypeInfo = config.outputType?.typeInfo;
                    outputType = config.outputType?.typeDefInSameModule ?
                        outputTypeInfo.name
                        : `${outputTypeInfo.moduleName}:${outputTypeInfo.name}`
                    break;
                default:
                    outputType = config.outputType.type;
            }

            // config.outputType.sampleStructure = defaultReturn;
            const variableDefString
                = `${config.outputType.generationType === GenerationType.NEW ? outputType : ''}${isVariableOptional ? '?' : ''} ${variableName} = ${defaultReturn};`

            const dataMapperFunction: STModification = createPropertyStatement(variableDefString, targetpos);
            modifications.push(dataMapperFunction);
        }

        toggleOutputConfigureForm();
        onMutate(modifications);
        config.outputType.saved = true;
        updateDataMapperConfig(config);

    }

    const returnTypes: string[] = ['string', 'int', 'float', 'boolean', 'json', 'record'];
    const recordTypeArray: DataMapperOutputTypeInfo[] = [];

    stSymbolInfo.recordTypeDescriptions.forEach((node: STNode) => {
        const typeData = node.typeData;
        const typeSymbol = typeData.typeSymbol;
        const moduleID = typeSymbol.moduleID;

        if (moduleID) {
            recordTypeArray.push({
                variableName: '',
                type: 'record',
                typeInfo: {
                    name: typeSymbol.name,
                    ...moduleID
                }
            })
        }
    });

    const createNewVariableComponent = (
        <div>
            <SwitchToggle
                dataTestId={'create-optional-var-toggle'}
                text="Create Optional Variable"
                onChange={handleOptionalToggleChange}
                initSwitch={isVariableOptional}
            />
            <FormTextInput
                dataTestId="datamapper-variable-name"
                label={"Variable Name"}
                customProps={{
                    validate: validateNameValue
                }}
                onChange={handleVariableNameChange}
                defaultValue={defaultVariableName}
                errorMessage={variableNameError}
                placeholder={"Enter Variable Name"}
            />
            <SelectDropdownWithButton
                dataTestId={'datamapper-output-variable-type-dropdown'}
                defaultValue={selectedDataType} // todo: get the initial default value from parent
                onChange={handleOnTypeChange}
                customProps={{
                    disableCreateNew: true,
                    values: returnTypes
                }}
                placeholder="Select Type"
                label="Select Variable Type"
            />
            {selectedDataType === PrimitiveBalType.Record &&
                <FormAutocomplete
                    dataTestId={'datamapper-output-record-type-selector'}
                    value={
                        dataMapperConfig.outputType ?
                            {
                                ...dataMapperConfig.outputType
                            }
                            : null
                    }
                    itemList={recordTypeArray}
                    onChange={handleUpdateRecordType}
                    label={'Select output type'}
                    getItemLabel={(option) => option.typeInfo?.name}
                    renderItem={(option) => (
                        <React.Fragment>
                            <span><b>{option.typeInfo?.name}</b> {option.typeInfo?.moduleName}</span>
                        </React.Fragment>
                    )}
                />
            }
            {selectedDataType === PrimitiveBalType.Json &&
                <FormJson
                    model={jsonFormField}
                    onChange={handleOnJsonValueChange}
                    customProps={{
                        validate: validateJsonExpression,
                    }}
                />
            }
        </div>
    );

    const useExistingVariableComponent = (
        <>
            <FormAutocomplete
                dataTestId={'datamapper-output-exisiting-variable-select'}
                itemList={variables}
                label={'Select Output Variable'}
                onChange={handleOnVariableSelect}
                renderItem={(option) => (
                    <React.Fragment>
                        <span><b>{option.name}</b>: {option.type}</span>
                    </React.Fragment>
                )}
                getItemLabel={(option) => option.name}
            />
        </>
    );

    return (
        <>
            <div style={{ width: fieldWidth + 40 }}>
                <SwitchToggle
                    dataTestId={'use-existing-var-toggle'}
                    text="Use Existing Variable"
                    onChange={handleOutputConfigTypeChange}
                    initSwitch={generationType === GenerationType.ASSIGNMENT}
                />
                {generationType === GenerationType.NEW && createNewVariableComponent}
                {generationType === GenerationType.ASSIGNMENT && useExistingVariableComponent}
                <div className={overlayClasses.buttonWrapper} style={{ paddingTop: '0.5rem' }} >
                    {
                        outputSTNode && (
                            <SecondaryButton
                                dataTestId={"datamapper-output-config-cancel-btn"}
                                text="Cancel"
                                fullWidth={false}
                                onClick={handleOnCancelBtnClick}
                            />
                        )
                    }
                    <PrimaryButton
                        dataTestId={"datamapper-output-config-save-btn"}
                        disabled={!variableNameValid || variableName === "" || (selectedDataType === PrimitiveBalType.Json && !isJsonValid)}
                        text={"Save"}
                        fullWidth={false}
                        onClick={handleSave}
                    />
                </div>
            </div>
        </>
    );
}
// 315 & 222
