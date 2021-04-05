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
// tslint:disable: ordered-imports
import React, { useContext, useState } from "react";

import { Box, FormControl, Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";

import { Context } from "../../../../../../Contexts/Diagram";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { PrimaryButton } from "../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { EndConfig } from "../../../../Portals/ConfigForm/types";
import { tooltipMessages } from "../../../../Portals/utils/constants";
import { wizardStyles } from "../../../style";

import { ReturnIcon } from "../../../../../../assets/icons";

interface ReturnFormProps {
    config: EndConfig;
    onCancel: () => void;
    onSave: () => void;
}

export const DEFINE_RETURN_EXR: string = "Define Return Expression";
export const EXISTING_PROPERTY: string = "Select Existing Property";

export function AddReturnForm(props: ReturnFormProps) {
    const { state } = useContext(Context);
    const { appInfo, isMutationProgress: isMutationInProgress, isCodeEditorActive } = state;
    const { currentApp } = appInfo;
    const triggerType = currentApp ? currentApp.displayType : undefined;
    const { config, onCancel, onSave } = props;
    const classes = useStyles();
    const overlayClasses = wizardStyles();

    const onReturnValueChange = (value: any) => {
        config.expression = value;
    };

    const [isValidValue, setIsValidValue] = useState(true);
    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        setIsValidValue(!isInvalid || (config.expression === ""));
    };

    const isButtonDisabled = isMutationInProgress || !isValidValue;

    const containsMainFunction = triggerType && (triggerType === "Manual" || triggerType === "Schedule"); // todo: this is not working due to triggerType is blank.
    return (
        <FormControl data-testid="return-form" className={classes.wizardFormControl}>
            {!isCodeEditorActive ?
                (
                    <div className={overlayClasses.configWizardContainer}>
                        <div className={classes.formTitleWrapper}>

                            <ButtonWithIcon
                                className={classes.overlayDeleteBtn}
                                onClick={onCancel}
                                icon={<CloseRounded fontSize="small" />}
                            />
                            <div className={classes.mainTitleWrapper}>
                                <div className={classes.iconWrapper}>
                                    <ReturnIcon />
                                </div>
                                <Typography variant="h4">
                                    <Box paddingTop={2} paddingBottom={2}>Return</Box>
                                </Typography>
                            </div>

                            <div className={classes.formWrapper}>
                                {
                                    containsMainFunction ?
                                        (
                                            <div className="exp-wrapper">
                                                <ExpressionEditor
                                                    model={{ name: "return expression", type: "error", value: config.expression }}
                                                    customProps={{
                                                        validate: validateExpression,
                                                        tooltipTitle: tooltipMessages.expressionEditor.title,
                                                        tooltipActionText: tooltipMessages.expressionEditor.actionText,
                                                        tooltipActionLink: tooltipMessages.expressionEditor.actionLink,
                                                        interactive: true,
                                                        statementType: 'error'
                                                    }}
                                                    onChange={onReturnValueChange}
                                                />
                                            </div>
                                        ) : null
                                }

                            </div>
                        </div>
                        <div className={overlayClasses.buttonWrapper}>
                            <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                            <PrimaryButton
                                text="Save"
                                disabled={isButtonDisabled}
                                fullWidth={false}
                                onClick={onSave}
                            />
                        </div>
                    </div>
                )
                :
                null
            }
        </FormControl>
    );
}

