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
import React, { useContext } from "react";

import { Box, FormControl, FormHelperText, TextField, Typography } from "@material-ui/core";

import { Context as DiagramContext } from "../../../../../../Contexts/Diagram";
import { PrimaryButton } from "../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../Elements/Button/SecondaryButton";
import { useStyles as useTextFieldStyles } from "../../Elements/TextField/style";
import { useStyles as useFormStyles } from "../style";

export const CRON_REGEX = /.*/g; // TODO Add a proper regex to validate cron

export interface ScheduleConfigFormProps {
    onClose: () => void;
    onComplete: (schedule: string) => void;
}

export function ScheduleConfigForm(props: ScheduleConfigFormProps) {
    const { state } = useContext(DiagramContext);
    const { currentApp, isMutationInProgress } = state;
    const currentCronSchedule = currentApp ? currentApp.cronSchedule : "";
    const { onComplete, onClose  } = props;
    const formClasses = useFormStyles();
    const textFieldClasses = useTextFieldStyles();

    const [cronExpr, setCronExpr] = React.useState(currentCronSchedule || "");

    const isValidCron = cronExpr !== undefined; // || CRON_REGEX.test(cronExpr);
    const cronErrorText = !isValidCron ? "Invalid Cron Expression" : "";

    const handleCronChange = (event: any) => setCronExpr(event.target.value);
    const onSave = () => onComplete(cronExpr);

    return (
        <FormControl className={formClasses.wizardFormControl}>
            <Typography variant="h4">
                <Box paddingTop={2} paddingBottom={2}>Schedule Configuration</Box>
            </Typography>
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>Cron Expression</FormHelperText>
                <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
            </div>
            <TextField
                error={!isValidCron}
                key={"cronExpr"}
                className={formClasses.inputLabelWrapper}
                InputProps={{
                    disableUnderline: true,
                    classes: {
                        root: textFieldClasses.textFeild,
                        error: textFieldClasses.errorField,
                    }
                }}
                placeholder={"cron expression for the schedule"}
                fullWidth={true}
                size='medium'
                margin="normal"
                InputLabelProps={{ shrink: true }}
                onChange={handleCronChange}
                defaultValue={cronExpr}
                helperText={cronErrorText}
            />
            <div className={formClasses.wizardBtnHolder}>
                <SecondaryButton text="Cancel" fullWidth={false} onClick={onClose} />
                <PrimaryButton
                    text="Save"
                    disabled={!isValidCron || isMutationInProgress || !cronExpr}
                    fullWidth={false}
                    onClick={onSave}
                />
            </div>
            <div className={formClasses.formCreate} />
        </FormControl>
    );
}
