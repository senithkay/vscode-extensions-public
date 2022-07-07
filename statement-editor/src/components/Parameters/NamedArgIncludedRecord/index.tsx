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
import React, { useState } from "react";

import { Checkbox, ListItem, OutlinedInput } from "@material-ui/core";

import { useStmtEditorHelperPanelStyles } from "../../styles";

interface NamedArgIncludedRecordProps {
    isNewRecord: boolean
    addIncludedRecordToModel: (userInput: string) => void
}
// tslint:disable: jsx-no-multiline-js
export function NamedArgIncludedRecord(props: NamedArgIncludedRecordProps){
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const {isNewRecord, addIncludedRecordToModel} = props;
    const defaultNamedArg = "NamedArg";
    const [userInput, setUserInput] = useState<string>(defaultNamedArg);


    const inputEnterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            addIncludedRecordToModel(userInput);
        }
    };

    const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(event.target.value);
    };

    return (
        <>
            {isNewRecord && (
                <ListItem className={stmtEditorHelperClasses.docListDefault}>
                    <Checkbox
                        classes={{
                            root : stmtEditorHelperClasses.disabledCheckbox,
                            checked : stmtEditorHelperClasses.checked
                        }}
                        checked={true}
                    />
                    <OutlinedInput
                        placeholder={defaultNamedArg}
                        autoFocus={true}
                        onKeyDown={inputEnterHandler}
                        onInput={inputChangeHandler}
                        inputProps={{ style: { padding: '8px'} }}
                    />
                </ListItem>
            )}
        </>
    );
}
