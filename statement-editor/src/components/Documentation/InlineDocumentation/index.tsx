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
import React, { useContext } from "react";

import { List, ListItem, ListItemText } from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getDocDescription, isDescriptionWithExample } from "../../../utils";
import { useStatementEditorStyles } from "../../styles";

export interface InlineDocumentationProps {
    documentationHandler: () => void
}

export function InlineDocumentation(props: InlineDocumentationProps) {
    const { documentationHandler } = props;
    const {
        documentation: {
            documentation
        },
    } = useContext(StatementEditorContext);
    const statementEditorClasses = useStatementEditorStyles();

    const documentationDescription = () : string => {
        const doc = documentation.documentation.description;
        return isDescriptionWithExample(doc) ? getDocDescription(doc)[0] : doc;
    }

    return (
        <>
            {documentation === null && (
                <div className={statementEditorClasses.inlineDocumentation}>
                    <List className={statementEditorClasses.inlineDocList}>
                        <ListItem>
                            <ListItemText primary={"Please upgrade to the latest Ballerina version"}/>
                        </ListItem>
                    </List>
                </div>
            )}
            {documentation && !!documentation.documentation?.description && (
                <div className={statementEditorClasses.inlineDocumentation}>
                    <List className={statementEditorClasses.inlineDocList}>
                        <ListItem>
                            <ListItemText primary={documentationDescription()}/>
                            <ExpandMore onClick={documentationHandler}/>
                        </ListItem>
                    </List>
                </div>
            )}
        </>
    );
}
