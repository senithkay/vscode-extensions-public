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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React from "react";

import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { CodeAction, TextDocumentEdit, TextEdit } from "vscode-languageserver-protocol";

import { IDataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { LightBulbSVG } from "./LightBulb"
import { useStyles } from "./style"

export interface CodeActionWidgetProps {
    codeActions: CodeAction[];
    context: IDataMapperContext;
}

export function CodeActionWidget(props: CodeActionWidgetProps) {
    const { codeActions, context } = props;
    const classes = useStyles()
    const [listCodeAction, setListCodeAction] = React.useState(false);

    const handleSelect = (e: any) => {
       const action = codeActions[e.currentTarget.value]
       const modifications: STModification[] = [];
       (action.edit?.documentChanges[0] as TextDocumentEdit).edits.forEach((change: TextEdit) => {
           modifications.push({
            type: "INSERT",
            config: {
                "STATEMENT": change.newText,
            },
            endColumn: change.range.end.character,
            endLine: change.range.end.line,
            startColumn: change.range.start.character,
            startLine: change.range.start.line
           })

       })
       context.applyModifications(modifications);
    }

    const menuItems: React.ReactNode[] = [];
    if (codeActions) {
        codeActions.forEach((action, index) => {
            menuItems.push(
                
                <button key={index} className={classes.dropdownButton} value={index} onMouseDown={handleSelect}>
                   <span className={classes.dropdownText}> {action.title} </span>
                </button>
    
            );
        });
    }


	
	const onClickCodeAction= () => {
		//TODO implement the delete link logic
		setListCodeAction(true)
		console.log({"codeActionLog": codeActions});
	};

    return (
        <>
            <div className={classes.lightBulbWrapper} onClick={onClickCodeAction}>
                <LightBulbSVG />
            </div>
        
            {listCodeAction && (
                <div style={{paddingLeft: "5px"}}>               
                    {menuItems}
                </div>
            )}
        </>
    );
}
