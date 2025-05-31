/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { ConfigVariable } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Button, Codicon, ErrorBanner, Icon, SplitView, TextField, TreeView, TreeViewItem, Typography, View, ViewContent, Tooltip } from "@wso2-enterprise/ui-toolkit";
import { EditForm } from "../EditConfigurableVariables";
import { AddForm } from "../AddConfigurableVariables";
import { DiagnosticsPopUp } from "../../../../components/DiagnosticsPopUp";
import { TopNavigationBar } from "../../../../components/TopNavigationBar";
import { TitleBar } from "../../../../components/TitleBar";

const Container = styled.div`
    width: 100%;
    padding: 10px 0px 10px 8px;
    height: calc(100vh - 220px);
    overflow-y: auto;
`;

const SearchStyle = {
    width: 'auto',

    '& > vscode-text-field': {
        width: '100%',
        paddingBottom: '10px',
        borderRadius: '5px'
    },
};

const EmptyReadmeContainer = styled.div`
    display: flex;
    margin: 80px 0px;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    height: 100%;
`;

const Description = styled(Typography)`
    color: var(--vscode-descriptionForeground);
`;

const ButtonWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    font-size: 10px;
    width: 40px;
`;

const ConfigValueField = styled.div`
    display: flex;
    width: auto;
    justify-content: space-between;
    background-color: var(--input-background);
    height: 28px;
    padding: 5px 10px;
    cursor: pointer !important;
    border: calc(var(--border-width) * 1px) solid var(--dropdown-border);
    color: var(--input-foreground);
    &:hover {
        .edit-icon-container {
            display: block !important;
        }
    }
`;

const TitleBoxShadow = styled.div`
    box-shadow: var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset;
    height: 3px;
`;

const TitleContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ConfigurableItem = styled.div`
    padding: 12px 14px 18px;
    &:hover {
        background-color: var(--vscode-settings-rowHoverBackground);
        
        .delete-button-container {
            display: block !important;
        }
    }
`;

const ConfigNameTitle = styled.div`
    font-size: 13px;
    font-weight: 600;
    height: 20px;
    color: var(--vscode-foreground);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const searchIcon = (<Codicon name="search" sx={{ cursor: "auto" }} />);

export interface ConfigProps {
    variableIndex?: number;
    isExternallauncher?: boolean;
    fileName: string;
    org: string;
    package: string;
}

interface CategoryWithModules {
    name: string;
    modules: string[];
}

type ConfigVariablesState = {
    [category: string]: {
        [module: string]: ConfigVariable[];
    };
};

interface PackageModuleState {
    category: string;
    module: string;
}

