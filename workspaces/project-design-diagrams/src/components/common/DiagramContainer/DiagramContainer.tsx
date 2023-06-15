/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useEffect, useState } from 'react';
import { DiagramModel } from '@projectstorm/react-diagrams';
import { ComponentModel } from '@wso2-enterprise/ballerina-languageclient';
import CircularProgress from '@mui/material/CircularProgress/CircularProgress';
import { DiagramCanvasWidget } from '../DiagramCanvas/CanvasWidget';
import { DagreLayout, ServiceModels, Views } from '../../../resources';
import { entityModeller, serviceModeller } from '../../../utils';
import { CellDiagram } from "../CellDiagram/CellDiagram";

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

                            {currentView === Views.CELL_VIEW &&
                                <CellDiagram
                                    currentView={currentView}
                                    cellModel={serviceModels.cellModel}
                                    layout={layout}
                                />
                            }
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
