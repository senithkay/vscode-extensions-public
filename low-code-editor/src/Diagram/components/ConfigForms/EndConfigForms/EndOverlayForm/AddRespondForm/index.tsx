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
import React, { ReactNode, useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { Box, FormControl, Typography } from "@material-ui/core";
import cn from "classnames";

import { CloseRounded, RespondIcon } from "../../../../../../assets/icons";
import { httpResponse, PrimitiveBalType, WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../utils/constants";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { PrimaryButton } from "../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import { EndConfig, RespondConfig } from "../../../../Portals/ConfigForm/types";
import { wizardStyles } from "../../../style";

interface RespondFormProps {
    config: EndConfig;
    onCancel: () => void;
    onSave: () => void;
}

export const DEFINE_RESPOND_EXP: string = "Define Respond Expression";
export const EXISTING_PROPERTY: string = "Select Existing Property";

export function AddRespondForm(props: RespondFormProps) {
    const formClasses = useFormStyles();
    const overlayClasses = wizardStyles();
    const {
        props: {
            isCodeEditorActive,
            isMutationProgress: isMutationInProgress
        },
        api: {
            tour: {
                goToNextTourStep: dispatchGoToNextTourStep
            }
        }
    } = useContext(Context);
    const { config, onCancel, onSave } = props;

    const respondFormConfig: RespondConfig = config.expression as RespondConfig;

    const isFormValid = (respondExp: string): boolean => {
        return (respondFormConfig.caller !== '') && (respondExp !== '');
    };

    const [validForm, setValidForm] = useState(isFormValid(respondFormConfig.respondExpression));
    const [validStatusCode, setValidStatusCode] = useState(validForm);
    const [statusCodeState, setStatusCode] = useState(undefined);
    const [resExp, setResExp] = useState(undefined);
    const intl = useIntl();

    const onExpressionChange = (value: any) => {
        respondFormConfig.respondExpression = value;
        setResExp(value);
        if (value === "jsonPayload") {
            dispatchGoToNextTourStep('CONFIG_RESPOND_SELECT_JSON');
        }
        setValidForm(false);
    };

    const onSaveWithTour = () => {
        dispatchGoToNextTourStep('CONFIG_RESPOND_CONFIG_SAVE');
        respondFormConfig.responseCode = statusCodeState;
        respondFormConfig.respondExpression = resExp;
        onSave();
    }

    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        if (isFormValid(resExp)) {
            setValidForm(!isInvalid);
        } else {
            setValidForm(false);
        }
    };

    const statusCodeValidateExpression = (fieldName: string, isInvalid: boolean) => {
        const responseCodeNumber = Math.floor(statusCodeState);
        if (statusCodeState) {
            if ((responseCodeNumber < 99) || (responseCodeNumber > 600)) {
                setValidStatusCode(false);
            } else {
                setValidStatusCode(true);
            }
        } else {
            setValidStatusCode(true);
        }
    };

    const onStatusCodeChange = (value: string) => {
        respondFormConfig.responseCode = value;
        setStatusCode(value);
    }

    const saveRespondButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.respond.saveButton.label",
        defaultMessage: "Save"
    });

    const respondStatementTooltipMessages = {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.respondStatementTooltipMessages.expressionEditor.tooltip.title",
            defaultMessage: "Enter a Ballerina expression."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.configForms.respondStatementTooltipMessages.expressionEditor.tooltip.actionText",
            defaultMessage: "Learn Ballerina expressions"
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.configForms.respondStatementTooltipMessages.expressionEditor.tooltip.actionTitle",
            defaultMessage: "{learnBallerina}"
        }, { learnBallerina: BALLERINA_EXPRESSION_SYNTAX_PATH })
    };

    const statusCodeComp: ReactNode = (
        <>
            <ExpressionEditor
                model={{
                    optional: true,
                    name: "Status Code",
                    value: respondFormConfig.responseCode,
                    type: PrimitiveBalType.Int,
                }}
                customProps={{ validate: statusCodeValidateExpression, statementType: PrimitiveBalType.Int }}
                onChange={onStatusCodeChange}
            />
            {!validStatusCode ? <p className={formClasses.invalidCode}> <FormattedMessage id="lowcode.develop.configForms.Respond.invalidCodeError" defaultMessage="Invalid status code" /></p> : null}
        </>
    );
    const disableSave = (isMutationInProgress || !validForm || !validStatusCode);

    return (
        <FormControl data-testid="respond-form" className={cn(formClasses.wizardFormControl)}>
            {!isCodeEditorActive ?
                (
                    <div className={formClasses.formWrapper}>
                        <div className={formClasses.formTitleWrapper}>
                            <div className={formClasses.mainTitleWrapper}>
                                <RespondIcon />
                                <Typography variant="h4">
                                    <Box paddingTop={2} paddingBottom={2}><FormattedMessage id="lowcode.develop.configForms.Respond.title" defaultMessage="Respond" /></Box>
                                </Typography>
                            </div>
                        </div>
                        <div className={formClasses.formWrapper}>
                            <div className="exp-wrapper product-tour-payload-jsonpayload">
                                <ExpressionEditor
                                    model={{
                                        name: "respond expression",
                                        value: respondFormConfig.respondExpression,
                                        type: PrimitiveBalType.Union,
                                        fields: [
                                            {
                                                type: PrimitiveBalType.String
                                            },
                                            {
                                                type: PrimitiveBalType.Xml
                                            },
                                            {
                                                type: PrimitiveBalType.Json
                                            },
                                            {
                                                type: PrimitiveBalType.Record,
                                                typeInfo: httpResponse
                                            }
                                        ]
                                    }}
                                    customProps={{
                                        validate: validateExpression,
                                        tooltipTitle: respondStatementTooltipMessages.title,
                                        tooltipActionText: respondStatementTooltipMessages.actionText,
                                        tooltipActionLink: respondStatementTooltipMessages.actionLink,
                                        interactive: true,
                                        statementType: [PrimitiveBalType.String, PrimitiveBalType.Xml, PrimitiveBalType.Json, httpResponse]
                                    }}
                                    onChange={onExpressionChange}
                                />
                            </div>

                            {(!config.model) ? statusCodeComp : null}
                        </div>
                        <div className={formClasses.saveSpace} />
                        <div className={formClasses.formSave}>
                            <div className={overlayClasses.buttonWrapper}>
                                <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                                <PrimaryButton
                                    dataTestId="save-btn"
                                    className="product-tour-save"
                                    text={saveRespondButtonLabel}
                                    disabled={disableSave}
                                    fullWidth={false}
                                    onClick={onSaveWithTour}
                                />
                            </div>
                        </div>
                    </div>
                )
                :
                null
            }
        </FormControl>
    );
}
