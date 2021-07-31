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
import React, { useState } from "react";

import Step from "@material-ui/core/Step";
import StepConnector from "@material-ui/core/StepConnector";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import clsx from "clsx";

import { ConnectorConfig, FormField } from "../../../../../../../ConfigurationSpec/types";
import { Connector, STModification } from "../../../../../../../Definitions/lang-client-extended";
import { DraftInsertPosition } from "../../../../../../view-state/draft";
import { SelectConnectionForm } from "../../../../../ConnectorConfigWizard/Components/SelectExistingConnection";

import { SelectInputOutputForm } from "./SelectInputOutputForm";
import { SelectOperationForm } from "./SelectOperationForm";
import "./style.scss"
import { useStyles } from "./styles";

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
    SelectOperation,
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
    const classes = useStyles();

    return (
        <div
            className={clsx(classNames(classes.genStepWrapper, "genStepWrapper"), { [classNames(classes.genStepActive, "genStepActive")]: active })}
        >
            {completed ? <div className={classNames(classes.genCompletedStep, "genCompletedStep")} /> : <div className="genCurrentStep" />}
        </div>
    );
}

export function Wizard(props: WizardProps) {
    const classes = useStyles();
    const { actions, connectorConfig, connector, onSave, isNewConnectorInitWizard, targetPosition } = props;
    const connectorInitFormFields: FormField[] = actions.get("init") ? actions.get("init") : actions.get("__init");

    const enableHomePage = connectorConfig.existingConnections !== undefined && isNewConnectorInitWizard;
    const initFormState = enableHomePage ? InitFormState.Home : InitFormState.Create;
    connectorConfig.connectorInit = connectorConfig.connectorInit.length > 0 ? connectorConfig.connectorInit : connectorInitFormFields;
    const [state, setState] = useState<InitFormState>(initFormState);

    const handleOperationsForm = () => {
        setState(InitFormState.SelectOperation);
    };

    const handleCreateNew = () => {
        setState(InitFormState.Create);
    };

    const handleSelectExisting = () => {
        setState(InitFormState.SelectOperation);
    };

    const handleInputOutputForm = () => {
        setState(InitFormState.SelectInputOutput);
    };

    const handleBack = () => {
        if (state === InitFormState.SelectInputOutput) {
            setState(InitFormState.SelectOperation);
        } else if (state === InitFormState.SelectOperation) {
            setState(InitFormState.Create);
        } else if (state === InitFormState.Create && enableHomePage) {
            setState(InitFormState.Home);
        }
    }

    const homeForm = <SelectConnectionForm onCreateNew={handleCreateNew} connectorConfig={connectorConfig} connector={connector} onSelectExisting={handleSelectExisting} />;
    // const createConnectorForm = <CreateConnectorForm homePageEnabled={enableHomePage} actions={actions} onSave={handleOperationsForm} connectorConfig={connectorConfig} onBackClick={handleBack} connector={connector} isNewConnectorInitWizard={isNewConnectorInitWizard} />;
    const operationSelection = <SelectOperationForm actions={actions} onSave={handleInputOutputForm} connectorConfig={connectorConfig} onBackClick={handleBack} />;
    const inputOutptForm = <SelectInputOutputForm actions={actions} onSave={onSave} connectorConfig={connectorConfig} onBackClick={handleBack} isNewConnectorInitWizard={isNewConnectorInitWizard} />;
    const stepper = (
        <Stepper className={classNames(classes.genStepperWrapper, "genStepperWrapper")} alternativeLabel={true} activeStep={state} connector={<QontoConnector />}>
            <Step className={classNames(classes.genStepContainer, "genStepContainer")} key={InitFormState.Create}>
                <StepLabel className={classNames(classes.genStepLabel, "genStepLabel")} StepIconComponent={QontoStepIcon} >CONNECTION</StepLabel>
            </Step>
            <Step className={classNames(classes.genStepContainer, "genStepContainer")} key={InitFormState.SelectOperation}>
                <StepLabel className={classNames(classes.genStepLabel, "genStepLabel")} StepIconComponent={QontoStepIcon} >OPERATION</StepLabel>
            </Step>
            <Step className={classNames(classes.genStepContainer, "genStepContainer")} key={InitFormState.SelectInputOutput}>
                <StepLabel className={classNames(classes.genStepLabel, "genStepLabel")} StepIconComponent={QontoStepIcon} >INPUT/OUTPUT</StepLabel>
            </Step>
        </Stepper>
    );

    return (
        <div className={classes.root}>
            {state !== InitFormState.Home && stepper}
            <div className={classes.stepper}>
                {state === InitFormState.Home && homeForm}
                {/*{state === InitFormState.Create && createConnectorForm}*/}
                {state === InitFormState.SelectOperation && operationSelection}
                {state === InitFormState.SelectInputOutput && inputOutptForm}
            </div>
        </div>
    );
}
