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
import { FormattedMessage, useIntl } from "react-intl";

import { BinaryExpression, ForeachStatement } from "@wso2-enterprise/syntax-tree";
import classnames from "classnames";
import { FormControl, Typography } from "@material-ui/core";

import { FormField, ConditionConfig, ForeachConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormActionButtons, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { Context } from "../../../../../../../Contexts/Diagram";
import { getAllVariables } from "../../../../../../utils/mixins";
import { createForeachStatement, createForeachStatementWithBlock, getInitialSource } from "../../../../../../utils/modification-util";
import { genVariableName } from "../../../../../Portals/utils";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { SelectDropdownWithButton } from "../../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { ExpressionEditorProps } from "@wso2-enterprise/ballerina-expression-editor";
import { FormTextInput } from "../../../../FormFieldComponents/TextField/FormTextInput";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { FormElementProps } from "../../../../Types";
import { wizardStyles } from "../../../style";
import { VariableTypeInput, VariableTypeInputProps } from "../../../Components/VariableTypeInput";
import Tooltip from '../../../../../../../components/TooltipV2'
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";

interface Iterations {
    start?: string;
    end?: string;
}

interface ForeachProps {
    condition: ConditionConfig | any;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export const DEFINE_RANGE: string = "Define Range";
export const EXISTING_PROPERTY: string = "Select Existing Property";

export function AddForeachForm(props: ForeachProps) {
    const {
        props: {
            isMutationProgress: isMutationInProgress,
            stSymbolInfo,
            currentFile,
            syntaxTree,
            importStatements,
            experimentalEnabled
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: {
                modifyDiagram
            },
            library
        }
    } = useContext(Context);

    const { condition, formArgs, onCancel, onSave, onWizardClose } = props;

    const [conditionExpression] = useState(condition.conditionExpression);
    let initCollectionDefined: boolean = (condition.scopeSymbols.length > 0);
    const initIterations: Iterations = {
        start: undefined,
        end: undefined
    };

    if (conditionExpression.model) {
        const forEachModel: ForeachStatement = (conditionExpression as ForeachConfig).model as ForeachStatement;
        switch (forEachModel.actionOrExpressionNode.kind) {
            case 'BinaryExpression':
                const expression = forEachModel.actionOrExpressionNode as BinaryExpression;
                if (expression.operator.kind === 'EllipsisToken') {
                    initCollectionDefined = false;
                    initIterations.start = expression.lhsExpr.source.trim();
                    initIterations.end = expression.rhsExpr.source.trim();
                }

                break;
            case 'SimpleNameReference':
                initCollectionDefined = true;
                break;
        }

    }
    const intl = useIntl();

    if (!conditionExpression.variable || (conditionExpression.variable === '')) {
        conditionExpression.variable = genVariableName("item", getAllVariables(stSymbolInfo));
    };

    const [selectedType, setSelectedType] = useState(conditionExpression.type ? conditionExpression.type : "var");

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.foreach.title",
        defaultMessage: "Foreach"
    });

    const initialSource = formArgs.model ? getInitialSource(createForeachStatementWithBlock(
                                conditionExpression.collection ? conditionExpression.collection : 'EXPRESSION',
                                conditionExpression.variable,
                                selectedType,
                                (formArgs.model as ForeachStatement).blockStatement.statements.map(statement => {
                                    return statement.source
                                })
                            )) : getInitialSource(createForeachStatement(
                                conditionExpression.collection ? conditionExpression.collection : 'EXPRESSION',
                                conditionExpression.variable,
                                selectedType
                            ));

    const handleStatementEditorChange = (partialModel: ForeachStatement) => {
        conditionExpression.type = partialModel.typedBindingPattern.typeDescriptor.source.trim();
        conditionExpression.variable = partialModel.typedBindingPattern.bindingPattern.source.trim();
        conditionExpression.collection = partialModel.actionOrExpressionNode?.source.trim();
        setSelectedType(partialModel.typedBindingPattern.typeDescriptor.source.trim());
    }

    const stmtEditorComponent = StatementEditorWrapper(
        {
            label: formTitle,
            initialSource,
            formArgs: { formArgs },
            config: condition,
            onWizardClose,
            onStmtEditorModelChange: handleStatementEditorChange,
            onCancel,
            currentFile,
            getLangClient: getExpressionEditorLangClient,
            applyModifications: modifyDiagram,
            library,
            syntaxTree,
            stSymbolInfo,
            importStatements,
            experimentalEnabled
        }
    );

    return stmtEditorComponent;
}
