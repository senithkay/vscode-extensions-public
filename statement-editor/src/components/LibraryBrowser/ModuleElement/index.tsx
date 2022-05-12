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
import React, { useContext, useState } from 'react';

import { Box, CircularProgress, ListItem, ListItemIcon, ListItemText, Typography } from "@material-ui/core";
import {
    FunctionParams,
    LibraryDataResponse,
    LibraryFunction,
    ModuleProperty
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getModuleIconStyle } from "../../../utils";
import { getFQModuleName, keywords } from "../../../utils/statement-modifications";
import { useStmtEditorHelperPanelStyles } from "../../styles";

interface ModuleElementProps {
    moduleProperty: ModuleProperty,
    key: number,
    isFunction: boolean
    label: string
}

export function ModuleElement(props: ModuleElementProps) {
    const stmtCtx = useContext(StatementEditorContext);
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const { moduleProperty, key, isFunction, label } = props;
    const { id, moduleId, moduleOrgName, moduleVersion } = moduleProperty;
    const [clickedModuleElement, setClickedModuleElement] = useState('');

    const {
        modelCtx: {
            currentModel,
            updateModel
        },
        formCtx: {
            formModelPosition
        },
        library: {
            getLibraryData
        },
        modules: {
            updateModuleList
        }
    } = stmtCtx;

    const onClickOnModuleElement = async () => {
        const moduleName = moduleId.includes('.') ? moduleId.split('.').pop() : moduleId;
        let content = keywords.includes(moduleName) ? `${moduleName}0:${id}` : `${moduleName}:${id}`;
        setClickedModuleElement(content);
        if (isFunction) {
            const response: LibraryDataResponse = await getLibraryData(moduleOrgName, moduleId, moduleVersion);

            let functionProperties: LibraryFunction = null;
            response.docsData.modules[0].functions.map((libFunction: LibraryFunction) => {
                if (libFunction.name === id) {
                    functionProperties =  libFunction;
                }
            });

            if (functionProperties) {
                const parameters: string[] = [];
                functionProperties.parameters.map((param: FunctionParams) => {
                    if (!(param.type.isInclusion || param.type.isNullable)) {
                        parameters.push(`${param.name}`);
                    }
                });

                content += `(${parameters.join(',')})`;
            }
        }
        setClickedModuleElement('');
        updateModuleList(getFQModuleName(moduleOrgName, moduleId));
        updateModel(content, currentModel.model ? currentModel.model.position : formModelPosition);
    }

    const circularProgress = (
        <Box display="flex" justifyContent="center">
            <CircularProgress size={15} style={{marginRight: '5px'}}/>
        </Box>
    );

    return (
        <ListItem
            button={true}
            key={key}
            onClick={onClickOnModuleElement}
            className={stmtEditorHelperClasses.suggestionListItem}
            disableRipple={true}
        >
            <ListItemIcon
                className={getModuleIconStyle(label)}
                style={{ minWidth: '12%', textAlign: 'left' }}
            />
            <ListItemText
                primary={<Typography className={stmtEditorHelperClasses.suggestionValue}>{`${moduleId}:${id}`}</Typography>}
            />
            {`${moduleId}:${id}` === clickedModuleElement && (circularProgress)}
        </ListItem>
    );
}
