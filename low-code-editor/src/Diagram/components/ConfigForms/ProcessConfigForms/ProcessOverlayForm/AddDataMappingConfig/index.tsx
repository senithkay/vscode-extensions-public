/* tslint:disable:jsx-no-multiline-js */
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
import React, { useContext, useState } from 'react';

import { CaptureBindingPattern, LocalVarDecl, STNode } from '@ballerina/syntax-tree';
import { Box, FormControl, Typography } from '@material-ui/core';
import { CloseRounded } from '@material-ui/icons';

import { LogIcon } from "../../../../../../assets/icons";
import { Context as DiagramContext } from '../../../../../../Contexts/Diagram';
import { getAllVariables } from "../../../../../utils/mixins";
import { boolean } from "../../../../Portals/ConfigForm/Elements";
import { ButtonWithIcon } from '../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon';
import { PrimaryButton } from '../../../../Portals/ConfigForm/Elements/Button/PrimaryButton';
import { SecondaryButton } from '../../../../Portals/ConfigForm/Elements/Button/SecondaryButton';
import { FormTextInput } from "../../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import { DataMapperConfig, ProcessConfig, TypeInfoEntry, VariableInfoEntry } from '../../../../Portals/ConfigForm/types';
import { checkVariableName, genVariableName } from "../../../../Portals/utils";
import { wizardStyles } from "../../../style";

import { OutputTypeSelector } from './OutputTypeSelector';
import { ParameterSelector } from './ParameterSelector';


interface AddDataMappingConfigProps {
    processConfig: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
}

enum DataMapperSteps {
    SELECT_OUTPUT,
    SELECT_INPUT,
}


const typeArray: TypeInfoEntry[] = [
    { type: 'string' },
    { type: 'int' },
    { type: 'float' },
    { type: 'boolean' },
    { type: 'xml' },
    { type: 'json' },
    { type: 'Person', typeInfo: { name: 'Person', orgName: '$anon', moduleName: '.', version: '0.0.0' } },
    { type: 'Employee', typeInfo: { name: 'Employee', orgName: '$anon', moduleName: '.', version: '0.0.0' } }
]

export function AddDataMappingConfig(props: AddDataMappingConfigProps) {
    const { processConfig, onCancel, onSave } = props;
    const { state, dataMapperStart } = useContext(DiagramContext);
    const { stSymbolInfo } = state;
    const dataMapperConfig: DataMapperConfig = processConfig.config as DataMapperConfig;
    const defaultFunctionName = stSymbolInfo ?
        genVariableName("mappedValue", getAllVariables(stSymbolInfo)) : 'mappedValue';
    const [dataMapperStep, setDataMapperStep] = useState(DataMapperSteps.SELECT_OUTPUT);
    const [inputTypes, setParameters] = useState(dataMapperConfig.inputTypes);
    const [outputType, setReturnType] = useState(dataMapperConfig.outputType);
    const [elementName, setFunctionName] = useState(defaultFunctionName);
    const [functionNameError, setFunctionNameError] = useState('');
    const [isFunctionNameValid, setIsFunctionNameValid] = useState(true);

    const varData: VariableInfoEntry[] = [];

    stSymbolInfo.variables.forEach((values: STNode[], key: string) => {
        values.forEach((varNode: LocalVarDecl) => {
            varData.push({
                type: key,
                name: (varNode.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value,
                node: varNode
            });
        })
    });

    const handleNextClick = () => {
        if (dataMapperStep === DataMapperSteps.SELECT_OUTPUT) {
            setDataMapperStep(DataMapperSteps.SELECT_INPUT);
        } else {
            processConfig.config = { elementName, inputTypes, outputType };
            onSave();
            dataMapperStart(processConfig.config);
        }
    }

    const addNewParam = (type: VariableInfoEntry) => {
        setParameters([...inputTypes, type])
    }

    const removeParam = (index: number) => {
        setParameters([...inputTypes.splice(index, 1)])
    }

    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("Data Mapper function name", value,
                defaultFunctionName, state);
            if (varValidationResponse?.error) {
                setFunctionNameError(varValidationResponse.message);
                setIsFunctionNameValid(false);
                return false;
            }
        }
        setIsFunctionNameValid(true);
        return true;
    };

    const handleFunctionNameOnChange = (value: string) => {
        setFunctionName(value);
    }

    const formClasses = useFormStyles();
    const overlayClasses = wizardStyles();

    return (
        <FormControl data-testid="data-mapper-form" className={formClasses.wizardFormControl}>
            <div className={overlayClasses.configWizardContainer}>
                <ButtonWithIcon
                    className={formClasses.overlayDeleteBtn}
                    onClick={onCancel}
                    icon={<CloseRounded fontSize="small" />}
                />
                <div className={formClasses.formTitleWrapper}>
                    <div className={formClasses.mainTitleWrapper}>
                        <div className={formClasses.iconWrapper}>
                            <LogIcon /> {/* TODO: Need a datamapper icon */}
                        </div>
                        <Typography variant="h4">
                            <Box paddingTop={2} paddingBottom={2}>Data Mapping Function</Box>
                        </Typography>
                    </div>
                </div>
                <FormTextInput
                    dataTestId="datamapper-variable-name"
                    label={"Variable Name"}
                    customProps={{
                        validate: validateNameValue
                    }}
                    onChange={handleFunctionNameOnChange}
                    defaultValue={elementName}
                    errorMessage={functionNameError}
                    placeholder={"Enter Variable Name"}
                />
                {
                    dataMapperStep === DataMapperSteps.SELECT_INPUT &&
                    // tslint:disable-next-line: jsx-wrap-multiline
                    <ParameterSelector
                        parameters={inputTypes}
                        insertParameter={addNewParam}
                        removeParameter={removeParam}
                        types={varData}
                    />
                }
                {dataMapperStep === DataMapperSteps.SELECT_OUTPUT &&
                    <OutputTypeSelector types={typeArray} updateReturnType={setReturnType} />}

                <div className={overlayClasses.buttonWrapper}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        disabled={!isFunctionNameValid}
                        dataTestId={"datamapper-save-btn"}
                        text={dataMapperStep === DataMapperSteps.SELECT_INPUT ? "Save" : "Next"}
                        fullWidth={false}
                        onClick={handleNextClick}
                    />
                </div>
            </div>
        </FormControl>
    )
}
