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
// tslint:disable: ordered-imports
import React, { useContext, useState } from "react";
import { Box, FormControl, Typography } from "@material-ui/core";
import { WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../Contexts/Diagram";
import { ButtonWithIcon } from "../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import ExpressionEditor from "../../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import { CustomExpressionConfig, ProcessConfig } from "../../../../Portals/ConfigForm/types";
import { wizardStyles } from "../../../style";
import { FormattedMessage, useIntl } from "react-intl";

import { CloseRounded } from "../../../../../../assets/icons";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../utils/constants";
import LogoCircleIcon from "../../../../../../assets/icons/LogoCircle";
import { FormActionButtons } from "../../../../Portals/ConfigForm/Elements/FormActionButtons";

interface LogConfigProps {
    config: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
}

export function AddCustomStatementConfig(props: LogConfigProps) {
    const formClasses = useFormStyles();
    const overlayClasses = wizardStyles();
    const intl = useIntl();

    const {
        props: {
            isMutationProgress: isMutationInProgress,
            isCodeEditorActive
        }
    } = useContext(Context);
    const { config, onCancel, onSave } = props;

    const expressionFormConfig: CustomExpressionConfig = config.config as CustomExpressionConfig;

    let defaultExpression = "";
    if (config.model) {
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
        const isValidExpression = !isInvalid ? (expression !== undefined && expression !== "") : false;
        setIsFormValid(isValidExpression);
    }

    const saveCustomStatementButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.customStatement.saveButton.label",
        defaultMessage: "Save"
    });

    const customStatementTooltipMessages = {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.customStatement.expressionEditor.tooltip.title",
            defaultMessage: "Enter a Ballerina expression."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.configForms.customStatement.expressionEditor.tooltip.actionText",
            defaultMessage: "Learn Ballerina expressions"
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.configForms.customStatement.expressionEditor.tooltip.actionTitle",
            defaultMessage: "{learnBallerina}"
        }, { learnBallerina: BALLERINA_EXPRESSION_SYNTAX_PATH })
    }
    return (
        <FormControl data-testid="custom-expression-form" className={formClasses.wizardFormControl}>
            {!isCodeEditorActive ?
                (
                    <div className={formClasses.formWrapper}>
                        <div className={formClasses.formFeilds}>
                            <div className={formClasses.formWrapper}>
                                <div className={formClasses.formTitleWrapper}>
                                    <div className={formClasses.mainTitleWrapper}>
                                        <LogoCircleIcon />
                                        <Typography variant="h4">
                                            <Box paddingTop={2} paddingBottom={2}>
                                                <FormattedMessage
                                                    id="lowcode.develop.configForms.customStatement.title"
                                                    defaultMessage="Other"
                                                />
                                            </Box>
                                        </Typography>
                                    </div>
                                </div>
                                <div className="exp-wrapper">
                                    <ExpressionEditor
                                        model={{ name: "statement", value: expression }}
                                        customProps={{
                                            validate: validateExpression,
                                            tooltipTitle: customStatementTooltipMessages.title,
                                            tooltipActionText: customStatementTooltipMessages.actionText,
                                            tooltipActionLink: customStatementTooltipMessages.actionLink,
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
                        </div>
                        <FormActionButtons
                            cancelBtnText="Cancel"
                            saveBtnText={saveCustomStatementButtonLabel}
                            isMutationInProgress={isMutationInProgress}
                            validForm={isFormValid}
                            onSave={onSaveBtnClick}
                            onCancel={onCancel}
                        />
                    </div>
                )
                :
                null
            }
        </FormControl>
    );
}

