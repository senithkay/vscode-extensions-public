// tslint:disable: jsx-no-multiline-js
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
import React from 'react';

import { BallerinaConnectorInfo, ConnectorWizardType } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { ModuleVarDecl, NodePosition, STKindChecker } from '@wso2-enterprise/syntax-tree';

import { ConnectorConfigWizard } from '../../ConnectorConfigWizard';
import { ConfigurableForm } from '../ConfigurableForm';
import { ConnectorWizard } from '../ConnectorWizard';

import { ModuleVariableForm } from './ModuleVariableForm';

interface ModuleDeclFormProps {
    model?: ModuleVarDecl;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    formType: string;
}

export function ModuleDeclForm(props: ModuleDeclFormProps) {
    const { model, targetPosition, onCancel, onSave } = props;

    const isConfigurable = model && model.qualifiers.length > 0
        && model.qualifiers.filter(qualifier => STKindChecker.isConfigurableKeyword(qualifier)).length > 0;

    let isModuleConnector = false;
    let connector: BallerinaConnectorInfo;

    if (model && STKindChecker.isModuleVarDecl(model) && model.typeData.isEndpoint) {
        isModuleConnector = true;
        if (STKindChecker.isQualifiedNameReference(model.typedBindingPattern.typeDescriptor)){
            const typeSymbol = model.typedBindingPattern.typeDescriptor?.typeData.typeSymbol;
            connector = {
                name: typeSymbol.name,
                moduleName: typeSymbol.moduleID.moduleName,
                functions: [],
                package: {
                    name: typeSymbol.moduleID.moduleName,
                    organization: typeSymbol.moduleID.orgName,
                    version: typeSymbol.moduleID.version,
                }
            }
        }
    }

    return (
        <>
            {isConfigurable && !isModuleConnector && <ConfigurableForm {...props} />}
            {!isConfigurable && !isModuleConnector && <ModuleVariableForm {...props} />}
            {!isConfigurable && isModuleConnector && (
                <ConnectorWizard
                    wizardType={ConnectorWizardType.ENDPOINT}
                    diagramPosition={{ x: 0, y: 0 }}
                    targetPosition={
                        model
                            ? targetPosition
                            : { startLine: targetPosition.startLine, startColumn: targetPosition.startColumn }
                    }
                    connectorInfo={connector}
                    model={model}
                    onClose={onCancel}
                    onSave={onSave}
                    isModuleType={true}
                />
            )}
        </>
    );
}
