/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js no-empty jsx-curly-spacing
import React from "react";
import { FormattedMessage } from "react-intl";

import { FormHelperText } from "@material-ui/core";

import { TooltipIcon } from "../../../../../../components/Tooltip";
import { useStyles as useFormStyles } from "../../forms/style";
import { FormElementProps } from "../../types";
import { ExpressionEditorProps } from "../ExpressionEditor";
import { useStyles as useTextInputStyles } from "../TextField/style";

export function ExpressionEditorLabel(props: FormElementProps<ExpressionEditorProps>) {
    const { model, customProps } = props;
    const textLabel = model && model.displayName ? model.displayName : model.name;

    const formClasses = useFormStyles();
    const textFieldClasses = useTextInputStyles();

    return (
        <>
            {!customProps?.hideTextLabel && textLabel ?
                (model && model.optional ?
                    (
                        <div className={textFieldClasses.inputWrapper}>
                            <div className={textFieldClasses.inputWrapper}>
                                <div className={textFieldClasses.labelWrapper}>
                                    <FormHelperText className={formClasses.inputLabelForRequired}>{textLabel}</FormHelperText>
                                    <FormHelperText className={formClasses.optionalLabel}><FormattedMessage id="lowcode.develop.elements.expressionEditor.optional.label" defaultMessage="Optional"/></FormHelperText>
                                </div>
                                {(customProps?.tooltipTitle || model?.tooltip) &&
                                    (
                                        <div>
                                            <TooltipIcon
                                                title={customProps?.tooltipTitle || model?.tooltip}
                                                interactive={customProps?.interactive || true}
                                                actionText={customProps?.tooltipActionText}
                                                actionLink={customProps?.tooltipActionLink}
                                                arrow={true}
                                            />
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    ) : (
                        <div className={textFieldClasses.inputWrapper}>
                            <div className={textFieldClasses.labelWrapper}>
                                <FormHelperText className={formClasses.inputLabelForRequired}>{textLabel}</FormHelperText>
                                <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
                            </div>
                            {(customProps?.tooltipTitle || model?.tooltip) &&
                                (
                                    <TooltipIcon
                                        title={model?.tooltip}
                                        interactive={customProps?.interactive || true}
                                        actionText={customProps?.tooltipActionText}
                                        actionLink={customProps?.tooltipActionLink}
                                        arrow={true}
                                    />
                                )
                            }
                        </div>
                    )
                ) : null
            }
        </>
    )
}
