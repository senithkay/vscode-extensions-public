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

import React, { useContext, useState } from 'react';

import { CaptureBindingPattern, LocalVarDecl, STKindChecker, STNode } from '@ballerina/syntax-tree';
import { Box, FormControl, Typography } from '@material-ui/core';
import { CloseRounded } from '@material-ui/icons';

import { Context as DiagramContext } from '../../../../../../Contexts/Diagram';
import { STModification } from '../../../../../../Definitions';
import { getAllVariables } from '../../../../../utils/mixins';
import { createPropertyStatement } from '../../../../../utils/modification-util';
import { wizardStyles } from "../../../../ConfigForms/style";
import { FormAutocomplete } from '../../../../Portals/ConfigForm/Elements/Autocomplete';
import { ButtonWithIcon } from '../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon';
import { PrimaryButton } from '../../../../Portals/ConfigForm/Elements/Button/PrimaryButton';
import { SecondaryButton } from '../../../../Portals/ConfigForm/Elements/Button/SecondaryButton';
import { SelectDropdownWithButton } from '../../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton';
import { FormJson } from '../../../../Portals/ConfigForm/Elements/Json/FormJson';
import { SwitchToggle } from '../../../../Portals/ConfigForm/Elements/SwitchToggle';
import { FormTextInput } from '../../../../Portals/ConfigForm/Elements/TextField/FormTextInput';
import { useStyles as formStyles } from "../../../../Portals/ConfigForm/forms/style";
import { DataMapperConfig, DataMapperInputTypeInfo, DataMapperOutputTypeInfo } from '../../../../Portals/ConfigForm/types';
import { checkVariableName, genVariableName } from '../../../../Portals/utils';
import { getDefaultValueForType } from '../../../util';
interface OutputTypeConfigForm {
    fieldWidth: number;
    dataMapperConfig: DataMapperConfig
    toggleVariablePicker: () => void;
    onExistingVarOptionSelected: (status: boolean) => void;
    onJsonRecordTypeSelected: (status: boolean) => void;
}

enum SelectedDataType {
    RECORD,
    JSON,
    DEFAULT
}

export enum GenerationType {
    ASSIGNMENT,
    NEW
}

