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
import { PrimitiveBalType, WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { PrimaryButton } from "../../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import { CustomExpressionConfig, ProcessConfig } from "../../../../Portals/ConfigForm/types";
import { tooltipMessages } from "../../../../Portals/utils/constants";
import { wizardStyles } from "../../../style";

interface LogConfigProps {
    config: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
}


export function AddCustomStatementConfig(props: LogConfigProps) {
    const formClasses = useFormStyles();
    const overlayClasses = wizardStyles();

    const { state } = useContext(Context);
    const { isMutationProgress: isMutationInProgress } = state;
    const { config, onCancel, onSave } = props;
    const isExisting = config.wizardType === WizardType.EXISTING;

    const expressionFormConfig: CustomExpressionConfig = config.config as CustomExpressionConfig;

    let defaultExpression = "";
    if (isExisting) {
        defaultExpression = config?.model?.source.trim();
    }

    const [expression, setExpression] = useState(defaultExpression);
    const [isFormValid, setIsFormValid] = useState(!!expression);

    const onExpressionChange = (value: any) => {
        setExpression(value);
    };

    const onSaveBtnClick = () => {
        expressionFormConfig.expression = expression;
        onSave();
    }

    const validateExpression = (_field: string, isInvalid: boolean) => {
        setIsFormValid(!isInvalid);
    }
    return (
        <FormControl data-testid="custom-expression-form" className={formClasses.wizardFormControl}>
            <div className={overlayClasses.configWizardContainer}>
                <div className={formClasses.formWrapper}>
                    <ButtonWithIcon
                        className={formClasses.overlayDeleteBtn}
                        onClick={onCancel}
                        icon={<CloseRounded fontSize="small" />}
                    />
                    <div className={formClasses.formTitleWrapper}>
                        <div className={formClasses.mainTitleWrapper}>
                            <img src="../../../../../../images/Logo_Circle.svg" />
                            <Typography variant="h4">
                                <Box paddingTop={2} paddingBottom={2}>Custom Statement</Box>
                            </Typography>
                        </div>
                    </div>
                    <div className="exp-wrapper">
                    <ExpressionEditor
                        model={{ name: "expression", value: expression }}
                        customProps={{
                            validate: validateExpression,
                            tooltipTitle: tooltipMessages.expressionEditor.title,
                            tooltipActionText: tooltipMessages.expressionEditor.actionText,
                            tooltipActionLink: tooltipMessages.expressionEditor.actionLink,
                            interactive: true,
                            customTemplate: {
                                defaultCodeSnippet: '',
                                targetColumn: 1,
                            },
                        }}
                        onChange={onExpressionChange}
                    />
                    </div>
                </div>
                <div className={overlayClasses.buttonWrapper}>
                    <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
                    <PrimaryButton
                        dataTestId={"custom-expression-save-btn"}
                        text="Save"
                        disabled={isMutationInProgress || !isFormValid}
                        fullWidth={false}
                        onClick={onSaveBtnClick}
                    />
                </div>
            </div>
        </FormControl>
    );
}

