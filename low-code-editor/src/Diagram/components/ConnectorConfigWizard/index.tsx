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
import React, { useContext, useState } from 'react';
// import { connect } from "react-redux";

import { STNode } from "@ballerina/syntax-tree";

import { ConnectorConfig, FunctionDefinitionInfo, WizardType } from "../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { BallerinaConnectorsInfo, Connector } from "../../../Definitions/lang-client-extended";
import { TextPreloaderVertical } from "../../../PreLoader/TextPreloaderVertical";
// import { closeConfigOverlayForm configOverlayFormPrepareStart } from "../../$store/actions";
import { DraftInsertPosition } from "../../view-state/draft";
import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from '../Portals/Overlay';
import { fetchConnectorInfo } from "../Portals/utils";

import { ConnectorForm } from "./Components/ConnectorForm";
import { wizardStyles } from "./style";

export interface ConfigWizardState {
    isLoading: boolean;
    connectorDef: any;
    connector: Connector;
    wizardType: WizardType;
    functionDefInfo: Map<string, FunctionDefinitionInfo>;
    connectorConfig: ConnectorConfig;
    model?: STNode;
}

export interface ConnectorConfigWizardProps {
    position: DiagramOverlayPosition;
    connectorInfo: BallerinaConnectorsInfo;
    targetPosition: DraftInsertPosition;
    model?: STNode;
    onClose: () => void;
    // dispatchOverlayOpen: () => void;
}

export function ConnectorConfigWizard(props: ConnectorConfigWizardProps) {
    const { state } = useContext(DiagramContext);
    const { closeConfigOverlayForm: dispatchOverlayClose, configOverlayFormPrepareStart: dispatchOverlayOpen } = state;

    const { position, connectorInfo, targetPosition, model, onClose } = props;

    const initWizardState: ConfigWizardState = {
        isLoading: true, connectorDef: undefined, connectorConfig: undefined,
        functionDefInfo: undefined, wizardType: undefined, connector: undefined
    }

    const [wizardState, setWizardState] = useState<ConfigWizardState>(initWizardState);
    const classes = wizardStyles();

    React.useEffect(() => {
        if (wizardState.isLoading) {
            (async () => {
                const configList = await fetchConnectorInfo(connectorInfo, model, state);
                setWizardState(configList);
            })()
            dispatchOverlayOpen();
        }
    }, [wizardState]);

    const handleClose = () => {
        onClose();
        dispatchOverlayClose()
    }

    return (
        <div>
            <DiagramOverlayContainer>
                <DiagramOverlay
                    className={classes.configWizardContainer}
                    position={position}
                >
                    <>
                        {wizardState.isLoading ? (
                            <div className={classes.loaderWrapper}>
                                <TextPreloaderVertical position='relative' />
                            </div>
                        ) : (
                                <ConnectorForm
                                    targetPosition={targetPosition}
                                    configWizardArgs={wizardState}
                                    connectorInfo={connectorInfo}
                                    onClose={handleClose}
                                />
                            )}
                    </>
                </DiagramOverlay>
            </DiagramOverlayContainer>
        </div>
    );
}

// const mapDispatchToProps = {
//     dispatchOverlayOpen: configOverlayFormPrepareStart,
//     dispatchOverlayClose: closeConfigOverlayForm,
// };

// export const ConnectorConfigWizard = connect(null, mapDispatchToProps)(ConnectorConfigWizardC);
