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
// tslint:disable: jsx-no-multiline-js ordered-imports
import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { BlockStatement, ElseBlock, IfElseStatement, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classnames from "classnames";
import { Box, FormControl, IconButton, Typography } from "@material-ui/core";
import { ControlPoint, RemoveCircleOutlineRounded } from "@material-ui/icons";

import {
    FormActionButtons,
    FormElementProps,
    FormField,
    FormHeaderSection,
    DiagramDiagnostic
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Context } from "../../../../../../../Contexts/Diagram";
import {
    createElseIfStatement,
    createElseIfStatementWithBlock,
    createElseStatement,
    createElseStatementWithBlock,
    createIfStatement,
    createIfStatementWithBlock,
    getInitialSource
} from "../../../../../../utils/modification-util";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { ExpressionEditorProps } from "@wso2-enterprise/ballerina-expression-editor";
import { useStatementEditor } from "@wso2-enterprise/ballerina-statement-editor";
import { ConditionConfig, ElseIfConfig } from "../../../../Types";
import Tooltip from '../../../../../../../components/TooltipV2'
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";

interface IfProps {
    condition: ConditionConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export const DEFINE_CONDITION: string = "Define Condition Expression";
export const EXISTING_PROPERTY: string = "Select Boolean Property";

interface ExpressionsArray {
    id: number;
    expression: string;
    position: NodePosition;
    diagnostics?: DiagramDiagnostic[];
    isValid?: boolean;
}

export function AddIfForm(props: IfProps) {
    const {
        props: {
            isMutationProgress: isMutationInProgress,
            currentFile,
            importStatements,
            experimentalEnabled
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: {
                modifyDiagram
            },
            library
        },
    } = useContext(Context);
    const { condition, formArgs, onCancel, onSave, onWizardClose } = props;
    const classes = useStyles();
    const intl = useIntl();

    let statementConditions: ExpressionsArray[];
    statementConditions = (condition.conditionExpression as ElseIfConfig)?.values
        ? (condition.conditionExpression as ElseIfConfig).values
        : [{ id: 0, expression: "", position: {}, isValid: false }];
    const [compList, setCompList] = useState(
        statementConditions.map((item) => ({
            ...item,
            isValid: item.diagnostics?.length === 0,
        }))
    );

    const handlePlusButton = (order: number) => () => {
        if (order === -1) {
            setCompList((prev) => {
                return [...prev, { id: prev.length, expression: "", position: {}, isValid: false }];
            });
        } else {
            setCompList((prev) => {
                return [...prev.slice(0, order), { id: order, expression: "", position: {}, isValid: false }, ...prev.slice(order, prev.length)];
            });
        }
    };

    const handleMinusButton = (order: number) => () => {
        setCompList(
            compList.filter((comp) => {
                return comp.id !== order;
            })
        );
    };

    const handleExpEditorChange = (order: number) => (value: string) => {
        setCompList((prevState) => {
            return [...prevState.slice(0, order), { ...prevState[order], expression: value }, ...prevState.slice(order + 1, prevState.length)];
        });
    };

    const validateExpEditor = (isInvalid: boolean, order: number) => {
        setCompList((prevState) => {
            return [...prevState.slice(0, order), { ...prevState[order], isValid: !isInvalid }, ...prevState.slice(order + 1, prevState.length)];
        });
    };

    const updateElseIfExpressions = (obj: ElseBlock, element: ExpressionsArray): ElseBlock => {
        if (STKindChecker.isIfElseStatement(obj.elseBody)) {
            element.expression = obj.elseBody.condition.source.trim();
            return obj.elseBody.elseBody;
        }
        return null;
    }

    const handleStatementEditorChange = (partialModel: IfElseStatement) => {
        compList[0].expression = partialModel.condition.source.trim();
        let elseIfModel = partialModel.elseBody ? partialModel.elseBody : null;
        compList.map((element, index) => {
            if (index !== 0 && elseIfModel) {
                elseIfModel = updateElseIfExpressions(elseIfModel, element)
            }
        })
    }

    const setFormField = (order: number): FormField => {
        return {
            name: "condition",
            displayName: "Condition",
            typeName: "boolean",
            value: compList[order]?.expression,
        };
    };

    const getInitialDiagnostics = (order: number): DiagramDiagnostic[] => compList[order]?.diagnostics;

    const IFStatementTooltipMessages = {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.title",
            defaultMessage: "Press CTRL+Spacebar for suggestions.",
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.actionText",
            defaultMessage: "Learn about Ballerina expressions here",
        }),
        actionLink: intl.formatMessage(
            {
                id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.actionTitle",
                defaultMessage: "{learnBallerina}",
            },
            { learnBallerina: "https://ballerina.io/1.2/learn/by-example/if-else.html?is_ref_by_example=true#iMainNavigation" }
        ),
        codeBlockTooltip: intl.formatMessage({
            id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.codeBlock",
            defaultMessage: "To add code inside the if block, save if condition and use the diagram add buttons",
        }),
    };

    const setElementProps = (order: number): FormElementProps<ExpressionEditorProps> => {
        return {
            model: setFormField(order),
            customProps: {
                validate: (_name: string, isInvalid: boolean) => validateExpEditor(isInvalid, order),
                tooltipTitle: IFStatementTooltipMessages.title,
                tooltipActionText: IFStatementTooltipMessages.actionText,
                tooltipActionLink: IFStatementTooltipMessages.actionLink,
                interactive: true,
                statementType: setFormField(order).typeName,
                expressionInjectables: {
                    list: formArgs?.expressionInjectables?.list,
                    setInjectables: formArgs?.expressionInjectables?.setInjectables,
                },
                initialDiagnostics: getInitialDiagnostics(order),
                editPosition: {
                    startLine: formArgs?.model ? formArgs?.model.position.startLine : formArgs.targetPosition.startLine,
                    endLine: formArgs?.model ? formArgs?.model.position.startLine : formArgs.targetPosition.startLine,
                    startColumn: 0,
                    endColumn: 0
                }

            },
            onChange: handleExpEditorChange(order),
            defaultValue: compList[order]?.expression
        };
    };

    const handleOnSaveClick = () => {
        condition.conditionExpression = { values: compList };
        onSave();
    };

    const saveIfConditionButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.if.saveButton.label",
        defaultMessage: "Save",
    });

    const cancelIfButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.if.cancelButton.label",
        defaultMessage: "Cancel",
    });

    const validForm = compList.every((item) => item.isValid) && compList[0]?.expression !== "";

    const getCompleteSource = () => {
        let source = "";
        if (formArgs.model){
            let currentModel = formArgs.model as IfElseStatement;
            source = source + getInitialSource(createIfStatementWithBlock(
                compList[0].expression ? compList[0].expression : 'EXPRESSION',
                currentModel.ifBody.statements.map(statement => {
                    return statement.source
                })
            ));
            if (compList.length > 1) {
                compList.map((element, index) => {
                    if (index !== 0){
                        currentModel = currentModel.elseBody.elseBody as IfElseStatement
                        source = source + getInitialSource(createElseIfStatementWithBlock(
                            element.expression ? element.expression : 'EXPRESSION',
                            currentModel.ifBody.statements.map(statement => {
                                return statement.source
                            })
                        ));
                    }
                })
            }
            source = source + getInitialSource(createElseStatementWithBlock(
                (currentModel.elseBody.elseBody as BlockStatement).statements.map(statement => {
                    return statement.source
                })
            ));
        }
        else {
            source = getInitialSource(createIfStatement(
                compList[0].expression ? compList[0].expression : 'EXPRESSION'
            ));
            if (compList.length > 1) {
                compList.map((element, index) => {
                    if (index !== 0){
                        source = source + getInitialSource(createElseIfStatement(element.expression ? element.expression : 'EXPRESSION'))
                    }
                })
            }
            source = source + getInitialSource(createElseStatement());
        }
        return source;
    }

    const initialSource = getCompleteSource();

    const { handleStmtEditorToggle, stmtEditorComponent } = useStatementEditor(
        {
            label: intl.formatMessage({ id: "lowcode.develop.configForms.if.statementEditor.label" }),
            initialSource,
            formArgs: { formArgs },
            validForm,
            config: condition,
            onWizardClose,
            handleStatementEditorChange,
            onCancel,
            currentFile,
            getLangClient: getExpressionEditorLangClient,
            applyModifications: modifyDiagram,
            library,
            importStatements,
            experimentalEnabled
        }
    );

    const ElseIfElement = (order: number) => {
        return (
            <div className={classes.elseBlockWrapper}>
                <div className={classes.elseIfExpressionWrapper}>
                    <Typography variant='body2' className={classes.endCode}>{`}`}</Typography>
                    {formArgs?.wizardType === 0 && (
                        <div className={classes.formCodeMinusWrapper}>
                            <IconButton
                                color="primary"
                                onClick={handleMinusButton(order)}
                                className={classes.button}
                                data-testid="minus-button"
                            >
                                <RemoveCircleOutlineRounded />
                            </IconButton>
                        </div>
                    )}
                    <Typography variant='body2' className={classes.startCode}>else if</Typography>
                    <div className={classes.formCodeExpressionSmallField}>
                        <LowCodeExpressionEditor {...setElementProps(order)} hideLabelTooltips={true} />
                    </div>
                    <Typography variant='body2' className={classes.endCode}>{`{`}</Typography>
                </div>
                <div className={classes.middleDottedwrapper}>
                    <Tooltip type='info' text={{ content: IFStatementTooltipMessages.codeBlockTooltip }}>
                        <Typography variant='body2' className={classes.middleCode}>...</Typography>
                    </Tooltip>
                </div>
            </div>
        )
    }

    if (!stmtEditorComponent) {
        return (
            <FormControl data-testid="if-form" className={classes.wizardFormControl}>
                <FormHeaderSection
                    onCancel={onCancel}
                    statementEditor={true}
                    formTitle={"lowcode.develop.configForms.if.title"}
                    defaultMessage={"If"}
                    handleStmtEditorToggle={handleStmtEditorToggle}
                    toggleChecked={false}
                    experimentalEnabled={experimentalEnabled}
                />
                <div className={classes.formContentWrapper}>
                    <div className={classes.formCodeBlockWrapper}>
                        <div className={classes.formCodeExpressionEndWrapper}>
                            <Typography variant='body2' className={classes.ifStartCode}>if</Typography>
                            <div className={classes.formCodeExpressionField}>
                                <LowCodeExpressionEditor {...setElementProps(0)} />
                            </div>
                            <Typography variant='body2' className={classes.endCode}>{`{`}</Typography>
                        </div>
                    </div>
                    <div className={classes.middleDottedwrapper}>
                        <Tooltip type='info' text={{ content: IFStatementTooltipMessages.codeBlockTooltip }}>
                            <Typography variant='body2' className={classes.middleCode}>...</Typography>
                        </Tooltip>
                    </div>
                    {compList.slice(1, compList.length).map((comp) => {
                        return <React.Fragment key={comp.id}>{ElseIfElement(comp.id)}</React.Fragment>
                    })}
                    <div className={classes.formCodeExpressionCenterWrapper}>
                        <Typography variant='body2' className={classes.endCode}>{`}`}</Typography>
                        <div className={classes.formCodePlusWrapper}>
                            {formArgs?.wizardType === 0 && (
                                <IconButton
                                    color="primary"
                                    onClick={handlePlusButton(-1)}
                                    className={classes.button}
                                    data-testid="plus-button"
                                >
                                    <ControlPoint />
                                </IconButton>
                            )}
                        </div>
                        <Typography variant='body2' className={classes.startCode}>else</Typography>
                        <Typography variant='body2' className={classes.endCode}>{`{`}</Typography>
                    </div>
                    <div className={classes.formCodeBlockWrapper}>
                        <div className={classes.middleDottedwrapper}>
                            <Tooltip type='info' text={{ content: IFStatementTooltipMessages.codeBlockTooltip }}>
                                <Typography variant='body2' className={classes.middleCode}>{`...`}</Typography>
                            </Tooltip>
                        </div>
                        <Typography variant='body2' className={classes.endCode}>{`}`}</Typography>
                    </div>
                </div>
                <FormActionButtons
                    cancelBtnText={cancelIfButtonLabel}
                    cancelBtn={true}
                    saveBtnText={saveIfConditionButtonLabel}
                    isMutationInProgress={isMutationInProgress}
                    validForm={validForm}
                    onSave={handleOnSaveClick}
                    onCancel={onCancel}
                />
            </FormControl>
        );
    } else {
        return stmtEditorComponent;
    }
}
