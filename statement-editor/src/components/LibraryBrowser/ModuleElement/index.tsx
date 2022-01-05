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
import React, { useContext } from 'react';

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStatementEditorStyles } from "../../styles";

interface ModuleElementProps {
    name: string,
    moduleId: string,
    key: number,
    isFunction: boolean
}

export function ModuleElement(props: ModuleElementProps) {
    const statementEditorClasses = useStatementEditorStyles();
    const { name, moduleId, key, isFunction } = props;

    const {
        modelCtx: {
            currentModel,
            updateModel
        }
    } = useContext(StatementEditorContext);

    const onClickOnModuleElement = () => {
        const content = isFunction ? `${moduleId}:${name}(EXPRESSION)` : `${moduleId}:${name}`;
        updateModel(content, currentModel.model.position);
    }

    return (
        <button
            className={statementEditorClasses.libraryResourceButton}
            key={key}
            onClick={onClickOnModuleElement}
        >
            {`${moduleId}:${name}`}
        </button>
    );
}
