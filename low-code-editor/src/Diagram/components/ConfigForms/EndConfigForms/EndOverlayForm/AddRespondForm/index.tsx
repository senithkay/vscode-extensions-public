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
import cn from "classnames";

import { Context } from "../../../../../../Contexts/Diagram";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { PrimaryButton } from "../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import { EndConfig, RespondConfig } from "../../../../Portals/ConfigForm/types";
import { tooltipMessages } from "../../../../Portals/utils/constants";
import { wizardStyles } from "../../../style";

import { RespondIcon } from "../../../../../../assets/icons";

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
    const { isMutationProgress: isMutationInProgress, goToNextTourStep : dispatchGoToNextTourStep} = state;
    const { config, onCancel, onSave } = props;

    const [respondFormConfig, setRespondFormConfig] = useState<RespondConfig>(config.expression as RespondConfig);

    const isFormValid = (): boolean => {
        return (respondFormConfig.caller !== '') && (respondFormConfig.respondExpression !== '');
    };

    const [validForm, setValidForm] = useState(isFormValid());

    const onExpressionChange = (value: any) => {
        setRespondFormConfig({...respondFormConfig, respondExpression: value})
        if (value === "jsonPayload"){
            dispatchGoToNextTourStep('CONFIG_RESPOND_SELECT_JSON');
        }
    };

    const onSaveWithTour = () => {
        dispatchGoToNextTourStep('CONFIG_RESPOND_CONFIG_SAVE');
        config.expression = respondFormConfig;
        onSave();
    }

    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        setValidForm(isFormValid() && !isInvalid);
    };

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
                        <RespondIcon />
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
                                type: undefined
                            }}
                            customProps={{
                                validate: validateExpression,
                                tooltipTitle: tooltipMessages.expressionEditor.title,
                                tooltipActionText: tooltipMessages.expressionEditor.actionText,
                                tooltipActionLink: tooltipMessages.expressionEditor.actionLink,
                                interactive: true
                            }}
                            onChange={onExpressionChange}
                        />
                    </div>
                </div>
                <div className={overlayClasses.buttonWrapper}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        dataTestId="save-btn"
                        className="product-tour-save"
                        text="Save"
                        disabled={isMutationInProgress || !validForm}
                        fullWidth={false}
                        onClick={onSaveWithTour}
                    />
                </div>
            </div>
        </FormControl>
    );
}

