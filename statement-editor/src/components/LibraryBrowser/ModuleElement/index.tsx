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

import {
    LibraryDataResponse,
    LibraryFunction,
    ModuleProperty
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStatementEditorStyles } from "../../styles";

interface ModuleElementProps {
    moduleProperty: ModuleProperty,
    key: number,
    isFunction: boolean
}

export function ModuleElement(props: ModuleElementProps) {
    const stmtCtx = useContext(StatementEditorContext);
    const statementEditorClasses = useStatementEditorStyles();
    const { moduleProperty, key, isFunction } = props;
    const { id, moduleId, moduleOrgName, moduleVersion } = moduleProperty;

    const {
        modelCtx: {
            currentModel,
            updateModel
        }
    } = useContext(StatementEditorContext);

    const onClickOnModuleElement = async () => {
        const response: LibraryDataResponse = await stmtCtx.getLibraryData(moduleOrgName, moduleId, moduleVersion);

        let content = `${moduleId}:${id}`;

        if (isFunction) {
            let functionProperties: LibraryFunction = null;
            response.docsData.modules[0].functions.map((libFunction: LibraryFunction) => {
                if (libFunction.name === id) {
                    functionProperties =  libFunction;
                }
            });

            if (functionProperties) {
                const noOfParams = functionProperties.parameters.length;
                let params = '(';
                for (let i = 1; i <= noOfParams; i++) {
                    if (noOfParams === 1) {
                        params += 'PARAM';
                    } else {
                        params += i !== noOfParams ? `PARAM${i},` : `PARAM${i}`;
                    }
                }
                params += ')';
                content += params;
            }
        }
        updateModel(content, currentModel.model.position);
    }

    return (
        <button
            className={statementEditorClasses.libraryResourceButton}
            key={key}
            onClick={onClickOnModuleElement}
        >
            {`${moduleId}:${id}`}
        </button>
    );
}
