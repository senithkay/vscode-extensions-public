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

import { ListenerDeclaration, ServiceDeclaration, STKindChecker, STNode } from "@ballerina/syntax-tree";
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
import { getFormStateFromST, isServiceConfigValid } from "./util";
import { HTTPServiceConfigState, ServiceConfigActionTypes, serviceConfigReducer } from "./util/reducer";

interface HttpServiceFormProps {
    model?: ServiceDeclaration;
    targetPosition?: DraftUpdatePosition;
    onCancel: () => void;
    onSave: () => void;
}

const HTTP_MODULE_QUALIFIER = 'http';

export function HttpServiceForm(props: HttpServiceFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onCancel, onSave } = props;
    const { props: { stSymbolInfo }, api: { code: { modifyDiagram } } } = useDiagramContext();
    const [state, dispatch] = useReducer(serviceConfigReducer, getFormStateFromST(model, stSymbolInfo));

    const listenerList = Array.from(stSymbolInfo.listeners)
        .filter(([key, value]) =>
            STKindChecker.isQualifiedNameReference((value as ListenerDeclaration).typeDescriptor)
            && (value as ListenerDeclaration).typeDescriptor.modulePrefix.value === HTTP_MODULE_QUALIFIER)
        .map(([key, value]) => key);


    React.useEffect(() => {
        if (listenerList.length === 0) {
            dispatch({ type: ServiceConfigActionTypes.CREATE_NEW_LISTENER });
        }
    }, []);

    const onBasePathChange = (path: string) => {
        dispatch({ type: ServiceConfigActionTypes.SET_PATH, payload: path })
    }

    const handleOnSave = () => {
        modifyDiagram([
            createImportStatement('ballerina', 'http', { column: 0, line: 0 }),
            createServiceDeclartion(state, targetPosition)
        ]);
        onSave();
    }

    const saveBtnDisabled = isServiceConfigValid(state);

    return (
        <>
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    <FormattedMessage
                        id="lowcode.develop.connectorForms.HTTP.configureNewListener"
                        defaultMessage="Configure Listener :"
                    />
                </FormHelperText>
                <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
            </div>
            <div className={classNames(formClasses.groupedForm, formClasses.marginTB)}>
                <ListenerConfigForm
                    configState={state.listenerConfig}
                    actionDispatch={dispatch}
                    listenerList={listenerList}
                />
            </div>
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
