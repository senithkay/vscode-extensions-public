import React, { useState } from "react";

import { Checkbox, ListItem, OutlinedInput } from "@material-ui/core";

interface NamedArgIncludedRecordProps {
    isNewRecord: boolean
    value: number
    addIncludedRecordToModel: (userInput: string, value: number) => void
}
// tslint:disable: jsx-no-multiline-js
export function NamedArgIncludedRecord(props: NamedArgIncludedRecordProps){
    const {isNewRecord, value, addIncludedRecordToModel} = props;
    const defaultNamedArg = "NamedArg";
    const [userInput, setUserInput] = useState<string>(defaultNamedArg);


    const inputEnterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            addIncludedRecordToModel(userInput, value);
        }
    };

    const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(event.target.value);
    };

    return (
        <>
            {isNewRecord && (
                <ListItem>
                    <Checkbox style={{ flex: 'inherit' }} checked={true}/>
                    <OutlinedInput placeholder={defaultNamedArg} autoFocus={true} onKeyDown={inputEnterHandler} onInput={inputChangeHandler}/>
                </ListItem>
            )}
        </>
    );
}
