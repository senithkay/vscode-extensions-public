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
import { EndConfig, httpResponse, PrimitiveBalType, RespondConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormActionButtons, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { ActionStatement, RemoteMethodCallAction } from "@wso2-enterprise/syntax-tree";
import cn from "classnames";

import { Context } from "../../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import { createRespond, getInitialSource } from "../../../../../../utils/modification-util";
import { useStyles as useFormStyles } from "../../../../DynamicConnectorForm/style";
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";

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

    const { config, formArgs, onCancel, onSave, onWizardClose } = props;

    const respondFormConfig: RespondConfig = config.expression as RespondConfig;

    const isFormValid = (respondExp: string): boolean => {
        return (respondFormConfig.caller !== '') && (respondExp !== '');
    };

    const [validForm, setValidForm] = useState(isFormValid(respondFormConfig.respondExpression));
    const [resExp, setResExp] = useState(undefined);
    const intl = useIntl();

    const handleStatementEditorChange = (partialModel: ActionStatement) => {
        const remoteCallModel: RemoteMethodCallAction = partialModel?.expression.expression as RemoteMethodCallAction;
        respondFormConfig.respondExpression = remoteCallModel?.arguments[0].source;
        setResExp(remoteCallModel?.arguments[0].source);
        setValidForm(false);
    }

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.Respond.title",
        defaultMessage: "Respond"
    });

    const initialSource = getInitialSource(createRespond(
        respondFormConfig.genType,
        respondFormConfig.variable,
        respondFormConfig.caller,
        resExp ? resExp : "EXPRESSION"
    ));

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
