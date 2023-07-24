/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-wrap-multiline jsx-no-multiline-js
import React from "react";

import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import classNames from "classnames";

import { useStyles as useFormStyles } from "../../DynamicConnectorForm/style";

import { useStyles as useTextInputStyles } from "./style";
import './style.scss'

interface CheckBoxGroupProps {
    label?: string;
    defaultValues?: string[];
    values: string[];
    onChange?: (values: string[]) => void;
    className?: string;
    checkOptional?: boolean;
    testId?: string;
}

export default function CheckBoxGroup(props: CheckBoxGroupProps) {
    const { values, className, onChange, label, defaultValues, checkOptional, testId } = props;
    const formClasses = useFormStyles();
    const dropDownClasses = useTextInputStyles();
    const [selected, setSelected] = React.useState(defaultValues);

    React.useEffect(() => {
        setSelected(defaultValues);
    }, [defaultValues]);

    const handleChange = (event: { target: { name: any; checked: any; }; }) => {
        const value = event.target.name;
        const checked = event.target.checked;
        let newSelected = selected;
        if (checked && !selected.includes(value)) {
            newSelected = [...selected, value];
        } else if (!checked && selected.includes(value)) {
            newSelected = [...selected.filter(e => e !== value)];
        }
        if (onChange) {
            onChange(newSelected);
        }
        setSelected(newSelected);
    };

    const error = (checkOptional === undefined) ? (selected.length === 0) : checkOptional;

    return (
        <div className={className}>
            <FormControl
                error={error}
                component="fieldset"
                className={dropDownClasses.checkFormControl}
            >
                {label !== undefined ?
                    (
                        <div className={classNames(formClasses.labelWrapper, 'labelWrapper')}>
                            <FormHelperText className={formClasses.inputLabelForRequired}>{label}</FormHelperText>
                            <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
                        </div>
                    ) : null
                }

                <FormGroup>
                    {values.map((val) => (
                        <FormControlLabel
                            data-testid={testId}
                            key={val}
                            control={
                                <Checkbox
                                    checked={selected.includes(val)}
                                    onChange={handleChange}
                                    classes={{
                                        root: dropDownClasses.checkbox,
                                        checked: dropDownClasses.checked
                                    }}
                                    name={val}
                                    value={selected}
                                    disableFocusRipple={true}
                                    disableRipple={true}
                                    disableTouchRipple={true}
                                />
                            }
                            label={val}
                        />
                    ))}
                </FormGroup>
            </FormControl>
        </div>
    );
}
