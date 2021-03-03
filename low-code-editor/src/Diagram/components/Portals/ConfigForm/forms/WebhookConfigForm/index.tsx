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

import { Box, FormControl, FormHelperText, InputAdornment, TextField, Typography } from "@material-ui/core";

import { Context as DiagramContext } from "../../../../../../Contexts/Diagram";
import { WebhookMethodType, WEBHOOK_METHODS } from "../../../../../models";
import { PrimaryButton } from "../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../Elements/DropDown/SelectDropdownWithButton";
import { useStyles as useTextFieldStyles } from "../../Elements/TextField/style";
import { useStyles as useFormStyles } from "../style";

export interface WebhookConfigFormProps {
    onClose: () => void;
    onComplete: (method: WebhookMethodType[], path: string) => void;
    methods?: "GET" | "POST",
    path?: string,
    isMutationInProgress: boolean;
}

export function WebhookConfigForm(props: WebhookConfigFormProps) {
    const { state } = useContext(DiagramContext)
    const { isMutationInProgress } = state;
    const { onComplete, onClose } = props;
    let { path: currentPath = ""} = props;
    // remove leading / from path
    if (currentPath && currentPath.charAt(0) === '/') {
        currentPath = currentPath.substr(1);
    }

    const currentMethod = props.methods;
    const formClasses = useFormStyles();
    const textFieldClasses = useTextFieldStyles();

    const [method, setMethod] = React.useState<WebhookMethodType>(currentMethod || "GET");
    const [path, setPath] = React.useState(currentPath || "");

    const isValidPath = !path || ((!/^\d/.test(path)) && /^[a-zA-Z0-9{}_/]+$/g.test(path));
    const pathErrorText = !isValidPath ? "cannot start with a number & only [a-zA-Z0-9{}_/] chars allowed" : "";

    const handleMethodChange = (newMethod: WebhookMethodType) => setMethod(newMethod);
    const handlePathChange = (event: any) => setPath(event.target.value);
    const onSave = () => onComplete([method], path);

    return (
        <FormControl className={formClasses.wizardFormControl}>
            <Typography variant="h4">
                <Box paddingTop={2} paddingBottom={2}>Webhook Configuration</Box>
            </Typography>
            <FormHelperText className={formClasses.inputLabelWrapper}>HTTP Method</FormHelperText>
            <SelectDropdownWithButton
                customProps={{
                    disableCreateNew: true,
                    values: WEBHOOK_METHODS
                }}
                defaultValue={method}
                onChange={handleMethodChange}
            />
            <FormHelperText className={formClasses.inputLabelWrapper}>Path</FormHelperText>
            <TextField
                error={!isValidPath}
                key={"resourcePath"}
                className={formClasses.inputLabelWrapper}
                InputProps={{
                    disableUnderline: true,
                    classes: {
                        root: textFieldClasses.textFeild,
                        error: textFieldClasses.errorField,
                    },
                    startAdornment: <InputAdornment position="start">/</InputAdornment>
                }}
                placeholder={"Relative path from host"}
                fullWidth={true}
                size='medium'
                margin="normal"
                InputLabelProps={{ shrink: true }}
                onChange={handlePathChange}
                defaultValue={path}
                helperText={pathErrorText}
            />
            <div className={formClasses.wizardBtnHolder}>
                <SecondaryButton text="Cancel" fullWidth={false} onClick={onClose} />
                <PrimaryButton
                    text="Save"
                    disabled={!isValidPath || isMutationInProgress || !method}
                    fullWidth={false}
                    onClick={onSave}
                />
            </div>
            <div className={formClasses.formCreate} />
        </FormControl>
    );
}
