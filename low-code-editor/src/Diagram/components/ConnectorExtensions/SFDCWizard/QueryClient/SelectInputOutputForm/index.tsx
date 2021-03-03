/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useState } from "react";

import { Box, FormControl, Typography } from "@material-ui/core";

import { ActionConfig, ConnectorConfig } from "../../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../../Contexts/Diagram";
import { getAllVariables } from "../../../../../utils/mixins";
import { PrimaryButton } from "../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { FormTextInput } from "../../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { Form } from "../../../../Portals/ConfigForm/forms/Components/Form";
import "../../../../Portals/ConfigForm/forms/ConnectorInitForm/Wizard/style.scss"
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { genVariableName } from "../../../../Portals/utils";
import { tooltipMessages } from "../../../../Portals/utils/constants";
import "../../style.scss";

interface SelectInputOutputFormProps {
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
    onSave?: () => void;
    isNewConnectorInitWizard: boolean;
}

interface ReturnNameState {
    isNameProvided: boolean;
    isValidName: boolean;
}

export function SelectInputOutputForm(props: SelectInputOutputFormProps) {
    const { state: { syntaxTree, stSymbolInfo, isMutationProgress: isMutationInProgress } } = useContext(DiagramContext);

    const { onBackClick, onSave, connectorConfig, isNewConnectorInitWizard } = props;
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");
    const classes = useStyles();
    const defaultActionName = connectorConfig && connectorConfig.action && connectorConfig.action.name ? connectorConfig.action.name : "";
    const [formState] = useState(defaultActionName);
    const isFieldsAvailable = connectorConfig.action && connectorConfig.action.fields.length > 0;

    const initialReturnNameState: ReturnNameState = {
        isNameProvided: true,
        isValidName: true
    };

    const [returnNameState, setReturnNameState] = useState<ReturnNameState>(initialReturnNameState);

    let action: ActionConfig = new ActionConfig();
    if (connectorConfig.action) {
        action = connectorConfig.action;
    }

    // generate variable name and set to default text
    const defaultResponseVariableName: string = (action.returnVariableName === "" || action.returnVariableName === undefined) ?
        genVariableName(action.name + "Response", getAllVariables(stSymbolInfo)) : action.returnVariableName;

    const [isGenFieldsFilled, setIsGenFieldsFilled] = useState(!isFieldsAvailable);

    if ((action.returnVariableName === "" || action.returnVariableName === undefined) && returnNameState.isValidName) {
        action.returnVariableName = defaultResponseVariableName;
    }

    const onValidate = (isRequiredFieldsFilled: boolean) => {
        setIsGenFieldsFilled(isRequiredFieldsFilled);
    };

    const handleOnSave = () => {
        onSave();
    };

    const selectedOperationParams = formState && isFieldsAvailable && (
        <div className={classes.inputWrapper}>
            <div className={classes.groupedForm}>
                <Form fields={connectorConfig.action.fields} onValidate={onValidate} />
            </div>
        </div>
    );

    // check for name when navigating back.
    if (!returnNameState.isNameProvided && action.returnVariableName !== undefined && action.returnVariableName !== '') {
        setReturnNameState({
            ...returnNameState,
            isNameProvided: action.returnVariableName !== undefined && action.returnVariableName !== '',
            isValidName: nameRegex.test(action.returnVariableName)
        });
    }

    const validateNameValue = (value: string) => {
        if (value && value !== '') {
            return nameRegex.test(value);
        }
        return true;
    };

    const onNameChange = (value: any) => {
        action.returnVariableName = value;
        setReturnNameState({
            ...returnNameState,
            isNameProvided: value && value !== '',
            isValidName: nameRegex.test(value)
        });
    };

    const isSaveDisabled: boolean = !isNewConnectorInitWizard
        || isMutationInProgress
        || !(isGenFieldsFilled && returnNameState.isNameProvided && returnNameState.isValidName);

    return (
        <div className={classes.configPanel}>
            <Typography variant="h4" className={classes.titleWrapper}>
                <Box paddingTop={2} paddingBottom={2} className={classes.formTitle}>
                    <div className={classes.formTitleTag} >Operation Inputs</div>
                </Box>
            </Typography>
            <div className={classes.configPanel}>
                <FormControl className={classes.wizardFormControl}>
                    {selectedOperationParams}
                    <FormTextInput
                        customProps={{
                            validate: validateNameValue,
                            tooltipTitle: tooltipMessages.responseVariableName
                        }}
                        defaultValue={defaultResponseVariableName}
                        placeholder={"Enter Response Variable Name"}
                        onChange={onNameChange}
                        label={"Response Variable Name"}
                        errorMessage={"Invalid Response Variable Name"}
                    />
                    <div className={classes.wizardBtnHolder}>
                        <SecondaryButton text="Back" fullWidth={false} onClick={onBackClick} />
                        <PrimaryButton
                            text="Save &amp; Done"
                            fullWidth={false}
                            disabled={isSaveDisabled}
                            onClick={handleOnSave}
                        />
                    </div>
                </FormControl>
            </div>
        </div>
    );
}
