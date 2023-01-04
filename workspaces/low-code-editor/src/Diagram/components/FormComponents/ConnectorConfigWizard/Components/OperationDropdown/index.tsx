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
import React, {useContext} from 'react';
import { useIntl } from 'react-intl';

import { Connector, ConnectorConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import classNames from 'classnames';

import {Context} from "../../../../../../Contexts/Diagram";
import { FormAutocomplete } from '../../../FormFieldComponents/Autocomplete';
import { wizardStyles } from "../../style";
import { ConnectorOperation } from '../ConnectorForm';

export interface OperationDropdownProps {
    operations: ConnectorOperation[];
    showConnectionName: boolean;
    connectionDetails: ConnectorConfig;
    onOperationSelect: (operation: string) => void;
}

export function OperationDropdown(props: OperationDropdownProps) {
    const { operations, showConnectionName, onOperationSelect, connectionDetails } = props;
    const classes = wizardStyles();
    const intl = useIntl();
    const { props: { stSymbolInfo },
            api: {
                helpPanel: {
                    openConnectorHelp
                }
            }
    } = useContext(Context);

    const handleSelect = (event: object, value: any, reason: string) => {
        onOperationSelect(value.name);
        const connector = (stSymbolInfo.localEndpoints.get(connectionDetails.name)?.typeData?.typeSymbol?.moduleID) as Connector;
        const name = stSymbolInfo.localEndpoints.get(connectionDetails.name)?.typeData?.typeSymbol?.name;
        if (connector && connector.package){
            const {moduleName, package: {version, organization}} = connector;
            openConnectorHelp({moduleName, package: {name: value.name, version, organization}, name}, value.name);
        }
    };

    const operationDropdownPlaceholder = intl.formatMessage({
        id: "lowcode.develop.connectorForms.operationDropdown.placeholder",
        defaultMessage: "Search operation"
    });

    const sortedOperations = () => {
        const sortedList = operations.sort((a, b) => (a.label > b.label) ? 1 : -1);
        return sortedList;
    }

    const renderOperation = (operation: ConnectorOperation) => {
        return operation.label || operation.name ;
    }

    return (
        <div>
            <div className={classNames(classes.configWizardAPIContainerAuto, classes.bottomRadius)}>
                <div className={classes.fullWidth}>
                    <p className={classes.subTitle}>Operation<span className={classes.titleLabelRequired}>*</span></p>
                    <FormAutocomplete
                        placeholder={operationDropdownPlaceholder}
                        itemList={sortedOperations()}
                        getItemLabel={renderOperation}
                        onChange={handleSelect}
                        dataTestId="operation-list"
                    />
                </div>
            </div>
        </div>
    );
}
