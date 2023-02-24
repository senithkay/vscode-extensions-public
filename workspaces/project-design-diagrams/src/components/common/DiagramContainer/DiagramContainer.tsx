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
import { ComponentModel, DagreLayout, ServiceModels, Views } from '../../../resources';
import { entityModeller, serviceModeller } from '../../../utils';
import { CellContainer, CellDiagram } from "./style";
import { Gateways } from "../../gateway/Gateways/Gateways";
import _ from "lodash";

interface DiagramContainerProps {
    currentView: Views;
    layout: DagreLayout;
    workspacePackages: Map<string, boolean>;
    workspaceComponents: Map<string, ComponentModel>;
    typeCompositionModel: DiagramModel;
}

export function DiagramContainer(props: DiagramContainerProps) {
    const { currentView, layout, typeCompositionModel, workspaceComponents, workspacePackages } = props;

    const [serviceModels, setServiceModels] = useState<ServiceModels>(undefined);
    const [typeModel, setTypeModel] = useState<DiagramModel>(undefined);

    const setServiceNCellModels = () => {
        const genServiceModels = serviceModeller(workspaceComponents, workspacePackages)
        setServiceModels(genServiceModels);
    };

    useEffect(() => {
        if (currentView === Views.TYPE) {
            setTypeModel(entityModeller(workspaceComponents, workspacePackages));
            if (serviceModels) {
                setServiceModels(undefined);
            }
        } else if (currentView !== Views.TYPE_COMPOSITION) {
            setServiceNCellModels();
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
                setServiceNCellModels();
            }
        }
    }, [currentView])

    const hasModelLoaded = (): boolean => {
        switch (currentView) {
            case Views.L1_SERVICES:
            case Views.L2_SERVICES:
            case Views.CELL_VIEW:
                return serviceModels !== undefined;
            case Views.TYPE:
                return typeModel !== undefined;
            case Views.TYPE_COMPOSITION:
                return typeCompositionModel !== undefined;
        }
    }

    return (
        <>
            {hasModelLoaded() ?
                <>
                    {serviceModels &&
                        <>
                            <div style={{ display: currentView === Views.L1_SERVICES ? 'block' : 'none' }}>
                                <DiagramCanvasWidget
                                    type={Views.L1_SERVICES}
                                    model={serviceModels.levelOne}
                                    {...{currentView, layout}}
                                />
                            </div>

                            <div style={{ display: currentView === Views.L2_SERVICES ? 'block' : 'none' }}>
                                <DiagramCanvasWidget
                                    type={Views.L2_SERVICES}
                                    model={serviceModels.levelTwo}
                                    {...{currentView, layout}}
                                />
                            </div>

                            <CellDiagram currentView={currentView}>
                                <Gateways/>
                                <CellContainer>
                                    <DiagramCanvasWidget
                                        type={Views.CELL_VIEW}
                                        model={serviceModels.cellModel}
                                        {...{currentView, layout}}
                                    />
                                </CellContainer>
                            </CellDiagram>
                        </>
                    }
                    {typeModel &&
                        <div style={{ display: currentView === Views.TYPE ? 'block' : 'none' }}>
                            <DiagramCanvasWidget
                                type={Views.TYPE}
                                model={typeModel}
                                {...{currentView, layout}}
                            />
                        </div>
                    }
                    {typeCompositionModel &&
                        <div style={{ display: currentView === Views.TYPE_COMPOSITION ? 'block' : 'none' }}>
                            <DiagramCanvasWidget
                                type={Views.TYPE_COMPOSITION}
                                model={typeCompositionModel}
                                {...{currentView, layout}}
                            />
                        </div>
                    }
                </> :
                <CircularProgress />
            }
        </>
    );
}
