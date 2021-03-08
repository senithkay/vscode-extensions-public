/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { CaptureBindingPattern, LocalVarDecl } from "@ballerina/syntax-tree";
import { FormControl, FormHelperText } from "@material-ui/core";
import classNames from "classnames";

import { ConnectorConfig } from "../../../../../ConfigurationSpec/types";
import { Connector } from "../../../../../Definitions/lang-client-extended";
import { SelectDropdownWithButton } from "../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { matchEndpointToFormField } from "../../../Portals/utils";
import { wizardStyles } from "../../style";

interface SelectConnectionFormProps {
    onSelectExisting?: (value: any) => void;
    onCreateNew?: () => void;
    connectorConfig?: ConnectorConfig;
    connector: Connector;
}

export function SelectConnectionForm(props: SelectConnectionFormProps) {
    const { onCreateNew, connectorConfig, onSelectExisting } = props;
    const classes = useStyles();
    const wizardClasses = wizardStyles();
    const connections: LocalVarDecl[] = connectorConfig.existingConnections;

    const getValues = () => {
        return connections.map((conn) => (conn.typedBindingPattern.bindingPattern as
            CaptureBindingPattern).variableName.value);
    };

    const onSelectConn = (val: any) => {
        const selectedConn = connections.find((conn) =>
            (conn.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value === val);
        connectorConfig.name = val;
        if (selectedConn) {
            matchEndpointToFormField(selectedConn, connectorConfig.connectorInit);
        }
        connectorConfig.isExistingConnection = (val !== undefined);
        onSelectExisting(val);
    };

    return (
        <div>
            <FormControl className={classNames(wizardClasses.configWizardAPIContainerAuto, wizardClasses.bottomRadius)}>
                <div className={classes.fullWidth}>
                    <FormHelperText className={classes.inputLabelForRequired}>Select/Create Connection</FormHelperText>
                    <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
                </div>
                <SelectDropdownWithButton
                    onChange={onSelectConn}
                    customProps={{ values: getValues() }}
                    defaultValue=""
                    onClick={onCreateNew}
                />
            </FormControl>
        </div>
    );
}
