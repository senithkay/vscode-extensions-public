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
import React from "react";
import { FormattedMessage } from "react-intl";

import { FormHelperText } from "@material-ui/core";
import {
    CheckBoxGroup,
    FormTextInput,
    SelectDropdownWithButton,
    wizardStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

// import CheckBoxGroup from "../../../../../FormFieldComponents/CheckBox";
// import { SelectDropdownWithButton } from "../../../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
// import { VariableNameInput } from "../../../../Components/VariableNameInput";
// import { wizardStyles as useFormStyles } from "../../../../style";


interface ListenerConfigFormProps {
    // configState: ListenerConfigFormState
    // actionDispatch: (action: ServiceConfigActions) => void;
    listenerList: string[];
    targetPosition: NodePosition;
}

// FixMe: show validation messages to listenerName and listenerPort
export function ListenerConfigForm(props: ListenerConfigFormProps) {
    const formClasses = useFormStyles();
    const { listenerList, targetPosition } = props;

    const listenerSelectionCustomProps = {
        disableCreateNew: false, values: listenerList || [],
    }

    const handleListenerDefModeChange = (mode: string[]) => {
        // if (listenerList.length === 0) {
        //     actionDispatch({ type: ServiceConfigActionTypes.CREATE_NEW_LISTENER });
        // }
        // actionDispatch({ type: ServiceConfigActionTypes.DEFINE_LISTENER_INLINE, payload: mode.length === 0 })
    }

    const onListenerNameChange = (listenerName: string) => {
        // actionDispatch({ type: ServiceConfigActionTypes.SET_LISTENER_NAME, payload: listenerName })
    }

    const onListenerPortChange = (listenerPort: string) => {
        // actionDispatch({ type: ServiceConfigActionTypes.SET_LISTENER_PORT, payload: listenerPort })
    }

    const onListenerSelect = (listenerName: string) => {
        // if (listenerName === 'Create New') {
        //     actionDispatch({ type: ServiceConfigActionTypes.CREATE_NEW_LISTENER });
        // } else {
        //     actionDispatch({ type: ServiceConfigActionTypes.SELECT_EXISTING_LISTENER, payload: listenerName });
        // }
    }

    const validateField = (fieldName: string, isInvalidFromField: boolean) => {
        // actionDispatch({ type: ServiceConfigActionTypes.UPDATE_INVALID_CONFIG_STATUS, payload: isInvalidFromField });
    }

    const listenerSelector = (
        <>
            <FormHelperText className={formClasses.inputLabelForRequired}>
                <FormattedMessage
                    id="lowcode.develop.connectorForms.HTTP.selectlListener"
                    defaultMessage="Select Listener :"
                />
            </FormHelperText>
            <SelectDropdownWithButton
                customProps={listenerSelectionCustomProps}
                onChange={onListenerSelect}
                placeholder="Select Property"
                // defaultValue={!state.createNewListener ? state.listenerName : 'Create New'}
            />
        </>
    );

    // const listenerNameInputComponent = (
    //     <VariableNameInput
    //         displayName="Listener Name"
    //         isEdit={false}
    //         onValueChange={onListenerNameChange}
    //         validateExpression={validateField}
    //         position={{
    //             startLine: targetPosition.startLine,
    //             endLine: targetPosition.startLine,
    //             startColumn: 0,
    //             endColumn: 0
    //         }}
    //         // value={state.listenerName}
    //     />
    // )

    const listenerPortInputComponent = (<div/>)

    return (
        <>
            <CheckBoxGroup
                values={["Define Inline"]}
                defaultValues={['Define Inline']}
                onChange={handleListenerDefModeChange}
            />
            {listenerSelector}
            {/*{state.fromVar && state.createNewListener && [listenerNameInputComponent, listenerPortInputComponent]}*/}
            {/*{!state.fromVar && listenerPortInputComponent}*/}
        </>
    )
}
