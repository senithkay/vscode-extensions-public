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
import { ServiceMethodType, SERVICE_METHODS } from "../../../../../models";
import { PrimaryButton } from "../../Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../Elements/Button/SecondaryButton";
import CheckBoxGroup from "../../Elements/CheckBox";
import { useStyles as useTextFieldStyles } from "../../Elements/TextField/style";
import { useStyles as useFormStyles } from "../style";

export interface APIConfigFormProps {
    onClose: () => void;
    onComplete: (method: ServiceMethodType[], path: string) => void;
    methods?: ServiceMethodType[],
    path?: string,
}

export function APIConfigForm(props: APIConfigFormProps) {
    const { isMutationProgress: isMutationInProgress } = useContext(DiagramContext).state;

    const { onComplete, onClose, methods: currentMethod = ["GET"] } = props;
    let { path: currentPath = "" } = props;
    // remove leading / from path
    if (currentPath && currentPath.charAt(0) === '/') {
        currentPath = currentPath.substr(1);
    }

    const formClasses = useFormStyles();
    const textFieldClasses = useTextFieldStyles();

    const [methods, setMethods] = React.useState<ServiceMethodType[]>(currentMethod);
    const [path, setPath] = React.useState(currentPath);

    const isValidPath = !path || ((!/^\d/.test(path)) && /^[a-zA-Z0-9_/\[ \]...]+$/g.test(path));
    const pathErrorText = !isValidPath ? "cannot start with a number & only [a-zA-Z0-9_/\[\]...] chars allowed" : "";

    const handlePathChange = (event: any) => setPath(event.target.value);
    const onSave = () => onComplete(methods, path);
    const handleMethodsChange = (values: string[]) => setMethods(values as ServiceMethodType[]);

    return (
        <FormControl className={formClasses.wizardFormControl}>
            <Typography variant="h4">
                <Box paddingTop={2} paddingBottom={2}>API Configuration</Box>
            </Typography>
            <CheckBoxGroup className={formClasses.groupedForm} values={SERVICE_METHODS} defaultValues={methods} onChange={handleMethodsChange} label="HTTP Method" />
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>Path</FormHelperText>
                <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
            </div>
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
                    disabled={!isValidPath || isMutationInProgress || methods.length === 0}
                    fullWidth={false}
                    onClick={onSave}
                />
            </div>
            <div className={formClasses.formCreate} />
        </FormControl>
    );
}
