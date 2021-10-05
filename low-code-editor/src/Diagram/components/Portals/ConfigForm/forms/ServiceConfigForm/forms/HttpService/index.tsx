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
// tslint:disable: jsx-no-multiline-js
import React, { useReducer } from "react";
import { FormattedMessage } from "react-intl";

import { ListenerDeclaration, STKindChecker, STNode } from "@ballerina/syntax-tree";
import { FormHelperText } from "@material-ui/core";
import classNames from "classnames";

import { PrimaryButton } from "../../../../../../../../components/Buttons/PrimaryButton";
import { useDiagramContext } from "../../../../../../../../Contexts/Diagram";
import { STModification } from "../../../../../../../../Definitions";
import { isServicePathValid } from "../../../../../../../../utils/validator";
import { createImportStatement, createServiceDeclartion } from "../../../../../../../utils/modification-util";
import { DraftUpdatePosition } from "../../../../../../../view-state/draft";
import { SecondaryButton } from "../../../../Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../../../Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../Elements/TextField/FormTextInput";
import { useStyles as useFormStyles } from "../../../style";

import { ListenerConfigForm } from "./ListenerConfigForm";

interface HttpServiceFormProps {
    model?: STNode;
    targetPosition?: DraftUpdatePosition;
    onCancel: () => void;
    onSave: (modifications: STModification[]) => void;
}

const HTTP_MODULE_QUALIFIER = 'http';
const CREATE_NEW_LISTENER_OPTION = 'Create New'

export interface HTTPServiceConfigState {
    serviceBasePath: string;
    listenerConfig: {
        formVar: boolean,
        listenerName: string,
        listenerPort: string,
    }
    createNewListener: boolean;
}

enum ServiceConfigActionTypes {
    SET_PATH,
    SET_LISTENER_NAME,
    SET_LISTENER_PORT,
    CREATE_NEW_LISTENER,
    SELECT_EXISTING_LISTENER,
    DEFINE_LISTENER_INLINE
}

type ServiceConfigActions =
    { type: ServiceConfigActionTypes.SET_PATH, payload: string }
    | { type: ServiceConfigActionTypes.CREATE_NEW_LISTENER }
    | { type: ServiceConfigActionTypes.SET_LISTENER_NAME, payload: string }
    | { type: ServiceConfigActionTypes.SET_LISTENER_PORT, payload: string }
    | { type: ServiceConfigActionTypes.SELECT_EXISTING_LISTENER, payload: string }
    | { type: ServiceConfigActionTypes.DEFINE_LISTENER_INLINE, payload: boolean }


function serviceConfigReducer(state: HTTPServiceConfigState, action: ServiceConfigActions): HTTPServiceConfigState {
    switch (action.type) {
        case ServiceConfigActionTypes.SET_PATH:
            return { ...state, serviceBasePath: action.payload };
        case ServiceConfigActionTypes.SET_LISTENER_NAME:
            return { ...state, listenerConfig: { ...state.listenerConfig, listenerName: action.payload } };
        case ServiceConfigActionTypes.SET_LISTENER_PORT:
            return { ...state, listenerConfig: { ...state.listenerConfig, listenerPort: action.payload } };
        case ServiceConfigActionTypes.CREATE_NEW_LISTENER:
            return {
                ...state,
                createNewListener: true,
                listenerConfig: { formVar: false, listenerName: '', listenerPort: '' }
            };
        case ServiceConfigActionTypes.SELECT_EXISTING_LISTENER:
            return {
                ...state,
                createNewListener: false,
                listenerConfig: { formVar: true, listenerName: action.payload, listenerPort: '' }
            };
        case ServiceConfigActionTypes.DEFINE_LISTENER_INLINE:
            return { ...state, listenerConfig: { ...state.listenerConfig, formVar: action.payload } };
        default:
            return state;
    }
}

const defaultState: HTTPServiceConfigState = {
    serviceBasePath: '',
    createNewListener: false,
    listenerConfig: {
        formVar: false,
        listenerName: '',
        listenerPort: ''
    }
}