export function ViewConfigurableVariables(props?: ConfigProps) {

    const { rpcClient } = useRpcContext();
    const [configVariables, setConfigVariables] = useState<ConfigVariablesState>({});
    const [isEditConfigVariableFormOpen, setEditConfigVariableFormOpen] = useState<boolean>(false);
    const [isAddConfigVariableFormOpen, setAddConfigVariableFormOpen] = useState<boolean>(false);
    const [configIndex, setConfigIndex] = useState<number>(null);
    const [searchValue, setSearchValue] = React.useState<string>('');
    const [categoriesWithModules, setCategoriesWithModules] = useState<CategoryWithModules[]>([]);
    const [selectedModule, setSelectedModule] = useState<PackageModuleState>(null);

    useEffect(() => {
        getConfigVariables();
    }, []);

    useEffect(() => {
        if (categoriesWithModules.length > 0 && !selectedModule) {
            const initialCategory = categoriesWithModules[0];
            const initialModule = initialCategory.modules[0];

            // Only set initial module if none is selected
            setSelectedModule({
                category: initialCategory.name,
                module: initialModule
            });
        }
    }, [categoriesWithModules, selectedModule]);

    const getFilteredConfigVariables = useCallback(() => {
        if (!searchValue || searchValue.trim() === '') {
            return configVariables;
        }

        const searchLower = searchValue.toLowerCase();
        const filteredData: ConfigVariablesState = {};

        // Filter through all categories and modules
        Object.keys(configVariables).forEach(category => {
            const categoryModules: { [module: string]: ConfigVariable[] } = {};

            Object.keys(configVariables[category]).forEach(module => {
                // Filter variables that match the search term
                const filteredVariables = configVariables[category][module].filter(variable =>
                    // Match by variable name
                    (variable.properties.variable.value?.toString().toLowerCase().includes(searchLower))
                );

                if (filteredVariables.length > 0) {
                    categoryModules[module] = filteredVariables;
                }
            });

            if (Object.keys(categoryModules).length > 0) {
                filteredData[category] = categoryModules;
            }
        });

        return filteredData;
    }, [configVariables, searchValue]);

    const filteredConfigVariables = useMemo(() => getFilteredConfigVariables(), [getFilteredConfigVariables]);

    const filteredCategoriesWithModules = useMemo(() => {
        return Object.keys(filteredConfigVariables).map(category => ({
            name: category,
            modules: Object.keys(filteredConfigVariables[category])
        }));
    }, [filteredConfigVariables]);

    // Set selected module to first module in filtered results when search changes
    useEffect(() => {
        if (searchValue && filteredCategoriesWithModules.length > 0 && filteredCategoriesWithModules[0].modules.length > 0) {
            const firstCategory = filteredCategoriesWithModules[0];
            const firstModule = firstCategory.modules[0];
            setSelectedModule({
                category: firstCategory.name,
                module: firstModule
            });
        }
    }, [filteredCategoriesWithModules, searchValue]);

    const moduleWarningCount = useCallback((category: string, module: string) => {
        if (!configVariables?.[category]?.[module]) {
            return 0;
        }

        return configVariables[category][module].filter(variable => (
            !variable?.properties?.defaultValue?.value &&
            !variable?.properties?.configValue?.value
        )).length;
    }, [configVariables]);

    const categoryWarningCount = useCallback((category: string) => {
        if (!configVariables?.[category]) {
            return 0;
        }

        return Object.keys(configVariables[category]).reduce((total, module) => {
            return total + moduleWarningCount(category, module);
        }, 0);
    }, [configVariables, moduleWarningCount]);

    const handleSearch = (e: string) => {
        setSearchValue(e);
    }

    const handleModuleSelect = (category: string, module: string) => {
        setAddConfigVariableFormOpen(false);
        setEditConfigVariableFormOpen(false);
        setSelectedModule({ category, module });
    };

    const handleOpenConfigFile = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .OpenConfigTomlRequest({ filePath: props.fileName });
    }

    const handleEditConfigVariableFormOpen = (index: number) => {
        setConfigIndex(index);
        setEditConfigVariableFormOpen(true);
    };

    const handleAddConfigVariableFormOpen = () => {
        setAddConfigVariableFormOpen(true);
    };

    const handleFormClose = () => {
        setAddConfigVariableFormOpen(false);
        setEditConfigVariableFormOpen(false);
    };

    const handleFormSubmit = async () => {
        setAddConfigVariableFormOpen(false);
        setEditConfigVariableFormOpen(false);
        // Add 0.5 second timeout to allow ls to process the changes (libraries)
        await new Promise(resolve => setTimeout(resolve, 500));
        getConfigVariables();
    }

    const handleOnDeleteConfigVariable = async (index: number) => {
        if (!selectedModule) return;

        const variables = searchValue ?
            filteredConfigVariables[selectedModule.category]?.[selectedModule.module] :
            configVariables[selectedModule.category]?.[selectedModule.module];

        const variable = variables?.[index];
        if (!variable) return;

        rpcClient
            .getBIDiagramRpcClient()
            .deleteConfigVariableV2({
                configFilePath: props.fileName,
                configVariable: variable,
                packageName: selectedModule.category,
                moduleName: selectedModule.module
            })
            .then((response) => {
                if (response.textEdits) {
                    console.log("Successfully deleted configurable variable");
                } else {
                    console.error(">>> Error updating source code", response);
                }
            })
            .finally(() => {
                getConfigVariables();
            });
    };

    const getConfigVariables = async () => {

        let data: ConfigVariablesState = {};

        await rpcClient
            .getBIDiagramRpcClient()
            .getConfigVariablesV2()
            .then((variables) => {
                data = (variables as any).configVariables;
            });

        setConfigVariables(data);
        
        // Only set initial selected module if none is selected
        if (!selectedModule) {
            // Extract and set the available categories with their modules
            const extractedCategories = Object.keys(data).map(category => ({
                name: category,
                modules: Object.keys(data[category])
            }));
            setCategoriesWithModules(extractedCategories);

            const initialCategory = extractedCategories[0].name;
            const initialModule = extractedCategories[0].modules[0];
            setSelectedModule({
                category: initialCategory,
                module: initialModule
            });
        }
    };

    const categoryDisplay = selectedModule?.category === `${props.org}/${props.package}` ? 'Integration' : selectedModule?.category;
    const title = selectedModule?.module ? `${categoryDisplay} : ${selectedModule?.module}` : categoryDisplay;

    const ConfigurablesList = () => {
        let renderVariables: ConfigVariablesState = configVariables;
        if (searchValue) {
            renderVariables = getFilteredConfigVariables();
        }

        if (!renderVariables) {
            return <ErrorBanner errorMsg={"Error fetching config variables"} />;
        }

        if (searchValue && filteredCategoriesWithModules.length === 0) {
            return (<EmptyReadmeContainer>
                <Icon name="searchIcon" sx={{ fontSize: '3em', color: 'var(--vscode-descriptionForeground)', marginBottom: '10px' }} />
                <Description variant="body2">
                    No configurable variables found matching "{searchValue}" in any module
                </Description>
                <Button appearance="secondary" onClick={() => setSearchValue('')}>
                    Clear Search
                </Button>
            </EmptyReadmeContainer>
            )
        }

        return (
            <>
                <div id="TitleDiv" style={{ position: "sticky", top: 0, color: "var(--vscode-editor-foreground)", backgroundColor: "var(--vscode-editor-background)" }}>
                    <TitleContent>
                        <Typography variant="h2" sx={{ padding: "0px 0 0 20px", margin: "10px 0px", color: "var(--vscode-foreground)" }}>
                            {title}
                        </Typography>
                        {/* Only show Add Config button at the top when the module has configurations */}
                        {selectedModule &&
                            renderVariables[selectedModule?.category]?.[selectedModule?.module]?.length > 0 &&
                            selectedModule.category === `${props.org}/${props.package}` && (
                                <Button
                                    sx={{ display: 'flex', justifySelf: 'flex-end' }}
                                    appearance="primary"
                                    onClick={handleAddConfigVariableFormOpen}
                                >
                                    <Codicon name="add" sx={{ marginRight: 5 }} />Add Config
                                </Button>
                            )}
                    </TitleContent>
                    <TitleBoxShadow />
                </div>
                <Container>
                    {selectedModule && (
                        <>
                            {/* Check if the selected module exists in the variables */}
                            {renderVariables[selectedModule?.category] &&
                                renderVariables[selectedModule?.category][selectedModule?.module] && (
                                    <div key={`${selectedModule?.category}-${selectedModule?.module}`}>
                                        {renderVariables[selectedModule?.category][selectedModule?.module].length > 0 ? (
                                            /* Variables under this selected module */
                                            renderVariables[selectedModule?.category][selectedModule?.module].map((variable, index) => (
                                                <ConfigurableItem>
                                                    <ConfigNameTitle>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            {
                                                                typeof variable?.properties?.variable?.value === 'string' ?
                                                                    variable?.properties?.variable?.value : ''
                                                            }:
                                                            <span
                                                                style={{
                                                                    paddingLeft: '5px',
                                                                    fontWeight: 700,
                                                                    color: 'var(--vscode-settings-headerForeground)'
                                                                }}>
                                                                {String(variable?.properties?.type?.value)}
                                                            </span>
                                                            {(!variable?.properties?.defaultValue?.value &&
                                                                !variable?.properties?.configValue?.value) && (
                                                                    // Warning icon if no value is configured
                                                                    <ButtonWrapper>
                                                                        <Tooltip content="Value is not configured">
                                                                            <Button
                                                                                appearance="icon"
                                                                                buttonSx={{
                                                                                    background: "transparent"
                                                                                }}
                                                                            >
                                                                                <Codicon
                                                                                    name="warning"
                                                                                    sx={{
                                                                                        paddingTop: '2px',
                                                                                        color: 'var(--vscode-editorWarning-foreground)'
                                                                                    }}
                                                                                    iconSx={{ font: "normal normal normal 13px/1 codicon" }}
                                                                                />
                                                                            </Button>
                                                                        </Tooltip>
                                                                    </ButtonWrapper>
                                                                )}
                                                        </div>
                                                        {selectedModule.category === `${props.org}/${props.package}` && (
                                                            // Delete button only for integration module
                                                            <div className="delete-button-container" style={{ display: 'none' }}>
                                                                <Button
                                                                    appearance="icon"
                                                                    disabled={selectedModule.category !== `${props.org}/${props.package}`}
                                                                    onClick={() => handleOnDeleteConfigVariable(index)}
                                                                    tooltip="Delete Configurable Variable"
                                                                >
                                                                    <Codicon name="trash" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </ConfigNameTitle>
                                                    <div
                                                        style={{
                                                            fontSize: '13px',
                                                            marginTop: '6px',
                                                            color: 'var(--vscode-descriptionForeground)'
                                                        }}>
                                                        {String(variable?.properties?.description?.value ?? "")} This config variable
                                                        <span
                                                            style={{
                                                                paddingLeft: '4px',
                                                                color: 'var(--vscode-textLink-foreground)',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => handleEditConfigVariableFormOpen(index)}
                                                        >
                                                            defaults to
                                                        </span>
                                                    </div>
                                                    <div style={{ marginTop: '12px' }}>
                                                        <ConfigValueField onClick={() => handleEditConfigVariableFormOpen(index)}>
                                                            <div style={{ minWidth: '10px' }}>
                                                                {variable?.properties?.configValue?.value ?
                                                                    String(variable?.properties?.configValue?.value) : ''}
                                                            </div>
                                                            <div className="edit-icon-container" style={{ display: 'none' }}>
                                                                <Icon sx={{ paddingTop: '2px' }} name="editIcon" />
                                                            </div>
                                                        </ConfigValueField>
                                                    </div>
                                                </ConfigurableItem>
                                            ))
                                        ) : (
                                            // No variables in this module (not search related)
                                            <EmptyReadmeContainer>
                                                <Description variant="body2">
                                                    No configurable variables found in this module
                                                </Description>
                                                <Button appearance="primary" onClick={handleAddConfigVariableFormOpen}>
                                                    <Codicon name="add" sx={{ marginRight: 5 }} />Add Config
                                                </Button>
                                            </EmptyReadmeContainer>
                                        )}
                                    </div>
                                )
                            }
                        </>
                    )}
                    {isEditConfigVariableFormOpen && configIndex !== null && selectedModule &&
                        <EditForm
                            isOpen={isEditConfigVariableFormOpen}
                            onClose={handleFormClose}
                            onSubmit={handleFormSubmit}
                            variable={renderVariables[selectedModule.category]?.[selectedModule.module]?.[configIndex]}
                            title={`Edit Configurable Variable`}
                            filename={props.fileName}
                            packageName={selectedModule.category}
                            moduleName={selectedModule.module}
                        />
                    }
                    {isAddConfigVariableFormOpen && selectedModule &&
                        <AddForm
                            isOpen={isAddConfigVariableFormOpen}
                            onClose={handleFormClose}
                            onSubmit={handleFormSubmit}
                            title={`Add Configurable Variable`}
                            filename={props.fileName}
                            packageName={selectedModule.category}
                            moduleName={selectedModule.module}
                        />
                    }
                </Container>
            </>
        )
    }

    return (
        <View>
            <TopNavigationBar />
            <TitleBar title="Configurable Variables" subtitle="View and manage configurable variables" actions={
                <Button appearance="secondary" onClick={handleOpenConfigFile}>
                    <Icon sx={{ marginRight: 5, paddingTop: '2px' }} name="editIcon" />Edit in config.toml
                </Button>
            } />
            <ViewContent padding>
                <div style={{ height: 'calc(100vh - 220px)' }}>
                    {/* Search bar */}
                    <TextField
                        sx={SearchStyle}
                        placeholder="Search Configurables"
                        value={searchValue}
                        onTextChange={handleSearch}
                        icon={{
                            iconComponent: searchIcon,
                            position: 'start',
                        }}
                        autoFocus={true}
                    />
                    <div style={{ width: "auto" }}>
                        <SplitView defaultWidths={[20, 80]} dynamicContainerSx={{ overflow: "visible" }}>
                            {/* Left side tree view */}
                            <div style={{ padding: "10px 0 50px 0" }}>
                                {(searchValue ? filteredCategoriesWithModules : categoriesWithModules).map((category, index) => (
                                    <TreeView
                                        key={category.name}
                                        rootTreeView
                                        id={category.name}
                                        expandByDefault={false}
                                        onSelect={() => {
                                            if (category.modules.length > 0) {
                                                handleModuleSelect(category.name, category.modules[0]);
                                            }
                                        }}
                                        treeViewElementSX={{
                                            border: selectedModule?.category === category.name && selectedModule?.module === ""
                                                ? '1px solid var(--vscode-focusBorder)'
                                                : 'none'
                                        }}
                                        content={
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    height: '22px',
                                                    alignItems: 'center',
                                                }}>
                                                <Typography
                                                    variant="body3"
                                                    sx={{
                                                        fontWeight: selectedModule?.category === category.name && selectedModule?.module === ""
                                                            ? 'bold' : 'normal'
                                                    }}
                                                >
                                                    {category.name === `${props.org}/${props.package}` ? 'Integration' : category.name}
                                                </Typography>
                                                {categoryWarningCount(category.name) > 0 && (
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Codicon name="warning"
                                                            sx={{
                                                                marginLeft: 5,
                                                                fontSize: '0.8em',
                                                                color: 'var(--vscode-editorWarning-foreground)'
                                                            }}
                                                        />
                                                        <span
                                                            style={{
                                                                marginLeft: 3,
                                                                color: 'var(--vscode-editorWarning-foreground)',
                                                                fontSize: '0.85em'
                                                            }}>
                                                            {categoryWarningCount(category.name)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        }
                                    >
                                        {category.modules.filter(moduleName => moduleName !== "").map((moduleName) => (
                                            <TreeViewItem
                                                key={`${category.name}-${moduleName}`}
                                                id={`${category.name}-${moduleName}`}
                                                sx={{
                                                    backgroundColor: 'transparent',
                                                    paddingLeft: '35px',
                                                    height: '25px',
                                                    border: selectedModule?.category === category.name && selectedModule?.module === moduleName
                                                        ? '1px solid var(--vscode-focusBorder)'
                                                        : 'none'
                                                }}
                                                selectedId={`${category.name}-${moduleName}`}
                                            >
                                                <div
                                                    style={{ display: 'flex', height: '20px', alignItems: 'center' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleModuleSelect(category.name, moduleName);
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body3"
                                                        sx={{
                                                            fontWeight: selectedModule?.category === category.name && selectedModule?.module === moduleName
                                                                ? 'bold' : 'normal'
                                                        }}
                                                    >
                                                        {moduleName}
                                                    </Typography>
                                                    {moduleWarningCount(category.name, moduleName) > 0 && (
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <Codicon
                                                                name="warning"
                                                                sx={{
                                                                    marginLeft: 5,
                                                                    fontSize: '0.8em',
                                                                    color: 'var(--vscode-editorWarning-foreground)'
                                                                }}
                                                            />
                                                            <span style={{ marginLeft: 3, color: 'var(--vscode-editorWarning-foreground)', fontSize: '0.85em' }}>
                                                                {moduleWarningCount(category.name, moduleName)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TreeViewItem>
                                        ))}
                                    </TreeView>
                                ))}
                            </div>
                            {/* Right side view */}
                            <div style={{ height: '100%' }}>
                                <ConfigurablesList />
                            </div>
                        </SplitView>
                    </div>
                </div>
            </ViewContent>
        </View>
    );
}

export default ViewConfigurableVariables;
