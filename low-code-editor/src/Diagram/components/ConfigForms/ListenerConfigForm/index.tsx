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
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { STKindChecker, STNode } from "@ballerina/syntax-tree";
import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";

import { ListenerFormIcon } from "../../../../assets/icons";
import { PrimaryButton } from "../../../../components/Buttons/PrimaryButton";
import { STModification } from "../../../../Definitions";
import { createImportStatement, createListenerDeclartion } from "../../../utils/modification-util";
import { DraftUpdatePosition } from "../../../view-state/draft";
import { SecondaryButton } from "../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../Portals/ConfigForm/Elements/TextField/FormTextInput";

import { useStyles } from "./style";
import { isListenerConfigValid } from "./util";
import { ListenerConfig } from "./util/types";

interface ListenerConfigFormProps {
    model?: STNode;
    targetPosition?: DraftUpdatePosition;
    onCancel: () => void;
    onSave: (modifications: STModification[]) => void;
}

let defaultState: ListenerConfig = {
    listenerName: '',
    listenerPort: '',
    listenerType: 'http'
}

// FixMe: show validation messages to listenerName and listenerPort
export function ListenerConfigForm(props: ListenerConfigFormProps) {
    const formClasses = useStyles();
    const { model, targetPosition, onCancel, onSave } = props;

    if (STKindChecker.isListenerDeclaration(model)) {
        defaultState = {
            listenerName: model.variableName.value,
            listenerPort: model.initializer.parenthesizedArgList.arguments[0].source,
            listenerType: model.typeDescriptor.modulePrefix.value.toUpperCase()
        };
    }

    const [config, setCofig] = useState(defaultState);
    const saveBtnEnabled = isListenerConfigValid(config);

    const onListenerNameChange = (listenerName: string) => {
        setCofig({
            listenerName,
            listenerPort: config.listenerPort,
            listenerType: config.listenerType
        });
    }

    const onListenerPortChange = (listenerPort: string) => {
        setCofig({
            listenerName: config.listenerName,
            listenerPort,
            listenerType: config.listenerType
        });
    }

    const handleOnSave = () => {
        onSave([
            createImportStatement('ballerina', 'http', { column: 0, line: 0 }),
            createListenerDeclartion(config, targetPosition)
        ]);
    }

    return (
        <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <ListenerFormIcon />
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2} paddingLeft={15}>Listener</Box>
                    </Typography>
                </div>
            </div>

            <div className={formClasses.formWrapper}>
                <>
                    <div className={formClasses.labelWrapper}>
                        <FormHelperText className={formClasses.inputLabelForRequired}>
                            <FormattedMessage
                                id="lowcode.develop.connectorForms.HTTP.listenerType"
                                defaultMessage="Listener Type :"
                            />
                        </FormHelperText>
                    </div>
                    <SelectDropdownWithButton
                        customProps={{values: ['HTTP'], disableCreateNew: true }}
                        defaultValue={config.listenerType}
                        placeholder="Select Type"
                    />
                    <div className={formClasses.labelWrapper}>
                        <FormHelperText className={formClasses.inputLabelForRequired}>
                            <FormattedMessage
                                id="lowcode.develop.connectorForms.HTTP.listenerName"
                                defaultMessage="Listener Name :"
                            />
                        </FormHelperText>
                    </div>
                    <FormTextInput
                        dataTestId="listener-name"
                        defaultValue={config.listenerName}
                        onChange={onListenerNameChange}
                    />
                    <div className={formClasses.labelWrapper}>
                        <FormHelperText className={formClasses.inputLabelForRequired}>
                            <FormattedMessage
                                id="lowcode.develop.connectorForms.HTTP.listenerPortNumber"
                                defaultMessage="Listener Port :"
                            />
                        </FormHelperText>
                    </div>
                    <FormTextInput
                        dataTestId="listener-port"
                        defaultValue={config.listenerPort}
                        onChange={onListenerPortChange}
                    />
                </>
            </div>
            <div className={formClasses.wizardBtnHolder}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={onCancel}
                />
                <PrimaryButton
                    text="Save"
                    disabled={!saveBtnEnabled}
                    fullWidth={false}
                    onClick={handleOnSave}
                />
            </div>
        </FormControl>
    )
}
