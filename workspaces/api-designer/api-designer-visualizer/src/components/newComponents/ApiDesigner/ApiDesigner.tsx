/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useState } from 'react';
import { OpenAPI as O } from '../../../Definitions/ServiceDefinitions';
import { ComponentNavigator } from '../ComponentNavigator/ComponentNavigator';
import { OpenAPI } from '../OpenAPI/OpenAPI';
import styled from '@emotion/styled';
import { SplitView } from '../../SplitView/SplitView';
import { Tabs } from '../../Tabs/Tabs';
import { Views } from '../../../constants';
import { APIDesignerContext } from '../../../NewAPIDesignerContext';
import { getAllComponents } from '../../Utils/OpenAPIUtils';
import { ReadOnlyOpenAPI } from '../OpenAPI/ReadOnlyOpenAPI';

const SplitViewContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 15px 10px 0px 10px;
`;
const NavigationPanelContainer = styled.div`
    padding: 10px;
`;

interface ApiDesignerProps {
    openApi: O;
    isEditMode: boolean;// Pass the mode
    openAPIVersion: string;
    onOpenApiChange: (openApi: O) => void;
}

export function ApiDesigner(props: ApiDesignerProps) {
    const { openApi, isEditMode, openAPIVersion, onOpenApiChange } = props;
    const [selectedComponentID, setSelectedComponentID] = useState<string | undefined>("overview");
    const [currentView, setCurrentView] = useState(isEditMode ? Views.EDIT : Views.READ_ONLY);
    const [pathInitiated, setPathInitiated] = useState(false);

    const contextValue = {
        props: {
            openAPIVersion: openAPIVersion,
            openAPI: openApi,
            selectedComponentID,
            pathInitiated,
            components: getAllComponents(openApi),
            currentView,
        },
        api: {
            onSelectedComponentIDChange: (component: string) => {
                if (component === "Paths#-Resources") {
                    // Get the first path item and set it as the selected item
                    const paths = openApi?.paths ? Object.keys(openApi.paths) : [];
                    const sanitizedPaths = paths.filter((path) => path !== "servers" && path !== "parameters"
                        && path !== "description" && path !== "summary" && path !== "tags" && path !== "externalDocs");
                    setSelectedComponentID(openApi?.paths && `paths#-component#-${sanitizedPaths[0]}`);
                } else if (component === "Components#-Components") {
                    // Get the first schema item and set it as the selected item
                    const schemas = openApi?.components?.schemas ? Object.keys(openApi.components.schemas) : [];
                    setSelectedComponentID(schemas && `schemas#-component#-${schemas[0]}`);
                } else {
                    setSelectedComponentID(component);
                }
            },
            onCurrentViewChange: (view: Views) => {
                setCurrentView(view);
            },
            onPathInitiatedChange: (pathInitiated: boolean) => {
                setPathInitiated(pathInitiated);
            },
        },
    };

    const handleApiDesignerChange = (openApi: O) => {
        onOpenApiChange({ ...openApi });
    };
    const handleViewChange = (view: string) => {
        setCurrentView(view as Views);
    };

    return (
        <APIDesignerContext.Provider value={contextValue}>
            <SplitViewContainer>
                <SplitView defaultWidths={[18, 82]} sx={{ maxWidth: 1200 }} dynamicContainerSx={{ height: "96vh" }}>
                    <NavigationPanelContainer>
                        {openApi &&
                            <ComponentNavigator
                                openAPI={openApi}
                                onComponentNavigatorChange={handleApiDesignerChange}
                            />
                        }
                    </NavigationPanelContainer>
                    <Tabs
                        sx={{ paddingLeft: 10 }}
                        childrenSx={{ overflowY: "auto", maxHeight: "90vh" }}
                        tabTitleSx={{ marginLeft: 5 }}
                        titleContainerSx={{
                            position: "sticky",
                            top: 0,
                            zIndex: 5,
                        }}
                        views={[
                            { id: Views.READ_ONLY, name: 'View' },
                            { id: Views.EDIT, name: 'Design' },
                        ]}
                        currentViewId={currentView}
                        onViewChange={handleViewChange}
                    >
                        <div id={Views.EDIT} style={{ minHeight: "90vh" }}>
                            <OpenAPI
                                openAPI={openApi}
                                onOpenAPIChange={handleApiDesignerChange}
                            />
                        </div>
                        <div id={Views.READ_ONLY}>
                            <ReadOnlyOpenAPI
                                openAPI={openApi}
                            />
                        </div>
                    </Tabs>
                </SplitView>
            </SplitViewContainer>
        </APIDesignerContext.Provider>
    )
}
