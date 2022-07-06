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
import { BallerinaConnectorInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import {
    getCurrentModelParams,
    getDocDescription,
    getParentFunctionModel,
    isDescriptionWithExample,
    isDocumentationSupportedModel,
    updateParamDocWithParamPositions,
    updateParamListFordMethodCallDoc
} from "../../../utils";
import { StatementEditorViewState } from "../../../utils/statement-editor-viewstate";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../../styles";
import { ParameterList } from "../ParameterList";
import { ParameterTree } from "../ParameterTree";

// tslint:disable: jsx-no-multiline-js jsx-no-lambda
export function ParameterSuggestions() {
    const {
        modelCtx: {
            currentModel,
            statementModel
        },
        formCtx: {
            formArgs: {
                connector
            }
        },
        documentation: {
            documentation
        }
    } = useContext(StatementEditorContext);
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const statementEditorClasses = useStatementEditorStyles();
    const [paramDoc, setParamDoc] = React.useState(documentation.documentation);

    const connectorInfo = (connector as BallerinaConnectorInfo);
    const connectorInit = connectorInfo?.functions.find(func => func.name === "init");

    useEffect(() => {
        if (currentModel.model && documentation && documentation.documentation?.parameters) {
            const paramsInModel: STNode[] = isDocumentationSupportedModel(currentModel.model) ?
                getCurrentModelParams(currentModel.model) :
                getCurrentModelParams(
                    getParentFunctionModel((currentModel.model.parent.viewState as StatementEditorViewState)?.parentFunctionPos,
                        statementModel));
            // TODO: Remove this check once the methodCall param filter is added to the LS
            if (STKindChecker.isMethodCall(currentModel.model)) {
                updateParamListFordMethodCallDoc(paramsInModel, documentation.documentation);
            }
            setParamDoc(updateParamDocWithParamPositions(paramsInModel, documentation.documentation));
        }
    }, [currentModel.model, documentation]);

    const getDocumentationDescription = () => {
        const doc = documentation.documentation.description;
        const docRegex = /```ballerina\n(.*?)\n```/gms;
        if (isDescriptionWithExample(doc)) {
            const des = getDocDescription(doc);
            const docEx = docRegex.exec(doc);
            return (
                <>
                    <ListItemText primary={des[0]}/>
                    <ListSubheader className={stmtEditorHelperClasses.exampleHeader}>
                        Example
                    </ListSubheader>
                    <ListItem className={stmtEditorHelperClasses.docDescription}>
                        <code className={stmtEditorHelperClasses.exampleCode}>{docEx[1]}</code>
                    </ListItem>
                </>
            );
        } else {
            return (
                <ListItemText primary={doc}/>
            );
        }
    }

    return (
        <>
            {!connectorInfo &&
                (documentation === null && !connectorInfo ? (
                    <div className={statementEditorClasses.stmtEditorInnerWrapper}>
                        <p>Please upgrade to the latest Ballerina version</p>
                    </div>
                ) : (
                    <>
                        {documentation && !(documentation.documentation === undefined) ? (
                            <List className={stmtEditorHelperClasses.docParamSuggestions}>
                                {paramDoc && <ParameterList paramDocumentation={paramDoc}/>}
                                {documentation.documentation.description && (
                                    <>
                                        {documentation.documentation.parameters?.length > 0 && (
                                            <hr className={stmtEditorHelperClasses.returnSeparator}/>
                                        )}
                                        <ListSubheader className={stmtEditorHelperClasses.parameterHeader}>
                                            Description
                                        </ListSubheader>
                                        <ListItem className={stmtEditorHelperClasses.docDescription}>
                                            {getDocumentationDescription()}
                                        </ListItem>
                                    </>
                                )}
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
                ))}
            {connectorInfo && connectorInit && (
                <List className={stmtEditorHelperClasses.docParamSuggestions}>
                    {connectorInit.parameters && (<ParameterTree parameters={connectorInit.parameters} />)}
                    {connectorInfo.documentation && (
                        <>
                            {connectorInit.parameters?.length > 0 && (
                                <hr className={stmtEditorHelperClasses.returnSeparator} />
                            )}
                            <ListSubheader className={stmtEditorHelperClasses.parameterHeader}>
                                Description
                            </ListSubheader>
                            <ListItem className={stmtEditorHelperClasses.docDescription}>
                                {connectorInfo.documentation}
                            </ListItem>
                        </>
                    )}
                    {connectorInit.returnType?.documentation && (
                        <>
                            <hr className={stmtEditorHelperClasses.returnSeparator} />
                            <ListSubheader className={stmtEditorHelperClasses.parameterHeader}>Return</ListSubheader>
                            <ListItem className={stmtEditorHelperClasses.returnDescription}>
                                <ListItemText primary={connectorInit.returnType?.documentation} />
                            </ListItem>
                        </>
                    )}
                </List>
            )}
        </>
    );
}
