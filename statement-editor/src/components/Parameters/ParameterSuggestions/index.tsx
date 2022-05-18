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
import React, { useContext, useEffect } from "react";

import { List, ListItem, ListItemText, ListSubheader } from "@material-ui/core";
import { ParameterInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { SymbolParameterType } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../../styles";
import { ParameterList } from "../ParameterList";

// tslint:disable: jsx-no-multiline-js jsx-no-lambda
export function ParameterSuggestions(){
    const {
        modelCtx: {
            currentModel
        },
        documentation
    } = useContext(StatementEditorContext);
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const statementEditorClasses = useStatementEditorStyles();
    const [checked, setChecked] = React.useState<any[]>([]);


    useEffect(() => {
        if (currentModel.model && documentation && documentation.documentation?.parameters) {
            const newChecked : any[] = [];
            const paramsInModel: STNode[] = [];

            if (STKindChecker.isFunctionCall(currentModel.model)) {
                currentModel.model.arguments.forEach((parameter: any) => {
                    if (!parameter.isToken) {
                        paramsInModel.push(parameter);
                    }
                });
            }

            paramsInModel.map((param: STNode, value: number) => {
                if (STKindChecker.isNamedArg(param)) {
                    for (let i = 0; i < documentation.documentation.parameters.length; i++){
                        const docParam : ParameterInfo = documentation.documentation.parameters[i];
                        if (param.argumentName.name.value === docParam.name ||
                            docParam.kind === SymbolParameterType.INCLUDED_RECORD || docParam.kind === SymbolParameterType.REST){
                            if (newChecked.indexOf(i) === -1){
                                newChecked.push(i);
                                break;
                            }
                        }
                    }
                } else {
                    newChecked.push(value);
                }
            });

            setChecked(newChecked);
        }
    }, [currentModel.model, documentation]);

    const setCheckedList = (newChecked : []) => {
        setChecked(newChecked);
    }


    return(
        <>
            {documentation === null ? (
                <div className={statementEditorClasses.stmtEditorInnerWrapper}>
                    <p>Please upgrade to the latest Ballerina version</p>
                </div>
            ) : (
                <>
                    {documentation && !(documentation.documentation === undefined) ? (
                        <List className={statementEditorClasses.stmtEditorInnerWrapper}>
                            <ListItem className={stmtEditorHelperClasses.docDescription}>
                                <ListItemText primary={documentation.documentation.description}/>
                            </ListItem>
                            <ParameterList checkedList={checked} setCheckedList={setCheckedList} />
                            {documentation.documentation.returnValueDescription && (
                                <>
                                    <hr className={stmtEditorHelperClasses.returnSeparator}/>
                                    <ListSubheader className={stmtEditorHelperClasses.parameterHeader}>
                                        Return
                                    </ListSubheader>
                                    <ListItem className={stmtEditorHelperClasses.returnDescription}>
                                        <ListItemText primary={documentation.documentation.returnValueDescription}/>
                                    </ListItem>
                                </>
                            )}
                        </List>
                    ) : (
                        <div className={statementEditorClasses.stmtEditorInnerWrapper}>
                            <p>Please select a function to see the parameter information</p>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
