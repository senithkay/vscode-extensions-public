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
import { ListenerConfigFormState } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CheckBoxGroup,
    FormTextInput,
    SelectDropdownWithButton,
    wizardStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { ModulePart, NodePosition, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";

import { StmtDiagnostic } from "../../../models/definitions";
import { FormEditorField } from "../Types";

interface ListenerConfigFormProps {
    listenerList: string[];
    isEdit?: boolean;
    isDisabled?: boolean;
    listenerConfig?: ListenerConfigFormState;
    syntaxDiag?: StmtDiagnostic[];
    portSemDiagMsg: string;
    nameSemDiagMsg: string;
    onChange: (listenerConfig?: ListenerConfigFormState, isPortInteracted?: boolean,
               isNameInteracted?: boolean) => void;
}

export function ListenerConfigForm(props: ListenerConfigFormProps) {
    const formClasses = useFormStyles();
    const { listenerList, isDisabled, isEdit, syntaxDiag, listenerConfig, portSemDiagMsg, nameSemDiagMsg,
            onChange } = props;

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");

    const [listenerName, setListenerName] = useState<FormEditorField>({isInteracted: false, value:
        listenerConfig.listenerName});
    const [listenerPort, setListenerPort] = useState<FormEditorField>({isInteracted: false, value:
        listenerConfig.listenerPort});
    const [createNewListener, setCreateNewListener] = useState(!isEdit);
    const [fromVarRef, setFromVarRef] = useState<boolean>(listenerConfig.fromVar);
    const listenerSelectionCustomProps = {
        disableCreateNew: false, values: listenerList || [],
    }

    const handleListenerDefModeChange = (mode: string[]) => {
        if (listenerList.length === 0) {
            setCreateNewListener(true);
        }
        if (mode.length === 0) {
            setListenerPort({isInteracted: false, value: "9090"});
            setListenerName({isInteracted: false, value: "l"});
            onChange({listenerName: "l", listenerPort: "9090", fromVar: true, createNewListener: true});
        } else {
            setListenerPort({isInteracted: false, value: "9090"});
            onChange({listenerName: "", listenerPort: "9090", fromVar: false, createNewListener: false});
        }
        setCreateNewListener(mode.length === 0);
        setFromVarRef(mode.length === 0);
    }

    const onListenerNameChange = (name: string) => {
        setCurrentComponentName("Listener Name");
        setListenerName({isInteracted: true, value: name});
        onChange({listenerName: name, listenerPort: listenerPort.value, fromVar: fromVarRef,
                  createNewListener}, listenerPort.isInteracted, true);
    }

    const onListenerPortChange = (port: string) => {
        setCurrentComponentName("Listener Port");
        setListenerPort({isInteracted: true, value: port});
        onChange({listenerName: listenerName.value, listenerPort: port, fromVar: fromVarRef,
                  createNewListener}, true, listenerName.isInteracted);
    }

    const onListenerSelect = (name: string) => {
        setCurrentComponentName("Listener Selector");
        if (name === 'Create New') {
            setCreateNewListener(true);
            setListenerPort({isInteracted: false, value: "9090"});
            setListenerName({isInteracted: false, value: "l"});
            onChange({listenerName: "l", listenerPort: "9090", fromVar: false,
                      createNewListener: true});
        } else {
            setCreateNewListener(false);
            setListenerName({isInteracted: true, value: name});
            setListenerPort({isInteracted: false, value: ""});
            onChange({listenerName: name, listenerPort: "", fromVar: false, createNewListener: false});
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
                defaultValue={!createNewListener ? listenerName?.value : (isDisabled || syntaxDiag !== undefined)
                    ? undefined : 'Create New'}
                disabled={isDisabled}
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
                isErrored: listenerName.isInteracted && (syntaxDiag !== undefined &&
                    currentComponentName === "Listener Name" || nameSemDiagMsg !== undefined)
            }}
            errorMessage={(syntaxDiag && currentComponentName === "Listener Name" && syntaxDiag[0].message) ||
                nameSemDiagMsg}
            placeholder={"listener"}
            size="small"
            disabled={(syntaxDiag && currentComponentName !== "Listener Name") || isDisabled}
        />
    );

    const listenerPortInputComponent = (
        <FormTextInput
            label="Port"
            dataTestId="listener-port"
            defaultValue={(listenerPort?.isInteracted) ? listenerPort.value : ""}
            onChange={onListenerPortChange}
            customProps={{
                isErrored: listenerPort.isInteracted && (syntaxDiag !== undefined &&
                    currentComponentName === "Listener Port" || portSemDiagMsg !== undefined)
            }}
            errorMessage={(syntaxDiag && currentComponentName === "Listener Port" && syntaxDiag[0].message) ||
                portSemDiagMsg}
            placeholder={"9090"}
            size="small"
            disabled={(syntaxDiag && currentComponentName !== "Listener Port") || isDisabled}
        />
    );

    return (
        <>
            <CheckBoxGroup
                values={["Define Inline"]}
                defaultValues={fromVarRef ? [] : ['Define Inline']}
                onChange={handleListenerDefModeChange}
                disabled={isDisabled || syntaxDiag !== undefined}
            />
            {fromVarRef && listenerSelector}
            {fromVarRef && createNewListener && [listenerNameInputComponent, listenerPortInputComponent]}
            {!fromVarRef && listenerPortInputComponent}
        </>
    )
}
