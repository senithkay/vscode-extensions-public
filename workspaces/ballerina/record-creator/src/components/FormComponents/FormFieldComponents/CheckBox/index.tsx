/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-wrap-multiline jsx-no-multiline-js
import React, { ReactNode } from "react";

import { useStyles } from "./style";
import "./style.scss";
import { cx } from "@emotion/css";
import { FormContainer } from "../../../../style";
import { Typography } from "@wso2-enterprise/ui-toolkit";
import { VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react";

interface CheckBoxGroupProps {
    label?: string;
    defaultValues?: string[];
    values: string[];
    onChange?: (values: string[]) => void;
    className?: string;
    checkOptional?: boolean;
    disabled?: boolean;
    withMargins?: boolean;
    testId?: string;
    checkBoxLabel?: ReactNode;
    checkBoxTestId?: string;
}

export function CheckBoxGroup(props: CheckBoxGroupProps) {
    const { values, className, onChange, label, defaultValues, checkOptional, withMargins = true, testId } = props;
    const classes = useStyles();
    const [selected, setSelected] = React.useState(defaultValues);

    React.useEffect(() => {
        setSelected(defaultValues);
    }, [defaultValues]);

    const handleChange = (value: string, checked: boolean) => {
        let newSelected = selected;
        if (checked && !selected.includes(value)) {
            newSelected = [...selected, value];
        } else if (!checked && selected.includes(value)) {
            newSelected = [...selected.filter((e) => e !== value)];
        }
        if (onChange) {
            onChange(newSelected);
        }
        setSelected(newSelected);
    };

    const error = checkOptional === undefined ? selected.length === 0 : checkOptional;

    return (
        <div className={className}>
            <FormContainer className={withMargins && classes.checkFormControl}>
                {label !== undefined ? (
                    <div className={cx(classes.labelWrapper, "labelWrapper")}>
                        <Typography variant="caption" className={classes.inputLabelForRequired}>
                            {label}
                        </Typography>
                        <Typography variant="caption" className={classes.starLabelForRequired}>
                            *
                        </Typography>
                    </div>
                ) : null}

                <VSCodeRadioGroup orientation="vertical">
                    {values.map((val) => (
                        <VSCodeRadio
                            checked={selected.includes(val)}
                            onClick={(e) =>
                                handleChange(
                                    (e.target as HTMLInputElement).name,
                                    (e.target as HTMLInputElement).checked
                                )
                            }
                            data-testid={testId}
                            key={val}
                        ></VSCodeRadio>
                    ))}
                </VSCodeRadioGroup>
            </FormContainer>
        </div>
    );
}
