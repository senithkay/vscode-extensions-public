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
import React, { useState } from "react";

import { FormHelperText } from "@material-ui/core";

import { useStyles } from "../../forms/style";
import { FormElementProps } from "../../types";
import { FormTextArea } from "../TextField/FormTextArea";

interface XMLProps {
    validate?: (field: string, isInvalid: boolean) => void;
}

export function XML(props: FormElementProps<XMLProps>) {
    const { model, customProps, onChange, defaultValue } = props;
    const classes = useStyles();

    const [validXML, setValidXML] = useState(true);

    const validateXML = (value: string) => {
        if (value === "" || value === undefined) {
            setValidXML(false);
            if (customProps?.validate) {
                customProps?.validate(model.name, true);
            }
        } else {
            setValidXML(true);
            if (customProps?.validate) {
                customProps?.validate(model.name, false);
            }
        }
    };

    const onCustomXMLChange = (xmlValue: string) => {
        model.value = xmlValue;
        validateXML(xmlValue);
        if (onChange) {
            onChange(xmlValue);
        }
    };

    return (
        <div className={classes.arraySubWrapper}>
            <div className={classes.labelWrapper}>
                <FormHelperText className={classes.inputLabelForRequired}>Enter Custom XML</FormHelperText>
                <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
            </div>
            <FormTextArea
                onChange={onCustomXMLChange}
                customProps={{ isInvalid: !validXML, text: "Invalid XML" }}
                rowsMax={3}
                placeholder='eg: <root><books></books></root>'
                defaultValue={defaultValue}
            />
        </div>
    );
}
