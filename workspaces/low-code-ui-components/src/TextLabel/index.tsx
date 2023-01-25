/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable:jsx-no-multiline-js
// tslint:disable: jsx-wrap-multiline
import React from "react";
import { FormattedMessage } from "react-intl";

import { FormHelperText } from "@material-ui/core";

import { dynamicConnectorStyles as useFormStyles } from "../dynamicConnectorStyles";

export interface TextLabelProps {
    required: boolean;
    textLabelId: string;
    defaultMessage?: string;
    label?: string;
}
export function TextLabel(props: TextLabelProps) {
    const formClasses = useFormStyles();

    const { textLabelId: labelID, defaultMessage, label, required } = props;

    const labelType = required ?
        (<FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>)
        : (<FormHelperText className={formClasses.optionalLabel}>Optional</FormHelperText>);

    return (
        <div className={formClasses.labelWrapper}>
            <FormHelperText className={formClasses.inputLabelForRequired}>
                {
                    label ?
                        label
                        : <FormattedMessage id={labelID} defaultMessage={defaultMessage} />
                }
            </FormHelperText>
            {labelType}
        </div>
    );
}
