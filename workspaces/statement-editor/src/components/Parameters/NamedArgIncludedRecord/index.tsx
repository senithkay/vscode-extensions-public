/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
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
                <ListItem className={stmtEditorHelperClasses.docListDefault} data-testid="named-arg">
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
                        data-testid="named-arg-input"
                    />
                </ListItem>
            )}
        </>
    );
}
