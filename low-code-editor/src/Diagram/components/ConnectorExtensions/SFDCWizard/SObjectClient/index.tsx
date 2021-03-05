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
import React, { useContext, useState } from "react";

import Step from "@material-ui/core/Step";
import StepConnector from "@material-ui/core/StepConnector";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";

import { ConnectorConfig, FormField } from "../../../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../../../Contexts/Diagram";
import { Connector, STModification } from "../../../../../Definitions/lang-client-extended";
import { getAllVariables } from "../../../../utils/mixins";
import {
    createCheckedRemoteServiceCall,
    createImportStatement, createObjectDeclaration,
    createRemoteServiceCall
} from "../../../../utils/modification-util";
import { DraftInsertPosition } from "../../../../view-state/draft";
import { SelectConnectionForm } from "../../../ConnectorConfigWizard/Components/SelectExistingConnection";
import { genVariableName, getParams } from "../../../Portals/utils";
import { useStyles } from "../styles";

import { CreateConnectorForm } from "./CreateConnectorForm";
import { SelectInputOutputForm } from "./SelectInputOutputForm";

interface WizardProps {
    actions: Map<string, FormField[]>;
    connectorConfig: ConnectorConfig;
    onSave: (sourceModifications: STModification[]) => void;
    connector: Connector;
    isNewConnectorInitWizard: boolean;
    targetPosition: DraftInsertPosition;
}

enum InitFormState {
    Home = -1,
    Create,
    SelectInputOutput
}

const QontoConnector = withStyles({
    alternativeLabel: {
        top: 5,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    line: {
        borderColor: '#fff',
        borderTopWidth: 0,
        borderRadius: 0,
        borderLeftWidth: 20,
    },
})(StepConnector);

function QontoStepIcon(props: { active: boolean; completed: boolean; }) {
    const { active, completed } = props;

    return (
        <div
            className={clsx("step-wrapper", { ["step-active"]: active })}
        >
            {completed ? <div className="completed-step" /> : <div className="current-step" />}
        </div>
    );
}

export function SObjectClient(props: WizardProps) {
    const { state: { stSymbolInfo } } = useContext(DiagramContext);

    const classes = useStyles();
    const { actions, connectorConfig, connector, onSave, isNewConnectorInitWizard, targetPosition } = props;
    const connectorInitFormFields: FormField[] = actions.get("init") ? actions.get("init") : actions.get("__init");

    const enableHomePage = connectorConfig.existingConnections !== undefined && isNewConnectorInitWizard;
    const initFormState = enableHomePage ? InitFormState.Home : InitFormState.Create;
    connectorConfig.connectorInit = connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit : connectorInitFormFields;
    const [formState, setFormState] = useState<InitFormState>(initFormState);

    const handleCreateNew = () => {
        connectorConfig.isNewConnector = true;
        setFormState(InitFormState.Create);
    };

    const handleSelectExisting = (val: any) => {
        connectorConfig.isNewConnector = (val === undefined);
        setFormState(InitFormState.Create);
    };

    const handleInputOutputForm = () => {
        setFormState(InitFormState.SelectInputOutput);
    };

    const handleBack = () => {
        if (formState === InitFormState.SelectInputOutput) {
            setFormState(InitFormState.Create);
        } else if (formState === InitFormState.Create && enableHomePage) {
            setFormState(InitFormState.Home);
        }
    };

    const handleOnSave = () => {
        // insert initialized connector logic
        let modifications: STModification[] = null;
        if (targetPosition) {
            modifications = [];
            // Add an import.
            const addImport: STModification = createImportStatement(
                connector.org,
                connector.module,
                targetPosition
            );
            modifications.push(addImport);

            // Add an connector client initialization.
            if (!connectorConfig.isExistingConnection) {
                if ((connectorConfig.name !== undefined) && (connectorConfig.name !== '') &&
                    connectorConfig.subExitingConnection !== undefined) {
                    // This is the situation where user defines a existing base client
                    connectorConfig.name = genVariableName(connector.name,
                        getAllVariables(stSymbolInfo));
                    const clientInvocation: STModification = createRemoteServiceCall(
                        (connector.module + ":" + connector.name),
                        connectorConfig.name,
                        connectorConfig.subExitingConnection,
                        "getSobjectClient",
                        [],
                        targetPosition
                    );
                    modifications.push(clientInvocation);
                } else {
                    // This where the we need to define base client and query client or
                    // user selects an existing query client
                    const addConnectorInit: STModification = createObjectDeclaration(
                        (connector.module + ":" + connector.name),
                        connectorConfig.name,
                        ["{" + connectorInitFormFields[0].fields[0].name + ":" +
                            connectorInitFormFields[0].fields[0].value + ", clientConfig: {}}"],
                        targetPosition
                    );
                    modifications.push(addConnectorInit);
                }
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
        }
        onSave(modifications);
    };

    const homeForm = <SelectConnectionForm onCreateNew={handleCreateNew} connectorConfig={connectorConfig} connector={connector} onSelectExisting={handleSelectExisting} />;
    const createConnectorForm = <CreateConnectorForm homePageEnabled={enableHomePage} actions={actions} onSave={handleInputOutputForm} connectorConfig={connectorConfig} onBackClick={handleBack} connector={connector} isNewConnectorInitWizard={isNewConnectorInitWizard} />;
    const inputOutputForm = <SelectInputOutputForm onSave={handleOnSave} connectorConfig={connectorConfig} onBackClick={handleBack} isNewConnectorInitWizard={isNewConnectorInitWizard} />;
    const stepper = (
        <Stepper className="stepper-wrapper" alternativeLabel={true} activeStep={formState} connector={<QontoConnector />}>
            <Step className="step-container" key={InitFormState.Create}>
                <StepLabel className="step-label" StepIconComponent={QontoStepIcon} >CONNECTION</StepLabel>
            </Step>
            <Step className="step-container" key={InitFormState.SelectInputOutput}>
                <StepLabel className="step-label" StepIconComponent={QontoStepIcon} >INPUT/OUTPUT</StepLabel>
            </Step>
        </Stepper>
    );

    return (
        <div className={classes.root}>
            {formState !== InitFormState.Home && stepper}
            <div className={classes.stepper}>
                {formState === InitFormState.Home && homeForm}
                {formState === InitFormState.Create && createConnectorForm}
                {formState === InitFormState.SelectInputOutput && inputOutputForm}
            </div>
        </div>
    );
}
