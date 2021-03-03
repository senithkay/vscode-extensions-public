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
import React from "react";

import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";

import { ActionConfig, ConnectorConfig, FormField } from "../../../../../../../../ConfigurationSpec/types";
import { PrimaryButton } from "../../../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Elements/DropDown/SelectDropdownWithButton";
import { useStyles } from "../../../style";
import "../style.scss"

interface SelectOperationFormProps {
    actions: Map<string, FormField[]>;
    connectorConfig: ConnectorConfig;
    onBackClick?: () => void;
    onSave?: () => void;
}

export function SelectOperationForm(props: SelectOperationFormProps) {
    const { onBackClick, onSave, actions, connectorConfig } = props;

    const classes = useStyles();

    let action: ActionConfig = new ActionConfig();
    if (connectorConfig.action) {
        action = connectorConfig.action;
        if (action.name) {
            if (!action.fields || action.fields.length <= 0) {
                action.fields = actions.get(action.name);
            }
        }
    }

    const handleOnChangeOperation = (value: any) => {
        const actionName = value as string;
        connectorConfig.action = {
            name: actionName,
            fields: actions.get(actionName)
        };
        onSave();
    };

    const operations: string[] = [];
    if (actions) {
        actions.forEach((value, key) => {
            if (key !== "init" && key !== "__init") {
                operations.push(key);
            }
        });
    }
    const handleOnNext = () => {
        onSave();
    };

    return (
        <div className={classes.configPanel}>
            <FormControl className={classes.wizardFormControl}>
            <Typography variant="h4">
                <Box paddingTop={2} paddingBottom={2}>Select an Operation</Box>
            </Typography>
            <div className={classes.labelWrapper}>
                <FormHelperText className={classes.inputLabelForRequired}>Select an Operation</FormHelperText>
                <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
            </div>
            <SelectDropdownWithButton
                defaultValue={action.name}
                onChange={handleOnChangeOperation}
                customProps={{
                    values: operations,
                    disableCreateNew: true
                }}
            />
            <div className={classes.wizardBtnHolder}>
                <SecondaryButton text="Back" fullWidth={false} onClick={onBackClick} />
                <PrimaryButton text="Save &amp; Next" fullWidth={false} onClick={handleOnNext} />
            </div>
        </FormControl>
        </div>
    );
}
