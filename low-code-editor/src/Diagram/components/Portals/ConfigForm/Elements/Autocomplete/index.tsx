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
import React, { ReactNode, SyntheticEvent } from "react";

import { FormHelperText } from "@material-ui/core";
import TextField, { FilledTextFieldProps, OutlinedTextFieldProps, StandardTextFieldProps } from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { useStyles } from "./style";

export interface AutocompleteProps {
    label?: string;
    placeholder?: string;
    itemList: any[];
    value?: any;
    getItemLabel?: (item: any) => string;
    renderItem?: (item: any) => ReactNode;
    onChange: (event: object, value: any, reason: string) => void;
    dataTestId?: string;
}

export function FormAutocomplete(props: AutocompleteProps) {
    const { label, placeholder, itemList, value, getItemLabel, renderItem, onChange, dataTestId } = props;
    const classes = useStyles();

    function renderInnerTextField(params: (JSX.IntrinsicAttributes & StandardTextFieldProps) | (JSX.IntrinsicAttributes & FilledTextFieldProps) | (JSX.IntrinsicAttributes & OutlinedTextFieldProps)) {
        return (
            <TextField
                {...params}
                placeholder={placeholder}
                variant="outlined"
                InputLabelProps={{
                    shrink: false
                }}
            />
        );
    }

    const preventDiagramScrolling = (e: SyntheticEvent) => {
        e.stopPropagation();
    }
    return (
        <div
            onWheel={preventDiagramScrolling}
        >
            {label ?
                (
                    <>
                        <FormHelperText className={classes.titleLabel}>{label}</FormHelperText>
                        <FormHelperText className={classes.titleLabelRequired}>*</FormHelperText>
                    </>
                ) : null
            }

            <Autocomplete
                data-testid={dataTestId}
                id="combo-box-demo"
                options={itemList}
                getOptionLabel={getItemLabel}
                renderOption={renderItem}
                classes={{
                    root: classes.root,
                    inputRoot: classes.inputRoot,
                    input: classes.input,
                }}
                value={value ? value : null}
                renderInput={renderInnerTextField}
                onChange={onChange}
                closeIcon={null}
                openOnFocus={true}
                autoComplete={true}
                autoHighlight={true}
            />
        </div>
    );
}
