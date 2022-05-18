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
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { FormHelperText } from "@material-ui/core";
import {
    CheckBoxGroup,
    FormTextInput,
    SelectDropdownWithButton,
    wizardStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";

import { FormEditorField } from "../Types";
import { getListenerConfig } from "../Utils/FormUtils";

export interface ListenerConfig {
    listenerName?: string;
    listenerPort?: string;
    fromRef?: boolean;
}

interface ListenerConfigFormProps {
    model?: ServiceDeclaration;
    listenerList: string[];
    targetPosition: NodePosition;
    isEdit?: boolean;
}

export function ListenerConfigForm(props: ListenerConfigFormProps) {
    const formClasses = useFormStyles();
    const { listenerList, model, targetPosition, isEdit } = props;

    const listenerConfig = getListenerConfig(model, isEdit);
    const [listenerName, setListenerName] = useState<FormEditorField>({isInteracted: false, value:
        listenerConfig.listenerName});
    const [listenerPort, setListenerPort] = useState<FormEditorField>({isInteracted: false, value:
        listenerConfig.listenerPort});
    const [createNewListener, setCreateNewListener] = useState(false);
    const [fromVarRef, setFromVarRef] = useState<boolean>(listenerConfig.fromRef);
    const listenerSelectionCustomProps = {
        disableCreateNew: false, values: listenerList || [],
    }

    const handleListenerDefModeChange = (mode: string[]) => {
        if (listenerList.length === 0) {
            setCreateNewListener(true);
        }
        setFromVarRef(mode.length === 0)
    }

    const onListenerNameChange = (name: string) => {
        setListenerName({isInteracted: true, value: name});
    }

    const onListenerPortChange = (port: string) => {
        setListenerPort({isInteracted: true, value: port});
    }

    const onListenerSelect = (name: string) => {
        if (name === 'Create New') {
            setCreateNewListener(true);
        } else {
            setCreateNewListener(false);
            setListenerName({isInteracted: true, value: name});
        }
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
                defaultValue={!createNewListener  ? listenerName?.value : 'Create New'}
            />
        </>
    );

    const listenerNameInputComponent = (
        <FormTextInput
            label="Name"
            dataTestId="listener-name"
            defaultValue={(listenerName?.isInteracted) ? listenerName.value : ""}
            onChange={onListenerNameChange}
            customProps={{
                isErrored: false
            }}
            errorMessage={""}
            onBlur={null}
            // onFocus={onNameFocus}
            placeholder={"listener"}
            size="small"
            // disabled={addingNewParam || (currentComponentSyntaxDiag && currentComponentName !== "Name")}
        />
    );

    const listenerPortInputComponent = (
        <FormTextInput
            label="Port"
            dataTestId="listener-port"
            defaultValue={(listenerPort?.isInteracted) ? listenerPort.value : ""}
            onChange={onListenerPortChange}
            customProps={{
                isErrored: false
            }}
            errorMessage={""}
            onBlur={null}
            // onFocus={onNameFocus}
            placeholder={"9090"}
            size="small"
            // disabled={addingNewParam || (currentComponentSyntaxDiag && currentComponentName !== "Name")}
        />
    );

    React.useEffect(() => {
        // Identify initial edit
        if (listenerList.length === 0 && !isEdit) {
            setCreateNewListener(true);
        }
    }, []);

    return (
        <>
            <CheckBoxGroup
                values={["Define Inline"]}
                defaultValues={fromVarRef ? [] : ['Define Inline']}
                onChange={handleListenerDefModeChange}
            />
            {fromVarRef && listenerSelector}
            {fromVarRef && createNewListener && [listenerNameInputComponent, listenerPortInputComponent]}
            {!fromVarRef && listenerPortInputComponent}
        </>
    )
}
