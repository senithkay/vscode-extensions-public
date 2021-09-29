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
// tslint:disable: jsx-no-multiline-js
// tslint:disable: jsx-no-lambda
// tslint:disable: jsx-wrap-multiline
import React, { useState } from 'react';

import { LocalVarDecl } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from '@material-ui/core';
import classNames from 'classnames';

import { FormAutocomplete } from '../../../../../Portals/ConfigForm/Elements/Autocomplete';
import { SelectDropdownWithButton } from '../../../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton';
import { FormJson } from '../../../../../Portals/ConfigForm/Elements/Json/FormJson';
import { SwitchToggle } from '../../../../../Portals/ConfigForm/Elements/SwitchToggle';
import { FormTextInput } from '../../../../../Portals/ConfigForm/Elements/TextField/FormTextInput';
import { useStyles as useFormStyles } from "../../../../../Portals/ConfigForm/forms/style";
import { DataMapperInputTypeInfo, DataMapperOutputTypeInfo } from "../../../../../Portals/ConfigForm/types";
import { checkVariableName } from '../../../../../Portals/utils';

interface OutputTypeSelectorProps {
    types: DataMapperOutputTypeInfo[];
    updateReturnType: (returnType: DataMapperOutputTypeInfo) => void,
    updateSampleStructure: (value: string) => void,
    updateValidity: (value: boolean) => void,
    updateVariableName: (value: string) => void,
    updateVariableNameValidity: (value: boolean) => void,
    variableName: string,
    diagramState: any,
    variables: DataMapperInputTypeInfo[]
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

export function OutputTypeSelector(props: OutputTypeSelectorProps) {
    const {
        types,
        updateReturnType,
        updateSampleStructure,
        updateValidity,
        diagramState,
        variableName,
        updateVariableName,
        updateVariableNameValidity,
        variables
    } = props;
    const classes = useFormStyles();

    const [jsonValue, setJsonValue] = useState('');
    const [functionNameError, setFunctionNameError] = useState('');
    const [selectedDataType, setSelectedDataType] = useState<SelectedDataType>(SelectedDataType.DEFAULT);
    const [generationType, setGenerationType] = useState<GenerationType>(GenerationType.NEW);

    const handleUpdateReturnType = (evt: any, option: DataMapperOutputTypeInfo) => {
        updateReturnType({ ...option, generationType });
    }

    const jsonFormField = { isParam: true, type: 'json' }
    const returnTypes: string[] = ['String', 'Int', 'Float', 'Boolean', 'Json', 'Record'];

    const handleOnTypeChange = (value: string) => {
        switch (value.toLocaleLowerCase()) {
            case 'record':
                setSelectedDataType(SelectedDataType.RECORD);
                break;
            case 'json':
                updateReturnType({ type: value.toLocaleLowerCase(), generationType })
                setSelectedDataType(SelectedDataType.JSON);
                break;
            default:
                updateReturnType({ type: value.toLowerCase(), generationType })
        }
    }

    const handleOnJsonValueChange = (value: string) => {
        setJsonValue(value);
    }

    const handleOutputConfigTypeChange = () => {
        if (generationType === GenerationType.NEW) {
            setGenerationType(GenerationType.ASSIGNMENT);
        } else {
            setGenerationType(GenerationType.NEW);
        }
    }

    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        if (!isInvalid) {
            updateSampleStructure(jsonValue);
            updateValidity(true);
        } else {
            updateValidity(false);
        }
    }

    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("Data Mapper function name", value,
                variableName, diagramState);
            if (varValidationResponse?.error) {
                setFunctionNameError(varValidationResponse.message);
                updateVariableNameValidity(false);
                return false;
            }
        }
        updateVariableNameValidity(true);
        return true;
    };

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


        updateReturnType({
            type: variableOption.type,
            generationType,
            typeInfo,
        });
        updateVariableName(variableOption.name);
    }

    const createNewVariableComponent = (
        <div>
            <FormTextInput
                dataTestId="datamapper-variable-name"
                label={"Variable Name"}
                customProps={{
                    validate: validateNameValue
                }}
                onChange={updateVariableName}
                defaultValue={variableName}
                errorMessage={functionNameError}
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
                    itemList={types}
                    onChange={handleUpdateReturnType}
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
                        validate: validateExpression,
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
            <div className={classes.formTitleWrapper}>
                <div className={classes.subtitle}>
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2}>Output Variable Configuration</Box>
                    </Typography>
                </div>
            </div>
            <div className={classes.formWrapper}>
                <SwitchToggle
                    text="Use Existing Variable"
                    onChange={handleOutputConfigTypeChange}
                    initSwitch={generationType === GenerationType.ASSIGNMENT}
                />
                {generationType === GenerationType.NEW && createNewVariableComponent}
                {generationType === GenerationType.ASSIGNMENT && useExistingVariableComponent}
            </div>
        </>
    );
}