export function HttpServiceForm(props: HttpServiceFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onCancel, onSave } = props;
    const { props: { stSymbolInfo } } = useDiagramContext();
    const [state, dispatch] = useReducer(serviceConfigReducer, defaultState);


    const listenerList = Array.from(stSymbolInfo.listeners)
        .filter(([key, value]) =>
            STKindChecker.isQualifiedNameReference((value as ListenerDeclaration).typeDescriptor)
            && (value as ListenerDeclaration).typeDescriptor.modulePrefix.value === HTTP_MODULE_QUALIFIER)
        .map(([key, value]) => key);

    const listenerSelectionCustomProps = {
        disableCreateNew: false, values: listenerList || [],
    }

    React.useEffect(() => {
        if (listenerList.length === 0) {
            dispatch({ type: ServiceConfigActionTypes.CREATE_NEW_LISTENER });
        }
    }, []);

    const onListenerSelect = (listenerName: string) => {
        if (listenerName === 'Create New') {
            dispatch({ type: ServiceConfigActionTypes.CREATE_NEW_LISTENER });
        } else {
            dispatch({ type: ServiceConfigActionTypes.SELECT_EXISTING_LISTENER, payload: listenerName });
        }
    }

    const onBasePathChange = (path: string) => {
        dispatch({ type: ServiceConfigActionTypes.SET_PATH, payload: path })
    }

    const handleListenerDefModeChange = (mode: string[]) => {
        dispatch({ type: ServiceConfigActionTypes.DEFINE_LISTENER_INLINE, payload: mode.length === 0 })
    }

    const onListenerNameChange = (listenerName: string) => {
        dispatch({ type: ServiceConfigActionTypes.SET_LISTENER_NAME, payload: listenerName })
    }

    const onListenerPortChange = (listenerPort: string) => {
        dispatch({ type: ServiceConfigActionTypes.SET_LISTENER_PORT, payload: listenerPort })
    }

    const handleOnSave = () => {

        onSave([
            createImportStatement('ballerina', 'http', { column: 0, line: 0 }),
            createServiceDeclartion(state, targetPosition)
        ]);
        onCancel();
    }

    const listenerConfigForm = (
        <div className={classNames(formClasses.groupedForm, formClasses.marginTB)}>
            <ListenerConfigForm
                isDefinedInline={!state.listenerConfig.formVar}
                onDefinitionModeChange={handleListenerDefModeChange}
                onNameChange={onListenerNameChange}
                onPortChange={onListenerPortChange}
            />
        </div>
    );

    const saveBtnDisabled = isServiceConfigValid(state);

    return (
        <>
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    {
                        listenerList.length > 0 ?
                            (
                                <FormattedMessage
                                    id="lowcode.develop.connectorForms.HTTP.selectlListener"
                                    defaultMessage="Select Listener :"
                                />
                            )
                            : (
                                <FormattedMessage
                                    id="lowcode.develop.connectorForms.HTTP.configureNewListener"
                                    defaultMessage="Configure Listener :"
                                />
                            )
                    }
                </FormHelperText>
                <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
            </div>
            {listenerList.length > 0 && (
                <SelectDropdownWithButton
                    customProps={listenerSelectionCustomProps}
                    onChange={onListenerSelect}
                    placeholder="Select Property"
                    defaultValue={!state.createNewListener ? state.listenerConfig.listenerName : 'Create New'}
                />
            )}
            {state.createNewListener && listenerConfigForm}
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    <FormattedMessage
                        id="lowcode.develop.connectorForms.HTTP.typeServiceBasePath"
                        defaultMessage="Service Base Path :"
                    />
                </FormHelperText>
            </div>
            <FormTextInput
                dataTestId="service-base-path"
                defaultValue={state.serviceBasePath}
                onChange={onBasePathChange}
                customProps={{
                    validate: isServicePathValid,
                    startAdornment: '/'
                }}
            />
            <div className={formClasses.wizardBtnHolder}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={onCancel}
                />
                <PrimaryButton
                    text="Save"
                    disabled={!saveBtnDisabled}
                    fullWidth={false}
                    onClick={handleOnSave}
                />
            </div>
        </>
    )
}

function isServiceConfigValid(config: HTTPServiceConfigState): boolean {
    const { createNewListener, serviceBasePath, listenerConfig: { formVar: fromVar, listenerName, listenerPort } } = config;

    const servicePathValidity = serviceBasePath.length === 0 || isServicePathValid(serviceBasePath);
    const portNumberRegex = /^\d+$/;
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    if (createNewListener && fromVar) {
        return servicePathValidity
            && listenerPort.length > 0 && portNumberRegex.test(listenerPort)
            && listenerName.length > 0 && nameRegex.test(listenerName);
    } else if (createNewListener && !fromVar) {
        return servicePathValidity
            && listenerPort.length > 0 && portNumberRegex.test(listenerPort)
    } else {
        return serviceBasePath && listenerName.length > 0;
    }
}
