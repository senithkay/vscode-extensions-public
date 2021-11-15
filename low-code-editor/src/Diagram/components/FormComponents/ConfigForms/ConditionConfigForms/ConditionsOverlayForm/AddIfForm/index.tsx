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

import { NodePosition } from "@ballerina/syntax-tree";
import classnames from "classnames";
import { Box, FormControl, IconButton, Typography } from "@material-ui/core";
import { ControlPoint, RemoveCircleOutlineRounded } from "@material-ui/icons";

import { FormField } from "../../../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import { createIfStatement, getInitialSource } from "../../../../../../utils/modification-util";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import ExpressionEditor from "../../../../FormFieldComponents/ExpressionEditor";
import { FormActionButtons } from "../../../../FormFieldComponents/FormActionButtons";
import { useStatementEditor } from "../../../../FormFieldComponents/StatementEditor/hooks";
import { ConditionConfig, ElseIfConfig, FormElementProps } from "../../../../Types";


interface IfProps {
    condition: ConditionConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    done: () => void;
}

export const DEFINE_CONDITION: string = "Define Condition Expression";
export const EXISTING_PROPERTY: string = "Select Boolean Property";

interface ExpressionsArray {
    id: number, expression: string, position: NodePosition
}

export function AddIfForm(props: IfProps) {
    const {
        props: {
            isCodeEditorActive,
            isMutationProgress: isMutationInProgress
        }
    } = useContext(Context);
    const { condition, formArgs, onCancel, onSave, done } = props;
    const classes = useStyles();
    const intl = useIntl();

    const [isInvalid, setIsInvalid] = useState(true);

    let statementConditions : ExpressionsArray[];
    statementConditions = ((condition.conditionExpression as ElseIfConfig)?.values)
        ? (condition.conditionExpression as ElseIfConfig).values
        : [{id: 0, expression: "", position: {}}];
    const [compList, setCompList] = useState(statementConditions);

    const handlePlusButton = (order: number) => () => {
        if (order === -1){
            setCompList((prev) => {
                return [...prev, {id: prev.length, expression: "", position: {}}]
            });
        }else {
            setCompList((prev) => {
                return [...prev.slice(0, order), {id: order, expression: "", position: {}}, ...prev.slice(order, prev.length)];
            });
        }
    }

    const handleMinusButton = (order: number) => () => {
        setCompList(compList.filter((comp) => {
            return comp.id !== order
        }));
    }

    const handleExpEditorChange = (order: number) => (value: string) => {
        setCompList((prevState) => {
            return [...prevState.slice(0, order), {...prevState[order], expression: value}, ...prevState.slice(order + 1, prevState.length)];
        });
    }

    const validateField = (fieldName: string, isInvalidFromField: boolean) => {
        let isInvalidForm = false;
        for (const elem of compList) {
            if (elem.expression === "") {
                isInvalidForm = true;
                break;
            }
        }
        setIsInvalid(isInvalidFromField || isInvalidForm)
    }

    const setFormField = (order: number): FormField => {
        return {
            name: "condition",
            displayName: "Condition",
            typeName: "boolean",
            value: compList[order]?.expression
        }
    }

    const IFStatementTooltipMessages = {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.title",
            defaultMessage: "Enter a Ballerina expression."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.actionText",
            defaultMessage: "Learn Ballerina expressions"
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.configForms.IFStatementTooltipMessages.expressionEditor.tooltip.actionTitle",
            defaultMessage: "{learnBallerina}"
        }, { learnBallerina: BALLERINA_EXPRESSION_SYNTAX_PATH })
    };

    const setElementProps = (order: number): FormElementProps => {
        return {
            model: setFormField(order),
            customProps: {
                validate: validateField,
                tooltipTitle: IFStatementTooltipMessages.title,
                tooltipActionText: IFStatementTooltipMessages.actionText,
                tooltipActionLink: IFStatementTooltipMessages.actionLink,
                interactive: true,
                statementType: setFormField(order).typeName,
                expressionInjectables: {
                    list: formArgs?.expressionInjectables?.list,
                    setInjectables: formArgs?.expressionInjectables?.setInjectables
                }
            },
            onChange: handleExpEditorChange(order),
            defaultValue: compList[order]?.expression
        }
    }

    const handleOnSaveClick = () => {
        condition.conditionExpression = {values: compList}
        onSave();
    }

    const saveIfConditionButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.if.saveButton.label",
        defaultMessage: "Save"
    });

    const cancelIfButtonLabel = intl.formatMessage({
        id: "lowcode.develop.configForms.if.cancelButton.label",
        defaultMessage: "Cancel"
    });

    const initialSource = getInitialSource(createIfStatement(
        condition.conditionExpression ? condition.conditionExpression as string : 'EXPRESSION'
    ));

    const {stmtEditorButton , stmtEditorComponent} = useStatementEditor(
        {
            label: intl.formatMessage({id: "lowcode.develop.configForms.if.statementEditor.label"}),
            initialSource,
            formArgs: {formArgs},
            isMutationInProgress,
            validForm: !isInvalid,
            config: condition,
            done
        }
    );

    const ElseIfElement = (order: number) => {
        return (
            <>
                <div className={classes.blockWrapper}>
                    <div className={classes.codeText}>
                        <Typography variant='body2' className={classes.endCode}>{`}`}</Typography>
                    </div>
                    {
                        formArgs?.wizardType === 0 && (
                            <div className={classes.codeText}>
                                <IconButton
                                    color="primary"
                                    onClick={handleMinusButton(order)}
                                    className={classes.button}
                                >
                                    <RemoveCircleOutlineRounded/>
                                </IconButton>
                            </div>
                        )
                    }
                    <div className={classes.codeText}>
                        <Typography variant='body2' className={classes.startCode}>else if</Typography>
                    </div>
                    <div className={classes.ifEditorWrapper}>
                        <div className="exp-wrapper">
                            <ExpressionEditor {...setElementProps(order)} hideLabelTooltips={true} />
                        </div>
                    </div>
                    <div className={classes.codeText}>
                        <Typography variant='body2' className={classes.endCode}>{`{`}</Typography>
                    </div>
                </div>
                <div className={classes.codeWrapper}>
                    <Typography variant='body2' className={classes.middleCode}>{`...`}</Typography>
                </div>
            </>
        )
    }

    if (!stmtEditorComponent) {
        return (
                <FormControl data-testid="if-form" className={classes.wizardFormControl}>
                    <div className={classes.formWrapper}>
                        <div className={classes.formFeilds}>
                            <div className={classes.formWrapper}>
                                <div className={classes.formTitleWrapper}>
                                    <div className={classes.mainTitleWrapper}>
                                        <Typography variant="h4">
                                            <Box paddingTop={2} paddingBottom={2}>
                                                <FormattedMessage
                                                    id="lowcode.develop.configForms.if.title"
                                                    defaultMessage="If"
                                                />
                                            </Box>
                                        </Typography>
                                    </div>
                                    {/* TODO: Add after statement editor support {stmtEditorButton}*/}
                                </div>
                                <div className={classes.blockWrapper}>
                                    <div className={classes.codeText}>
                                        <Typography variant='body2' className={classnames(classes.startCode)}>if</Typography>
                                    </div>
                                    <div className={classes.ifEditorWrapper}>
                                        <div className="exp-wrapper">
                                            <ExpressionEditor {...setElementProps(0)} hideLabelTooltips={true} />
                                        </div>
                                    </div>
                                    <div className={classes.codeText}>
                                        <Typography variant='body2' className={classnames(classes.endCode)}>{`{`}</Typography>
                                    </div>
                                </div>
                                <div className={classes.codeWrapper}>
                                    <Typography variant='body2' className={classes.middleCode}>...</Typography>
                                </div>
                                {compList.slice(1, compList.length).map((comp) => {
                                    return <React.Fragment key={comp.id}>{ElseIfElement(comp.id)}</React.Fragment>
                                })}
                                <div className={classes.blockWrapper}>
                                    <div className={classes.codeText}>
                                        <Typography variant='body2' className={classes.endCode}>{`}`}</Typography>
                                    </div>
                                    {
                                        formArgs?.wizardType === 0 && (
                                            <div className={classes.codeText}>
                                                <IconButton
                                                    color="primary"
                                                    onClick={handlePlusButton(-1)}
                                                    className={classes.button}
                                                >
                                                    <ControlPoint/>
                                                </IconButton>
                                            </div>
                                        )
                                    }
                                    <div className={classes.codeText}>
                                        <Typography variant='body2' className={classes.startCode}>else</Typography>
                                    </div>
                                    <div className={classes.codeText}>
                                        <Typography variant='body2' className={classes.endCode}>{`{`}</Typography>
                                    </div>
                                </div>
                                <div className={classes.codeWrapper}>
                                    <Typography variant='body2' className={classes.middleCode}>{`...`}</Typography>
                                </div>
                                <div className={classes.codeWrapper}>
                                    <Typography variant='body2' className={classes.endCode}>{`}`}</Typography>
                                </div>
                            </div>
                        </div>
                        <FormActionButtons
                            cancelBtnText={cancelIfButtonLabel}
                            saveBtnText={saveIfConditionButtonLabel}
                            isMutationInProgress={isMutationInProgress}
                            validForm={!isInvalid}
                            onSave={handleOnSaveClick}
                            onCancel={onCancel}
                        />
                    </div>
                </FormControl>
            );
    }
    else {
        return stmtEditorComponent;
    }
}
