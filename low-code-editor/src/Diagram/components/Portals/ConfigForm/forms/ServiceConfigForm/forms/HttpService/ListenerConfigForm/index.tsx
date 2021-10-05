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
import React from "react";
import { FormattedMessage } from "react-intl";

import { FormHelperText } from "@material-ui/core";

import CheckBoxGroup from "../../../../../Elements/CheckBox";
import { FormTextInput } from "../../../../../Elements/TextField/FormTextInput";
import { useStyles as useFormStyles } from "../../../../style";

interface ListenerConfigFormProps {
    isDefinedInline: boolean
    onDefinitionModeChange: (mode: string[]) => void;
    onNameChange: (name: string) => void;
    onPortChange: (name: string) => void;
    // updateListenerDefinitionMode: (mode: string) => void;
}

export function ListenerConfigForm(props: ListenerConfigFormProps) {
    const formClasses = useFormStyles();
    const { isDefinedInline, onDefinitionModeChange, onNameChange, onPortChange } = props;

    return (
        <>
            <CheckBoxGroup
                values={["Define Inline"]}
                defaultValues={isDefinedInline ? ["Define Inline"] : []}
                onChange={onDefinitionModeChange}
            />
            {
                !isDefinedInline && (
                    <>
                        <div className={formClasses.labelWrapper}>
                            <FormHelperText className={formClasses.inputLabelForRequired}>
                                <FormattedMessage
                                    id="lowcode.develop.connectorForms.HTTP.listenerName"
                                    defaultMessage="Listener Name :"
                                />
                            </FormHelperText>
                        </div>
                        <FormTextInput
                            dataTestId="service-base-path"
                            onChange={onNameChange}
                            customProps={{
                            }}
                        />
                    </>
                )
            }
            <div className={formClasses.labelWrapper}>
                <FormHelperText className={formClasses.inputLabelForRequired}>
                    <FormattedMessage
                        id="lowcode.develop.connectorForms.HTTP.listenerPortNumber"
                        defaultMessage="Listener Port :"
                    />
                </FormHelperText>
            </div>
            <FormTextInput
                dataTestId="service-base-path"
                // defaultValue={serviceBasePath}
                onChange={onNameChange}
                customProps={{
                    // validate: isServicePathValid,
                    // isErrored: resProps.isPathDuplicated || duplicatedPathsInEdit,
                    // startAdornment: '/'
                }}
            // errorMessage={resProps.isPathDuplicated || duplicatedPathsInEdit ? pathDuplicateErrorMessage : isValidPath ? "" : pathErrorMessage}
            // placeholder={pathPlaceholder}
            />

        </>
    )
}
