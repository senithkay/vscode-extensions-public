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

import { FormControl } from "@material-ui/core";
import {
    FormActionButtons,
    FormHeaderSection,
    httpResponse,
    PrimitiveBalType
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { useStatementEditor } from "@wso2-enterprise/ballerina-statement-editor";
import { ActionStatement, RemoteMethodCallAction } from "@wso2-enterprise/syntax-tree";
import cn from "classnames";

import { Context } from "../../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import { createRespond, getInitialSource } from "../../../../../../utils/modification-util";
import { useStyles as useFormStyles } from "../../../../DynamicConnectorForm/style";
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";
import { EndConfig, RespondConfig } from "../../../../Types";

interface RespondFormProps {
    config: EndConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export const DEFINE_RESPOND_EXP: string = "Define Respond Expression";
export const EXISTING_PROPERTY: string = "Select Existing Property";

export function AddRespondForm(props: RespondFormProps) {
    const formClasses = useFormStyles();
    const {
        props: {
            isMutationProgress: isMutationInProgress,
            currentFile
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram },
            library
        }
    } = useContext(Context);

    const { config, formArgs, onCancel, onSave, onWizardClose } = props;

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
        setValidForm(false);
    };

    const onSaveWithTour = () => {
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

    const handleStatementEditorChange = (partialModel: ActionStatement) => {
        const remoteCallModel: RemoteMethodCallAction = partialModel?.expression.expression as RemoteMethodCallAction;
        respondFormConfig.respondExpression = remoteCallModel?.arguments[0].source;
        setResExp(remoteCallModel?.arguments[0].source);
        setValidForm(false);
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
        <div>
            <LowCodeExpressionEditor
                model={{
                    optional: true,
                    name: "Status Code",
                    value: respondFormConfig.responseCode,
                    type: PrimitiveBalType.Int,
                }}
                customProps={{
                    validate: statusCodeValidateExpression,
                    statementType: PrimitiveBalType.Int,
                    customTemplate: {
                        defaultCodeSnippet: 'http:Response temp14U3resp = new; temp14U3resp.statusCode = ;',
                        targetColumn: 61
                    },
                    editPosition: formArgs.targetPosition,
                }}
                onChange={onStatusCodeChange}
            />
            {!validStatusCode ? <p className={formClasses.invalidCode}> <FormattedMessage id="lowcode.develop.configForms.Respond.invalidCodeError" defaultMessage="Invalid status code" /></p> : null}
        </div>
    );
    const disableSave = (isMutationInProgress || !validForm || !validStatusCode);

    const initialSource = getInitialSource(createRespond(
        respondFormConfig.genType,
        respondFormConfig.variable,
        respondFormConfig.caller,
        resExp ? resExp : "EXPRESSION"
    ));

    const { handleStmtEditorToggle, stmtEditorComponent } = useStatementEditor(
        {
            label: intl.formatMessage({ id: "lowcode.develop.configForms.respond.statementEditor.label" }),
            initialSource,
            formArgs: { formArgs },
            validForm,
            config,
            onWizardClose,
            handleStatementEditorChange,
            onCancel,
            currentFile,
            getLangClient: getExpressionEditorLangClient,
            applyModifications: modifyDiagram,
            library
        }
    );
    const fieilTypes = [
        { type: PrimitiveBalType.String },
        { type: PrimitiveBalType.Xml },
        { type: PrimitiveBalType.Json },
        {
            type: PrimitiveBalType.Record,
            typeInfo: httpResponse
        }
    ];

    const statementType = [PrimitiveBalType.String, PrimitiveBalType.Xml, PrimitiveBalType.Json, httpResponse];

    if (!stmtEditorComponent) {
        return (
            <FormControl data-testid="respond-form" className={cn(formClasses.wizardFormControl)}>
                <FormHeaderSection
                    onCancel={onCancel}
                    statementEditor={true}
                    formTitle={"lowcode.develop.configForms.Respond.title"}
                    defaultMessage={"Respond"}
                    handleStmtEditorToggle={handleStmtEditorToggle}
                    toggleChecked={false}
                />
                <div className={formClasses.formContentWrapper}>
                    <div className={formClasses.formNameWrapper}>
                        <LowCodeExpressionEditor
                            model={{
                                name: "respond expression",
                                value: respondFormConfig.respondExpression,
                                type: PrimitiveBalType.Union,
                                fields: fieilTypes
                            }}
                            customProps={{
                                validate: validateExpression,
                                tooltipTitle: respondStatementTooltipMessages.title,
                                tooltipActionText: respondStatementTooltipMessages.actionText,
                                tooltipActionLink: respondStatementTooltipMessages.actionLink,
                                interactive: true,
                                statementType,
                                customTemplate: {
                                    defaultCodeSnippet: 'checkpanic caller->respond( );',
                                    targetColumn: 28
                                },
                                editPosition: formArgs.targetPosition,
                            }}
                            onChange={onExpressionChange}
                        />
                    </div>
                    <div className={formClasses.formEqualWrapper}>
                        {(!config.model) ? statusCodeComp : null}
                    </div>
                </div>
                <FormActionButtons
                    cancelBtnText="Cancel"
                    cancelBtn={true}
                    saveBtnText={saveRespondButtonLabel}
                    isMutationInProgress={isMutationInProgress}
                    validForm={validForm}
                    onSave={onSaveWithTour}
                    onCancel={onCancel}
                />
            </FormControl>
        );
    }
    else {
        return stmtEditorComponent;
    }
}
