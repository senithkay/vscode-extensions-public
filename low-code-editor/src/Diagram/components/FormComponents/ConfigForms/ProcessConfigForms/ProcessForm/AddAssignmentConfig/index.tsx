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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext, useState } from "react";
import { useIntl } from "react-intl";

import { FormControl, Typography } from "@material-ui/core";
import { ExpressionEditorProps } from "@wso2-enterprise/ballerina-expression-editor";
import { FormActionButtons, FormHeaderSection, ProcessConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { useStatementEditor } from "@wso2-enterprise/ballerina-statement-editor";
import { AssignmentStatement, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../../Contexts/Diagram";
import { createPropertyStatement, getInitialSource } from "../../../../../../utils/modification-util";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";
import { ProcessConfig } from "../../../../Types";

interface AddAssignmentConfigProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddAssignmentConfig(props: AddAssignmentConfigProps) {
    const classes = useStyles();
    const intl = useIntl();
    const { config, formArgs, onCancel, onSave, onWizardClose } = props;

    const {
        props: {
            isMutationProgress: isMutationInProgress,
            currentFile,
            experimentalEnabled
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram },
            library
        }
    } = useContext(Context);

    let variableName: string = '';
    let varExpression: string = '';

    const existingProperty = config && config.model;
    if (existingProperty && STKindChecker.isAssignmentStatement(config.model)) {
        varExpression = config.model.expression?.source;
        if (STKindChecker.isSimpleNameReference(config.model?.varRef)) {
            variableName = config.model?.varRef?.name.value;
        } else if (STKindChecker.isFieldAccess(config.model?.varRef)) {
            variableName = config.model?.varRef?.source?.trim();
        }
    }

    const [varName, setVarName] = useState(variableName);
    const [validName, setValidName] = useState(false);
    const [variableExpression, setVariableExpression] = useState<string>(varExpression);
    const [validExpression, setValidExpression] = useState(false);

    const onPropertyChange = (property: string) => {
        setVariableExpression(property);
    };

    const validateExpressionName = (fieldName: string, isInvalid: boolean) => {
        setValidName(!isInvalid);
    };

    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        setValidExpression(!isInvalid);
    };

    const handleSave = () => {
        if (variableExpression) {
            config.config = `${varName} = ${variableExpression};`;
            onSave();
        }
    };

    const saveVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.assignment.saveButton.text",
        defaultMessage: "Save"
    });

    const cancelVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.assignment.cancelButton.text",
        defaultMessage: "Cancel"
    });

    const validForm: boolean = varName.length > 0 && variableExpression.length > 0;

    const nameExpressionEditorConfig: FormElementProps<ExpressionEditorProps> = {
        model: {
            name: "variableName",
            displayName: "Variable Name",
            isOptional: false,
        },
        customProps: {
            validate: validateExpressionName,
            interactive: true,
            editPosition: config?.model?.position || formArgs.targetPosition,
            hideExpand: true,
            customTemplate: {
                defaultCodeSnippet: `any|error tempAssignment = ;`,
                targetColumn: 28,
            },
            initialDiagnostics: (config.model as AssignmentStatement)?.varRef?.typeData?.diagnostics
        },
        onChange: setVarName,
        defaultValue: varName
    };

    const expressionEditorConfig: FormElementProps<ExpressionEditorProps> = {
        model: {
            name: "Expression",
            displayName: "Value Expression",
            value: variableExpression,
        },
        customProps: {
            validate: validateExpression,
            interactive: true,
            statementType: varName,
            expressionInjectables: {
                list: formArgs?.expressionInjectables?.list,
                setInjectables: formArgs?.expressionInjectables?.setInjectables
            },
            editPosition: config?.model?.position || formArgs.targetPosition,
            customTemplate: {
                defaultCodeSnippet: `${varName || 'any|error assignment'} = ;`,
                targetColumn: varName ? (varName.length + 3) : 24
            },
            changed: varName,
            initialDiagnostics: (config.model as AssignmentStatement)?.expression?.typeData?.diagnostics
        },
        onChange: onPropertyChange,
        defaultValue: variableExpression
    };

    const initialSource = formArgs.model ? formArgs.model.source : getInitialSource(createPropertyStatement(
            `${varName ? varName : "default"} = ${variableExpression ? variableExpression : "EXPRESSION"} ;`
    ));

    const nameExpressionEditor = (
        <div className="exp-wrapper">
            <LowCodeExpressionEditor
                {...nameExpressionEditorConfig}
            />
        </div>
    );

    const expressionEditor = (
        <div className="exp-wrapper">
            <LowCodeExpressionEditor
                {...expressionEditorConfig}
            />
        </div>
    );

    const handleStatementEditorChange = (partialModel: AssignmentStatement) => {
        setVarName(partialModel.varRef.source.trim());
        setVariableExpression(partialModel.expression.source.trim());
    }

    const { handleStmtEditorToggle, stmtEditorComponent } = useStatementEditor(
        {
            label: intl.formatMessage({ id: "lowcode.develop.configForms.assignment.statementEditor.label", defaultMessage: 'Assignment' }),
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
            library,
            experimentalEnabled
        }
    );

    if (!stmtEditorComponent) {
        return (
            <FormControl data-testid="property-form" className={classes.wizardFormControl}>
                <FormHeaderSection
                    onCancel={onCancel}
                    statementEditor={true}
                    formTitle={"lowcode.develop.configForms.assignment.title"}
                    defaultMessage={"Assignment"}
                    handleStmtEditorToggle={handleStmtEditorToggle}
                    toggleChecked={false}
                    experimentalEnabled={experimentalEnabled}
                />
                <div className={classes.formContentWrapper}>
                    <div className={classes.formNameWrapper}>
                        {nameExpressionEditor}
                    </div>
                    <div className={classes.formEqualWrapper}>
                        {
                            <div className={classes.formEqualContainer}>
                                <div className={classes.equalContainer}>
                                    <Typography variant='body2' className={classes.equalCode}>=</Typography>
                                </div>
                                <div className={classes.valueContainer}>
                                    {expressionEditor}
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <FormActionButtons
                    cancelBtnText={cancelVariableButtonText}
                    cancelBtn={true}
                    saveBtnText={saveVariableButtonText}
                    isMutationInProgress={isMutationInProgress}
                    validForm={validForm}
                    onSave={handleSave}
                    onCancel={onCancel}
                />
            </FormControl >
        );
    }
    else {
        return stmtEditorComponent;
    }
}
