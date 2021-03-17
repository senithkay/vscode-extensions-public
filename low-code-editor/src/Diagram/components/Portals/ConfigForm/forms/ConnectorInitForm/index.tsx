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
import React, { ReactNode, useContext } from "react";

import { ConnectorConfig, FormField, WizardType } from "../../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../../Contexts/Diagram"
import { Connector, STModification } from "../../../../../../Definitions/lang-client-extended";
import {
    createCheckedPayloadFunctionInvocation,
    createCheckedRemoteServiceCall,
    createImportStatement,
    createObjectDeclaration
} from "../../../../../utils/modification-util";
import { DraftInsertPosition } from "../../../../../view-state/draft";
import { getConnectorComponent, getParams } from "../../../utils";

import { Wizard } from "./Wizard";

// import { getAiSuggestions } from "../../../../../../../../api/ai_client";
// import { AiSuggestionsReq, AiSuggestionsRes } from "../../../../../../../../api/models";

export interface ConnectorInitFormProps {
    connector: Connector;
    typeDef: any;
    targetPosition: DraftInsertPosition;
    wizardType: WizardType;
    fieldsForFunctions: Map<string, FormField[]>;
    config?: ConnectorConfig;
}

export function ConnectorInitForm(props: any) {
    const { onMutate: dispatchMutations } = useContext(DiagramContext).state;
    const {
        connector, typeDef, targetPosition, wizardType, fieldsForFunctions,
        config
    } = props as ConnectorInitFormProps;
    typeDef.viewState = {};
    const isNewConnectorInitWizard: boolean = wizardType === WizardType.NEW;
    const connectorConfig: ConnectorConfig = config ? config : new ConnectorConfig();

    // todo : uncomment after expression editor is fixed
    // React.useEffect(() => {
    //     getAllVariables().then((variables: {[key: string]: any}) => {
    //         let allFormFields: FormField[] = [];
    //         Array.from(fieldsForFunctions.keys()).forEach((key: string) => {
    //             allFormFields = allFormFields.concat(fieldsForFunctions.get(key));
    //         })
    //         const aiSuggestionsReq: AiSuggestionsReq = {
    //             userID: store.getState()?.userInfo?.user?.email,
    //             mapFrom: [variables],
    //             mapTo: [getMapTo(allFormFields, targetPosition)]
    //         };
    //         getAiSuggestions(aiSuggestionsReq).then((res: AiSuggestionsRes) => {
    //             res.suggestedMappings.forEach((schema: string) => {
    //                 const varMap = JSON.parse(schema);
    //                 const varKeys = Object.keys(varMap);
    //                 varKeys.forEach((variable: string) => {
    //                     addAiSuggestion(variable, varMap[variable], allFormFields)
    //                 })
    //             })
    //         });
    //     })
    // });

    const onSave = (/* sourceModifications: STModification[] */) => {

        // insert initialized connector logic
        if (targetPosition) {
            const modifications: STModification[] = [];
            // Add an import.
            const addImport: STModification = createImportStatement(
                connector.org,
                connector.module,
                targetPosition
            );
            modifications.push(addImport);

            // Add an connector client initialization.
            if (!connectorConfig.isExistingConnection) {
                const addConnectorInit: STModification = createObjectDeclaration(
                    (connector.module + ":" + connector.name),
                    connectorConfig.name,
                    getParams(connectorConfig.connectorInit),
                    targetPosition
                );
                modifications.push(addConnectorInit);
            }

            // Add an action invocation on the initialized client.
            const addActionInvocation: STModification = createCheckedRemoteServiceCall(
                "var",
                connectorConfig.action.returnVariableName,
                connectorConfig.name,
                connectorConfig.action.name,
                getParams(connectorConfig.action.fields), targetPosition
            );
            modifications.push(addActionInvocation);

            if (connectorConfig.responsePayloadMap && connectorConfig.responsePayloadMap.isPayloadSelected) {
                const addPayload: STModification = createCheckedPayloadFunctionInvocation(
                    connectorConfig.responsePayloadMap.payloadVariableName,
                    "var",
                    connectorConfig.action.returnVariableName,
                    connectorConfig.responsePayloadMap.payloadTypes.get(connectorConfig.responsePayloadMap.selectedPayloadType),
                    targetPosition
                );
                modifications.push(addPayload);
            }

            dispatchMutations(modifications);
        }
    };

    const connectorComponent: ReactNode = getConnectorComponent(
        connector.module + connector.name, {
        functionDefinitions: fieldsForFunctions,
        connectorConfig,
        onSave,
        connector,
        isNewConnectorInitWizard,
        targetPosition
    }
    );

    return (
        <div>
            {!connectorComponent ? (
                <Wizard
                    actions={fieldsForFunctions}
                    connectorConfig={connectorConfig}
                    onSave={onSave}
                    connector={connector}
                    isNewConnectorInitWizard={isNewConnectorInitWizard}
                    targetPosition={targetPosition}
                />
            ) : connectorComponent}
        </div>
    );
}