export function OutputTypeConfigForm(props: OutputTypeConfigForm) {
    const { state: diagramState, updateDataMapperConfig } = useContext(DiagramContext)
    const { onMutate, trackAddStatement, stSymbolInfo, currentApp, targetPosition } = diagramState;
    const defaultVariableName = stSymbolInfo ?
        genVariableName('mappedValue', getAllVariables(stSymbolInfo)) : 'mappedValue';
    const {
        dataMapperConfig,
        toggleVariablePicker,
        fieldWidth,
        onExistingVarOptionSelected,
        onJsonRecordTypeSelected
    } = props;
    const [config] = useState(dataMapperConfig);
    const [generationType, setGenerationType] = useState<GenerationType>(GenerationType.NEW);
    const [selectedDataType, setSelectedDataType] = useState<SelectedDataType>(SelectedDataType.DEFAULT);
    const [variableName, setVariableName] = useState<string>(defaultVariableName);
    const [variableNameError, setVariableNameError] = useState('');
    const [variableNameValidity, setvariableNameValidity] = useState(false);
    const [jsonValue, setJsonValue] = useState('');
    const [jsonValueValidity, setJsonValueValidity] = useState(false);
    const formClasses = formStyles();
    const overlayClasses = wizardStyles();

    const variables: DataMapperInputTypeInfo[] = [];
    const jsonFormField = { isParam: true, type: 'json' } // form field model for json type form

    stSymbolInfo.variables.forEach((definedVars: STNode[], type: string) => {
        definedVars
            .forEach((el: STNode) => {
                if (STKindChecker.isLocalVarDecl(el)) {
                    variables.push({
                        name: (el.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value,
                        type,
                        node: el
                    })
                } else if (STKindChecker.isRequiredParam(el)) {
                    variables.push({
                        name: el.paramName.value,
                        type,
                        node: el
                    })
                }
            });
    });

    const handleOnJsonValueChange = (value: string) => {
        setJsonValue(value);
    }

    const handleUpdateRecordType = (evt: any, option: DataMapperOutputTypeInfo) => {
        config.outputType = {
            ...option,
            generationType,
            variableName
        }
    }

    const handleOnTypeChange = (value: string) => {
        switch (value.toLocaleLowerCase()) {
            case 'record':
                setSelectedDataType(SelectedDataType.RECORD);
                onJsonRecordTypeSelected(true);
                break;
            case 'json':
                setSelectedDataType(SelectedDataType.JSON);
                onJsonRecordTypeSelected(true);
                config.outputType = {
                    type: value.toLocaleLowerCase(),
                    generationType,
                    variableName
                }
                break;
            default:
                setSelectedDataType(SelectedDataType.DEFAULT);
                onJsonRecordTypeSelected(false);
                config.outputType = {
                    type: value.toLocaleLowerCase(),
                    generationType,
                    variableName
                }
        }
    }

    const handleOnVariableSelect = (evt: any, variableOption: DataMapperInputTypeInfo) => {
        const localVarDecl: LocalVarDecl = variableOption.node as LocalVarDecl;
        let typeInfo;

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
        }

        config.outputType = {
            type: variableOption.type,
            generationType,
            typeInfo,
            variableName: variableOption.name
        }
    }

    const handleOutputConfigTypeChange = () => {
        if (generationType === GenerationType.NEW) {
            setGenerationType(GenerationType.ASSIGNMENT);
            onExistingVarOptionSelected(true);
        } else {
            setGenerationType(GenerationType.NEW);
            onExistingVarOptionSelected(false);
        }
    }

    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("Data Mapper function name", value,
                variableName, diagramState);
            if (varValidationResponse?.error) {
                setVariableNameError(varValidationResponse.message);
                setvariableNameValidity(false);
                return false;
            }
        }
        setvariableNameValidity(true);
        return true;
    };

    const validateJsonExpression = (fieldName: string, isInvalid: boolean) => {
        if (!isInvalid) {
            config.outputType.sampleStructure = jsonValue;
            setJsonValueValidity(true);
        } else {
            setJsonValueValidity(false);
        }
    }

    const handleSave = () => {
        const modifications: STModification[] = [];
        config.outputType.startLine = targetPosition.line;
        const defaultReturn = getDefaultValueForType(config.outputType, stSymbolInfo.recordTypeDescriptions, "");

        let outputType = '';

        switch (config.outputType.type) {
            case 'json':
                outputType = 'json';
                // config.outputType.type = 'record'; // todo: handle conversion to json
                // outputType = `record {|${generateInlineRecordForJson(JSON.parse(config.outputType.sampleStructure))}|}`;
                // conversionStatement = `json ${config.outputType.variableName}Json = ${config.outputType.variableName}.toJson();`
                break;
            case 'record':
                const outputTypeInfo = config.outputType?.typeInfo;
                outputType = outputTypeInfo.moduleName === currentApp.name ?
                    outputTypeInfo.name
                    : `${outputTypeInfo.moduleName}:${outputTypeInfo.name}`
                break;
            default:
                outputType = config.outputType.type;
        }


        const variableDefString = `${config.outputType.generationType === GenerationType.NEW ? outputType : ''} ${config.outputType.variableName} = ${defaultReturn};`

        const dataMapperFunction: STModification = createPropertyStatement(variableDefString, targetPosition);
        modifications.push(dataMapperFunction);

        onMutate(modifications);
        toggleVariablePicker();
    }

    const returnTypes: string[] = ['String', 'Int', 'Float', 'Boolean', 'Json', 'Record'];
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
            <FormTextInput
                dataTestId="datamapper-variable-name"
                label={"Variable Name"}
                customProps={{
                    validate: validateNameValue
                }}
                onChange={setVariableName}
                defaultValue={variableName}
                errorMessage={variableNameError}
                placeholder={"Enter Variable Name"}
            />
            <SelectDropdownWithButton
                defaultValue={'String'} // todo: get the initial default value from parent
                onChange={handleOnTypeChange}
                customProps={{
                    disableCreateNew: true,
                    values: returnTypes
                }}
                placeholder="Select Type"
                label="Select Variable Type"
            />
            {selectedDataType === SelectedDataType.RECORD &&
                <FormAutocomplete
                    itemList={recordTypeArray}
                    onChange={handleUpdateRecordType}
                    label={'Select output type'}
                    getItemLabel={(option) => option.typeInfo?.name}
                    renderItem={(option) => (
                        <React.Fragment>
                            <span>{option.typeInfo?.name}</span>
                            {option.typeInfo?.moduleName}
                        </React.Fragment>
                    )}
                />
            }
            {selectedDataType === SelectedDataType.JSON &&
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
                itemList={variables}
                label={'Select Output Variable'}
                onChange={handleOnVariableSelect}
                renderItem={(option) => (
                    <React.Fragment>
                        <span>{option.name}</span>
                        {option.type}
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
                    text="Use Existing Variable"
                    onChange={handleOutputConfigTypeChange}
                    initSwitch={generationType === GenerationType.ASSIGNMENT}
                />
                {generationType === GenerationType.NEW && createNewVariableComponent}
                {generationType === GenerationType.ASSIGNMENT && useExistingVariableComponent}
                <div className={overlayClasses.buttonWrapper} style={{ paddingTop: '0.5rem' }} >
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={toggleVariablePicker} />
                    <PrimaryButton
                        disabled={false}
                        dataTestId={"datamapper-save-btn"}
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
