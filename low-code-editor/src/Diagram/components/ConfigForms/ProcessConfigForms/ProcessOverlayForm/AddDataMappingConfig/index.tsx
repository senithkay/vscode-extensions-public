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

import { Box, FormControl, Typography } from '@material-ui/core';
import { CloseRounded } from '@material-ui/icons';
import classNames from "classnames";

import { LogIcon } from "../../../../../../assets/icons";
import { Context as DiagramContext } from '../../../../../../Contexts/Diagram';
import { ButtonWithIcon } from '../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon';
import { PrimaryButton } from '../../../../Portals/ConfigForm/Elements/Button/PrimaryButton';
import { SecondaryButton } from '../../../../Portals/ConfigForm/Elements/Button/SecondaryButton';
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import {DataMapperConfig, ProcessConfig} from '../../../../Portals/ConfigForm/types';
import { wizardStyles } from "../../../style";

import { OutputTypeSelector } from './OutputTypeSelector';
import { ParameterSelector } from './ParameterSelector';
import { RecordTypeSelector } from './RecordTypeSelector';
import {FormTextInput} from "../../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import {checkVariableName, genVariableName} from "../../../../Portals/utils";
import {getAllVariables} from "../../../../../utils/mixins";

interface AddDataMappingConfigProps {
    processConfig: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
}

enum DataMapperSteps {
    SELECT_INPUT,
    SELECT_OUTPUT
}

export function AddDataMappingConfig(props: AddDataMappingConfigProps) {
    const { processConfig, onCancel, onSave } = props;
    const { state } = useContext(DiagramContext);
    const { stSymbolInfo } = state;
    const dataMapperConfig: DataMapperConfig = processConfig.config as DataMapperConfig;

    let defaultFunctionName = stSymbolInfo ? genVariableName("dataMapperFunction", getAllVariables(stSymbolInfo)) : 'dataMapperFunction';
    const [dataMapperStep, setDataMapperStep] = useState(DataMapperSteps.SELECT_INPUT);
    const [parameters, setParameters] = useState(dataMapperConfig.parameters);
    const [returnType, setReturnType] = useState(dataMapperConfig.returnType);
    const [functionName, setFunctionName] = useState(defaultFunctionName);
    const [functionNameError, setFunctionNameError] = useState('');
    const [isFunctionNameValid, setIsFunctionNameValid] = useState(true);


    const handleNextClick = () => {
        if (dataMapperStep === DataMapperSteps.SELECT_INPUT) {
            setDataMapperStep(DataMapperSteps.SELECT_OUTPUT);
        } else {
            processConfig.config = { functionName, parameters, returnType };
            onSave();
            // dataMapperStart(true);
        }
    }

    const addNewParam = (name: string, type: string) => {
        setParameters([...parameters, {name, type}])
    }

    const removeParam = (index: number) => {
        setParameters([...parameters.splice(index, 1)])
    }

    const validateNameValue = (value: string) => {
        if (value) {
            const varValidationResponse = checkVariableName("Data Mapper function name", value, defaultFunctionName, state);
            debugger;
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
                    dataTestId="function-name"
                    label={"Data Mapper function Name"}
                    customProps={{
                        validate: validateNameValue
                    }}
                    onChange={handleFunctionNameOnChange}
                    defaultValue={functionName}
                    errorMessage={functionNameError}
                    placeholder={"Enter Variable Name"}
                />
                {dataMapperStep === DataMapperSteps.SELECT_INPUT && <ParameterSelector parameters={parameters} insetParameter={addNewParam} removeParameter={removeParam} />}
                {dataMapperStep === DataMapperSteps.SELECT_OUTPUT && <OutputTypeSelector returnType={returnType} updateReturnType={setReturnType} />}

                <div className={overlayClasses.buttonWrapper}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        disabled={!isFunctionNameValid}
                        dataTestId={"datamapper-save-btn"}
                        text={dataMapperStep === DataMapperSteps.SELECT_OUTPUT ? "Save" : "Next"}
                        fullWidth={false}
                        onClick={handleNextClick}
                    />
                </div>
            </div>
        </FormControl>
    )
}
