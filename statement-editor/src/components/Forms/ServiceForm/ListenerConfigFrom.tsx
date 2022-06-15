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
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { FormHelperText } from "@material-ui/core";
import {
    ExpressionEditorLangClientInterface,
    ListenerConfigFormState, STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CheckBoxGroup,
    FormTextInput, Panel,
    SelectDropdownWithButton,
    wizardStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { StmtDiagnostic } from "../../../models/definitions";
import { FormEditor } from "../../FormEditor/FormEditor";
import { FormEditorField } from "../Types";

interface ListenerConfigFormProps {
    listenerList: string[];
    isEdit?: boolean;
    targetPosition?: NodePosition;
    isDisabled?: boolean;
    listenerConfig?: ListenerConfigFormState;
    syntaxDiag?: StmtDiagnostic[];
    portSemDiagMsg: string;
    activeListener: string;
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
    currentFile: {
        content: string,
        path: string,
        size: number
    };
    onChange: (port: string, name: string, isListenerInteracted: boolean) => void;
    applyModifications: (modifications: STModification[]) => void;
}

export function ListenerConfigForm(props: ListenerConfigFormProps) {
    const formClasses = useFormStyles();
    const { listenerList, applyModifications, isDisabled, isEdit, syntaxDiag, listenerConfig, portSemDiagMsg,
            activeListener, currentFile, getLangClient, targetPosition, onChange } = props;

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");

    const [isAddListenerInProgress, setIsAddListenerInProgress] = useState<boolean>(false);
    const [selectedListener, setSelectedListener] = useState<string>(activeListener ||
        listenerConfig.listenerName);
    const [isInline, setIsInline] = useState<boolean>(!selectedListener);

    const [listenerPort, setListenerPort] = useState<FormEditorField>({isInteracted: isEdit, value:
        listenerConfig.listenerPort});

    const handleListenerDefModeChange = (mode: string[]) => {
        if (listenerList.length === 0 && mode.length === 0) {
            setIsAddListenerInProgress(true);
        } else {
            setListenerPort({isInteracted: false, value: "9090"});
            setSelectedListener("");
            onChange("9090", "", false);
        }
        setIsInline(mode.length > 0);
    }

    const onListenerPortChange = (port: string) => {
        setCurrentComponentName("Listener Port");
        setListenerPort({isInteracted: true, value: port});
        onChange(port, "", true);
    }

    const onListenerFormCancel = () => {
        setIsAddListenerInProgress(false);
        setSelectedListener("");
    }

    const onListenerSelect = (name: string) => {
        setCurrentComponentName("Listener Selector");
        if (name === 'Create New') {
            setSelectedListener("");
            setIsAddListenerInProgress(true);
        } else {
            setSelectedListener(name);
            setIsAddListenerInProgress(false);
            onChange("", name, true);
        }
    }

    useEffect(() => {
        setSelectedListener(activeListener);
    }, [activeListener]);
    useEffect(() => {
        if (listenerConfig.listenerName) {
            setSelectedListener(listenerConfig.listenerName);
        }
    }, [listenerConfig.listenerName]);

    return (
        <>
            <CheckBoxGroup
                values={["Define Inline"]}
                defaultValues={isInline ? ['Define Inline'] : []}
                onChange={handleListenerDefModeChange}
                disabled={isDisabled || syntaxDiag !== undefined}
            />
            {isInline ? (
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
            ) : (
                <>
                    <FormHelperText className={formClasses.inputLabelForRequired}>
                        <FormattedMessage
                            id="lowcode.develop.connectorForms.HTTP.selectlListener"
                            defaultMessage="Select Listener :"
                        />
                    </FormHelperText>
                    <SelectDropdownWithButton
                        customProps={{disableCreateNew: false, values: listenerList || []}}
                        onChange={onListenerSelect}
                        placeholder="Select Property"
                        defaultValue={isAddListenerInProgress ? "" : selectedListener}
                        disabled={isDisabled}
                    />
                    {isAddListenerInProgress && (
                        <Panel onClose={onListenerFormCancel}>
                            <FormEditor
                                initialSource={undefined}
                                initialModel={undefined}
                                targetPosition={targetPosition}
                                onCancel={onListenerFormCancel}
                                type={"Listener"}
                                currentFile={currentFile}
                                getLangClient={getLangClient}
                                topLevelComponent={true}
                                applyModifications={applyModifications}
                            />
                        </Panel>
                    )}
                </>
            )}
        </>
    )
}
