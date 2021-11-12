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
import React, { useContext, useEffect, useState } from 'react';
import { useIntl } from "react-intl";

import { NodePosition, STKindChecker, STNode } from "@ballerina/syntax-tree";

import { Context } from '../../../../../../../Contexts/Diagram';
import { wizardStyles } from "../../../../ConfigForms/style";
import { ConditionConfig, EndConfig, ProcessConfig } from "../../../../types";
import { PrimaryButton } from "../../../Button/PrimaryButton";
import { SecondaryButton } from "../../../Button/SecondaryButton";
import { VariableUserInputs } from '../../models/definitions';
import { StatementEditorContextProvider } from "../../store/statement-editor-context";
import { getPartialSTForStatement } from "../../utils";
import { createStatement, updateStatement } from "../../utils/statement-modifications";
import { LeftPane } from '../LeftPane';
import { RightPane } from '../RightPane';

import { useStatementEditorStyles } from "./styles";

export interface ViewProps {
    label: string,
    initialSource: string,
    formArgs: any,
    userInputs?: VariableUserInputs,
    config?: ProcessConfig | EndConfig | ConditionConfig
    isMutationInProgress?: boolean
    validForm?: boolean
    onCancel?: () => void
    onSave?: () => void
    handleNameOnChange?: (name: string) => void
    handleTypeChange?: (name: string) => void
}

export function ViewContainer(props: ViewProps) {
    const {
        props: {
            langServerURL,
        },
        api: {
            ls,
            code: {
                modifyDiagram
            }
        }
    } = useContext(Context);
    const {
        label,
        initialSource,
        formArgs,
        userInputs,
        config,
        onCancel,
        onSave,
        handleNameOnChange,
        handleTypeChange
    } = props;
    const intl = useIntl();

    const [model, setModel] = useState<STNode>(null);
    const [isStatementValid, setIsStatementValid] = useState(false);

    if (!userInputs?.varName && !!handleNameOnChange){
        handleNameOnChange("default")
    }

    useEffect(() => {
        (async () => {
            const partialST: STNode = await getPartialSTForStatement({codeSnippet: initialSource}, langServerURL, ls);
            setModel(partialST);
        })();
    }, []);

    useEffect(() => {
        if (!!model && STKindChecker.isLocalVarDecl(model)) {
            handleNameOnChange(model.typedBindingPattern.bindingPattern.source)
            handleTypeChange(model.typedBindingPattern.typeDescriptor.source)
        }
    }, [model]);
    const updateModel = async (codeSnippet : string, position: NodePosition) => {
        const stModification = {
            startLine: position.startLine,
            startColumn: position.startColumn,
            endLine: position.endLine,
            endColumn: position.endColumn,
            newCodeSnippet: codeSnippet
        }
        const partialST: STNode = await getPartialSTForStatement({codeSnippet : model.source, stModification}, langServerURL, ls);
        setModel(partialST);
    }

    const [currentModel, setCurrentModel] = useState({ model });

    const [onCancelClicked, setOnCancel] = useState(false);

    const currentModelHandler = (cModel: STNode) => {
        setCurrentModel({
            model: cModel
        });
    };

    const onCancelHandler = () => {
        setOnCancel(true);
    }

    const validateStatement = (isValid: boolean) => {
        setIsStatementValid(isValid);
    };

    useEffect(() => {
        return () => {
            onCancel();
        }
    }, [onCancelClicked])

    const overlayClasses = useStatementEditorStyles();
    const wizardStylesClasses = wizardStyles();

    const saveVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.saveButton.text",
        defaultMessage: "Save"
    });

    const cancelVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.cancelButton.text",
        defaultMessage: "Cancel"
    });

    const onSaveClick = () => {
        if (STKindChecker.isLocalVarDecl(model)
                || STKindChecker.isCallStatement(model)
                || STKindChecker.isReturnStatement(model)
                || (config && config.type === 'Custom')) {
            if (config.model) {
                modifyDiagram([updateStatement(model.source, formArgs.formArgs?.model.position)]);
            } else {
                modifyDiagram([createStatement(model.source, formArgs.formArgs?.targetPosition)]);
            }
        }

        if (STKindChecker.isWhileStatement(model)
                || STKindChecker.isIfElseStatement(model)
                || STKindChecker.isForeachStatement(model)) {
            if (!formArgs.formArgs?.config) {
                modifyDiagram([createStatement(model.source, formArgs.formArgs?.targetPosition)]);
            } else {
                modifyDiagram([updateStatement(model.source, config.model.position)]);
            }
        }
    };

    return (
        model && (
            <div className={overlayClasses.stmtEditor}>
                <div className={overlayClasses.contentPane}>
                    <StatementEditorContextProvider
                        model={model}
                        onCancelClicked={onCancelClicked}
                        onSave={onSave}
                        updateModel={updateModel}
                        formModel={formArgs.formArgs.model}
                        validateStatement={validateStatement}
                    >
                        <LeftPane
                            currentModel={currentModel}
                            label={label}
                            userInputs={userInputs}
                            currentModelHandler={currentModelHandler}
                        />
                    </StatementEditorContextProvider>
                    <div className={overlayClasses.vl}/>
                    <RightPane/>
                </div>
                <div className={overlayClasses.bottomPane}>
                    <div className={wizardStylesClasses.buttonWrapper}>
                        <SecondaryButton
                            text={cancelVariableButtonText}
                            fullWidth={false}
                            onClick={onCancelHandler}
                        />
                        <PrimaryButton
                            dataTestId="save-btn"
                            text={saveVariableButtonText}
                            disabled={!isStatementValid}
                            fullWidth={false}
                            onClick={onSaveClick}
                        />
                    </div>
                </div>
            </div>
        )
    )
}
