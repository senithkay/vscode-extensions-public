/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useEffect, useState } from 'react';
import { DiagramModel } from '@projectstorm/react-diagrams';
import CircularProgress from '@mui/material/CircularProgress/CircularProgress';
import { DiagramCanvasWidget } from '../DiagramCanvas/CanvasWidget';
import { ComponentModel, ServiceModels, Views } from '../../../resources';
import { entityModeller, serviceModeller } from '../../../utils';
import { CanvasContainer, Diagram, GatewayContainer } from "./style";
import { WestGatewayIcon } from "./WestGatewayIcon";
import { NorthGatewayIcon } from "./NorthGatewayIcon";

interface DiagramContainerProps {
    currentView: Views;
    workspacePackages: Map<string, boolean>;
    workspaceComponents: Map<string, ComponentModel>;
    typeCompositionModel: DiagramModel;
}

export function DiagramContainer(props: DiagramContainerProps) {
    const { currentView, typeCompositionModel, workspaceComponents, workspacePackages } = props;

    const [serviceModels, setServiceModels] = useState<ServiceModels>(undefined);
    const [typeModel, setTypeModel] = useState<DiagramModel>(undefined);

    useEffect(() => {
        if (currentView === Views.TYPE) {
            setTypeModel(entityModeller(workspaceComponents, workspacePackages));
            if (serviceModels) {
                setServiceModels(undefined);
            }
        } else if (currentView !== Views.TYPE_COMPOSITION) {
            setServiceModels(serviceModeller(workspaceComponents, workspacePackages));
            if (typeModel) {
                setTypeModel(undefined);
            }
        }
    }, [workspaceComponents, workspacePackages])

    useEffect(() => {
        if (currentView !== Views.TYPE_COMPOSITION && (serviceModels || typeModel)) {
            if (currentView === Views.TYPE && !typeModel) {
                setTypeModel(entityModeller(workspaceComponents, workspacePackages));
            } else if (currentView !== Views.TYPE && !serviceModels) {
                setServiceModels(serviceModeller(workspaceComponents, workspacePackages));
            }
        }
    }, [currentView])

    const hasModelLoaded = (): boolean => {
        switch (currentView) {
            case Views.L1_SERVICES:
                return serviceModels !== undefined;
            case Views.L2_SERVICES:
                return serviceModels !== undefined;
            case Views.TYPE:
                return typeModel !== undefined;
            case Views.TYPE_COMPOSITION:
                return typeCompositionModel !== undefined;
        }
    }

    return (
        <div>
            {hasModelLoaded() ?
                <>
                    {serviceModels &&
                        <>
                            {currentView === Views.L1_SERVICES && (
                                <div style={{display:"block"}}>
                                    <Diagram>
                                        {/*West Gateway*/}
                                        <GatewayContainer top={"calc(45vh + 30px)"} left={"calc(7vw - 44px)"} >
                                            <WestGatewayIcon/>
                                        </GatewayContainer>
                                        {/*North Gateway*/}
                                        <GatewayContainer top={'50px'} left={"calc(40vw + 100px)"}>
                                            <NorthGatewayIcon/>
                                        </GatewayContainer>
                                        <CanvasContainer>
                                            <DiagramCanvasWidget
                                                type={Views.L1_SERVICES}
                                                currentView={currentView}
                                                model={serviceModels.levelOne}
                                            />
                                        </CanvasContainer>
                                    </Diagram>
                                </div>
                            )}

                            {currentView === Views.L2_SERVICES && (
                                <div style={{display:"block"}}>
                                    <Diagram>
                                        {/*West Gateway*/}
                                        <GatewayContainer top={'46vh'} left={"calc(7vw - 44px)"} >
                                            <WestGatewayIcon/>
                                        </GatewayContainer>
                                        {/*North Gateway*/}
                                        <GatewayContainer top={'50px'} left={'46vw'}>
                                            <NorthGatewayIcon/>
                                        </GatewayContainer>
                                        <CanvasContainer>
                                            <DiagramCanvasWidget
                                                type={Views.L2_SERVICES}
                                                currentView={currentView}
                                                model={serviceModels.levelTwo}
                                            />
                                        </CanvasContainer>
                                    </Diagram>
                                </div>
                            )}
                        </>
                    }
                    {typeModel &&
                        <div style={{ display: currentView === Views.TYPE ? 'block' : 'none' }}>
                            <DiagramCanvasWidget
                                type={Views.TYPE}
                                currentView={currentView}
                                model={typeModel}
                            />
                        </div>
                    }
                    {typeCompositionModel &&
                        <div style={{ display: currentView === Views.TYPE_COMPOSITION ? 'block' : 'none' }}>
                            <DiagramCanvasWidget
                                type={Views.TYPE_COMPOSITION}
                                currentView={currentView}
                                model={typeCompositionModel}
                            />
                        </div>
                    }
                </> :
                <CircularProgress />
            }
        </div>
    );
}
