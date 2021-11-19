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
// tslint:disable: no-empty jsx-no-multiline-js
import React, { useState } from 'react';

export interface InputEditorCtx {
    userInput: string,
    onSelection: (value: string) => void
}

export const InputEditorContext = React.createContext<InputEditorCtx>({
    userInput: "",
    onSelection: (value: string) => {}
});

export const InputEditorContextProvider: React.FC = (props) => {
    const [userInput, setUserInput] = useState("");

    const variableHandler = (value: string) => {
        setUserInput(value);
    };

    return (
        <InputEditorContext.Provider
            value={{
                userInput,
                onSelection: variableHandler
            }}
        >
            {props.children}
        </InputEditorContext.Provider>
    );
};
