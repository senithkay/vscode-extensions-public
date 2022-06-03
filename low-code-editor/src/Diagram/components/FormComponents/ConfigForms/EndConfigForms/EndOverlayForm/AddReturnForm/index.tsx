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
import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { Box, FormControl, Typography } from "@material-ui/core";
import { EndConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormActionButtons, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { FunctionDefinition, ModulePart, ReturnStatement, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import { createReturnStatement, getInitialSource } from "../../../../../../utils/modification-util";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";

interface ReturnFormProps {
    config: EndConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddReturnForm(props: ReturnFormProps) {
    const {
        props: {
            isMutationProgress: isMutationInProgress,
            currentFile,
            syntaxTree,
            stSymbolInfo,
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

    const { config, formArgs, onCancel, onWizardClose } = props;
    const intl = useIntl();

    const [returnExpression, setReturnExpression] = useState(config.expression);

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.Return.title",
        defaultMessage: "Return"
    });

    const initialSource = getInitialSource(createReturnStatement(
        returnExpression ? returnExpression as string : 'EXPRESSION'
    ));

    const handleStatementEditorChange = (partialModel: ReturnStatement) => {
        setReturnExpression(partialModel.expression?.source.trim())
    }

    const stmtEditorComponent = StatementEditorWrapper(
        {
            label: formTitle,
            initialSource,
            formArgs: { formArgs },
            config,
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
