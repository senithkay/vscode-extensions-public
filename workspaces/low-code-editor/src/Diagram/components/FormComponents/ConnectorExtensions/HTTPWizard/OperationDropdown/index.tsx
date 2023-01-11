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
import React from 'react';


import classNames from 'classnames';

import { wizardStyles } from "../../../ConnectorConfigWizard/style";
import { FormAutocomplete } from '../../../FormFieldComponents/Autocomplete';

export interface OperationDropdownProps {
    operations: string[];
    onOperationSelect: (operation: string) => void;
    selectedValue?: string;
}

export function OperationDropdown(props: OperationDropdownProps) {
    const { operations, selectedValue, onOperationSelect } = props;
    const classes = wizardStyles();

    const handleSelect = (event: object, value: any, reason: string) => {
        onOperationSelect(value);
    };

    return (
        <div>
            <div className={classNames(classes.configWizardAPIContainerAuto, classes.bottomRadius)}>
                <div className={classes.fullWidth}>
                    <p className={classes.subTitle}>Operation</p>
                    <FormAutocomplete
                        placeholder="Search Operation"
                        itemList={operations}
                        value={selectedValue}
                        onChange={handleSelect}
                    />
                </div>
            </div>
        </div>
    );
}
