/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, {useContext} from "react";

import { MappingBindingPattern } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { isPositionsEquals } from "../../../utils";
import { InputEditor } from "../../InputEditor";
import { useStatementEditorStyles } from "../../styles";

interface MappingBindingPatternProps {
    model: MappingBindingPattern;
}

export function MappingBindingPatternComponent(props: MappingBindingPatternProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            currentModel
        }
    } = stmtCtx;

    const hasBindingPatternSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.position);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const inputEditorProps = {
        model,
        expressionHandler
    };

    const onClickOnBindingPattern = (event: any) => {
        event.stopPropagation()
        expressionHandler(model, false, false,
            { expressionSuggestions: [], typeSuggestions: [], variableSuggestions: [] })
    };

    return (
        <span
            className={classNames(
                statementEditorClasses.expressionElement,
                hasBindingPatternSelected && statementEditorClasses.expressionElementSelected)}
            onClick={onClickOnBindingPattern}
        >
            <InputEditor {...inputEditorProps} />
        </span>
    );
}
