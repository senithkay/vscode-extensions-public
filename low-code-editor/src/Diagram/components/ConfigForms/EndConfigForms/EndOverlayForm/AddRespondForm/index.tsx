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
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, useContext, useState } from "react";

import { Box, FormControl, Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import cn from "classnames";

import { NonPrimitiveBalType, PrimitiveBalType, WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { PrimaryButton } from "../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import { EndConfig, RespondConfig } from "../../../../Portals/ConfigForm/types";
import { tooltipMessages } from "../../../../Portals/utils/constants";
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
    const { state } = useContext(Context);
    const { isMutationProgress: isMutationInProgress, goToNextTourStep: dispatchGoToNextTourStep } = state;
    const { config, onCancel, onSave } = props;

    const respondFormConfig: RespondConfig = config.expression as RespondConfig;

    const isFormValid = (): boolean => {
        return (respondFormConfig.caller !== '') && (respondFormConfig.respondExpression !== '');
    };

    const [validForm, setValidForm] = useState(isFormValid());
    const [validStatusCode, setValidStatusCode] = useState(validForm);
    const [isStatusCode, setStatusCode] = useState(undefined);
    const [resExp, setResExp] = useState(undefined);

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
        respondFormConfig.responseCode = isStatusCode;
        respondFormConfig.respondExpression = resExp;
        onSave();
    }

    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        if (isFormValid()) {
            setValidForm(!isInvalid);
        } else {
            setValidForm(false);
        }
    };

    const statusCodeValidateExpression = (fieldName: string, isInvalid: boolean) => {
        const responseCodeNumber = Math.floor(Number(respondFormConfig.responseCode));

        if ((responseCodeNumber < 99) || (responseCodeNumber > 600)) {
            setValidStatusCode(false);
        } else {
            setValidStatusCode(true);
        }
    };

    const onStatusCodeChange = (value: string) => {
        respondFormConfig.responseCode = value;
        setStatusCode(value);
    }

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
            {!validStatusCode ? <p className={formClasses.invalidCode}> Invalid Status Code</p> : null}
        </>
    );
    const disableSave = (isMutationInProgress || !validForm || !validStatusCode);

    return (
        <FormControl data-testid="respond-form" className={cn(formClasses.wizardFormControl)}>
            <div className={overlayClasses.configWizardContainer}>
                <div className={formClasses.formTitleWrapper}>
                    <ButtonWithIcon
                        className={formClasses.overlayDeleteBtn}
                        onClick={onCancel}
                        icon={<CloseRounded fontSize="small" />}
                    />

                    <div className={formClasses.mainTitleWrapper}>
                        <img src="../../../../../../images/Respond.svg" />
                        <Typography variant="h4">
                            <Box paddingTop={2} paddingBottom={2}>Respond</Box>
                        </Typography>
                    </div>
                </div>
                <div className={formClasses.formWrapper}>
                    <div className="exp-wrapper product-tour-payload-jsonpayload">
                        <ExpressionEditor
                            model={{
                                name: "respond expression",
                                value: respondFormConfig.respondExpression,
                                type: [PrimitiveBalType.String, PrimitiveBalType.Xml, PrimitiveBalType.Json, NonPrimitiveBalType.httpResponse]
                            }}
                            customProps={{
                                validate: validateExpression,
                                tooltipTitle: tooltipMessages.expressionEditor.title,
                                tooltipActionText: tooltipMessages.expressionEditor.actionText,
                                tooltipActionLink: tooltipMessages.expressionEditor.actionLink,
                                interactive: true,
                                statementType: [PrimitiveBalType.String, PrimitiveBalType.Xml, PrimitiveBalType.Json, NonPrimitiveBalType.httpResponse]
                            }}
                            onChange={onExpressionChange}
                        />
                    </div>

                    {(config.wizardType === WizardType.NEW) ? statusCodeComp : null}
                </div>
                <div className={overlayClasses.buttonWrapper}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        dataTestId="save-btn"
                        className="product-tour-save"
                        text="Save"
                        disabled={disableSave}
                        fullWidth={false}
                        onClick={onSaveWithTour}
                    />
                </div>
            </div>
        </FormControl>
    );
}
