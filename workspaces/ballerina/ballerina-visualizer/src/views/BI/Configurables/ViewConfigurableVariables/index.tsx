/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { AvailableNode, Category, Item, ConfigVariable, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Button, Codicon, ProgressRing, SearchBox, Typography, View, ViewContent, ViewHeader } from "@wso2-enterprise/ui-toolkit";
import { cloneDeep, debounce } from "lodash";
import ButtonCard from "../../../../components/ButtonCard";
import { BodyText } from "../../../styles";
import { BIHeader } from "../../BIHeader";
import { Tab } from "@headlessui/react";
import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow, VSCodeDivider } from '@vscode/webview-ui-toolkit/react';
import { ServiceDesigner } from "../../../ServiceDesigner";
import { EditForm } from "../EditConfigurableVariables";

const Container = styled.div`
    width: 100%;
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;
`;

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    width: 100%;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-top: 32px;
    width: 100%;
`;

const StyledSearchInput = styled(SearchBox)`
    height: 30px;
`;


namespace S {

    export const Table = styled.table`
    padding: 10px 10px 10px 0;
`;

    export const TableHead = styled.thead`
    padding: 10px 10px 10px 0;
`;

    export const TableRow = styled.tr`
    padding: 10px 10px 10px 0;
`;

    export const TableCell = styled.td`
    padding: 10px 20px 10px 0;
    vertical-align: top;
`;

    export const TableBody = styled.tbody`
    padding: 10px 10px 10px 0;
`;

    export const TableHeadCell = styled.th`
    padding: 10px 20px 10px 0;
    text-align: left;
`;
    
    export const Row = styled.div`
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    `;
}

// interface ConnectorViewProps {
//     onSelectConnector: (connector: AvailableNode) => void;
// }

// export function ViewConfigurables(props: ConnectorViewProps) {
export function ViewConfigurableVariables() {
    // const { onSelectConnector } = props;
    const { rpcClient } = useRpcContext();

    const [configVariables, setConfigVariables] = useState<ConfigVariable[]>([]);
    const [isConfigVariableFormOpen, setConfigVariableFormOpen] = useState<boolean>(false);
    const [configIndex, setConfigIndex] = useState<number>(0);

    // const [connectors, setConnectors] = useState<Category[]>([]);
    // const [searchText, setSearchText] = useState<string>("");
    // const [isSearching, setIsSearching] = useState(false);

    const handleConfigVariableFormOpen = (index:number) => {
        setConfigVariableFormOpen(true);
        setConfigIndex(index);
    };

    const handleEditConfigFormClose = () => {
        setConfigVariableFormOpen(false);
        // setEditingResource(undefined);
    };

    const handleResourceFormSave = async (content: string, config: any, resourcePosition?: any) => {
        console.log(">>> content", content);
        
        // const position = model.closeBraceToken.position;
        // position.endColumn = 0;
        // await applyModifications([{
        //     type: "INSERT",
        //     isImport: false,
        //     config: {
        //         "STATEMENT": content
        //     },
        //     ...(resourcePosition ? resourcePosition : position)
        // }]);
    };

    useEffect(() => {
        // getConnectors();
        getConfigVariables();
    }, []);

    const getConfigVariables = () => {
        rpcClient
            .getLangClientRpcClient()
            .getConfigVariables()
            .then((variables) => {
                console.log(">>> Config variables", variables);
                setConfigVariables(variables.configVariables);
                // setConnectors(model.categories);
            });
    };
    console.log(">>> configVariables", configVariables);

    // const getConfigVariables = () => {
    //     rpcClient
    //         .getConfigVariables()
    //         .then((model) => {
    //             console.log(">>> bi connectors", model);
    //         });
    // };

    // useEffect(() => {
    //     setIsSearching(true);
    //     debouncedSearch(searchText);
    //     return () => debouncedSearch.cancel();
    // }, [searchText]);

    // const handleSearch = (text: string) => {
    //     rpcClient
    //         .getBIDiagramRpcClient()
    //         .getBIConnectors({ queryMap: { q: text } })
    //         .then((model) => {
    //             console.log(">>> bi searched connectors", model);
    //             setConnectors(model.categories);
    //         });
    // }
    // const debouncedSearch = debounce(handleSearch, 1100);


    // useEffect(() => {
    //     setIsSearching(false);
    // }, [connectors]);

    // const handleOnSearch = (text: string) => {
    //     setSearchText(text);
    // };

    // const filterItems = (items: Item[]): Item[] => {
    //     return items
    //         .map((item) => {
    //             if ("items" in item) {
    //                 const filteredItems = filterItems(item.items);
    //                 return {
    //                     ...item,
    //                     items: filteredItems,
    //                 };
    //             } else {
    //                 const lowerCaseTitle = item.metadata.label.toLowerCase();
    //                 const lowerCaseDescription = item.metadata.description?.toLowerCase() || "";
    //                 const lowerCaseSearchText = searchText.toLowerCase();
    //                 if (
    //                     lowerCaseTitle.includes(lowerCaseSearchText) ||
    //                     lowerCaseDescription.includes(lowerCaseSearchText)
    //                 ) {
    //                     return item;
    //                 }
    //             }
    //         })
    //         .filter(Boolean);
    // };

    // const filteredCategories = cloneDeep(connectors).map((category) => {
    //     if (!category || !category.items) {
    //         return category;
    //     }
    //     category.items = filterItems(category.items);
    //     return category;
    // });

    
    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Container>
                    <Typography variant="h2">Configurable variables</Typography>
                    <S.Row>
                        <BodyText>
                            View and manage configurable variables in the Ballerina project.
                        </BodyText>

                        <Button appearance="primary">
                            <Codicon name="add" sx={{ marginRight: 5 }} />Add Config Variables
                        </Button>
                    </S.Row>




                    {
                        configVariables.length > 0 ?

                    <VSCodeDataGrid>
                        <VSCodeDataGridRow row-type="header">
                            <VSCodeDataGridCell cell-type="columnheader" grid-column={`1 + 1`}>
                                Variable
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCell cell-type="columnheader" grid-column={`1 + 1`}>
                                Type
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCell cell-type="columnheader" grid-column={`1 + 1`}>
                                Value
                            </VSCodeDataGridCell>
                            <VSCodeDataGridCell cell-type="columnheader" grid-column={`1 + 1`}>
                                &nbsp;
                            </VSCodeDataGridCell>
                        </VSCodeDataGridRow>

                        {
                            configVariables.map((variable, index) => {
                                return (
                                    <VSCodeDataGridRow key={variable.properties.variable.value + index}>
                                        <VSCodeDataGridCell grid-column={`1 + 1`}>{variable.properties.variable.value}</VSCodeDataGridCell>
                                        <VSCodeDataGridCell grid-column={`1 + 1`}>{variable.properties.type.value}</VSCodeDataGridCell>
                                        <VSCodeDataGridCell grid-column={`1 + 1`}>{
                                            variable.properties.defaultable.value &&
                                                variable.properties.defaultable.value !== "null" ?
                                                variable.properties.defaultable.value : null
                                        }</VSCodeDataGridCell>
                                        <VSCodeDataGridCell grid-column={`1 + 1`} style={{display: "flex"}}>
                                            <Codicon name="edit" onClick={(event) => handleConfigVariableFormOpen(index)}/>
                                            &nbsp;&nbsp;
                                            <Codicon name="trash"/>
                                        </VSCodeDataGridCell>
                                    </VSCodeDataGridRow>

                                );
                            })
                        }
                    </VSCodeDataGrid>
: null
                    }


{isConfigVariableFormOpen &&
                    <EditForm
                        isOpen={isConfigVariableFormOpen}
                        onClose={handleEditConfigFormClose}
                        variable={configVariables[configIndex]}
                        onSave={handleResourceFormSave}
                        />
                }


                    {/* {
                        configVariables.length === 0 ?
                        <Row>
                        <Button appearance="primary">
                        <Codicon name="add" sx={{ marginRight: 5 }} />Add Config Variables
                        </Button>
                    </Row>
                        :
                        <>
                        <S.Table>
                        <S.TableHead>
                            <S.TableRow>
                                <S.TableHeadCell>Variable</S.TableHeadCell>
                                <S.TableHeadCell>Type</S.TableHeadCell>
                                <S.TableHeadCell>Value</S.TableHeadCell>
                            </S.TableRow>
                        </S.TableHead>
                        <S.TableBody>
                            {
                                configVariables.map((variable, index) => {
                                    return (
                                        <S.TableRow key={variable.properties.variable.value + index}>
                                            <S.TableCell>{variable.properties.variable.value}</S.TableCell>
                                            <S.TableCell>{variable.properties.type.value}</S.TableCell>
                                            <S.TableCell>
                                                {
                                                    variable.properties.defaultable.value &&
                                                    variable.properties.defaultable.value !== "null" ?
                                                    variable.properties.defaultable.value : null
                                                }
                                            </S.TableCell>
                                        </S.TableRow>
                                    );
                                })
                            }
                        </S.TableBody>
                    </S.Table>

                    <Row>
                        <Button appearance="primary" onClick={handleUpdateConfigVariables}>
                            Update Config Variables
                        </Button>
                    </Row>
                        </>
                    } */}
















                    {/* <Row>
                <StyledSearchInput
                    value={searchText}
                    placeholder="Search"
                    autoFocus={true}
                    onChange={handleOnSearch}
                    size={60}
                    sx={{ width: "100%" }}
                />
            </Row> */}
                    {/* {isSearching && (
                <ListContainer style={{ height: '80vh', overflowY: 'scroll' }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <ProgressRing />
                    </div>
                </ListContainer>)} */}
                    {/* {filteredCategories && filteredCategories.length > 0 && (
                <ListContainer> */}
                    {/* Default connectors of LS is hardcoded and is sent with categories with item field */}
                    {/* {filteredCategories[0]?.items ? (
                        filteredCategories.map((category, index) => {
                            return (
                                <div key={category.metadata.label + index}>
                                    <Typography variant="h3">{category.metadata.label}</Typography>
                                    <GridContainer>
                                        {category.items?.map((connector, index) => {
                                            return (
                                                <ButtonCard
                                                    key={connector.metadata.label + index}
                                                    title={connector.metadata.label}
                                                    description={
                                                        (connector as AvailableNode).codedata.org +
                                                        " / " +
                                                        (connector as AvailableNode).codedata.module
                                                    }
                                                    icon={
                                                        connector.metadata.icon ? (
                                                            <img
                                                                src={connector.metadata.icon}
                                                                alt={connector.metadata.label}
                                                                style={{ width: "24px" }}
                                                            />
                                                        ) : (
                                                            <Codicon name="package" />
                                                        )
                                                    }
                                                    onClick={() => {
                                                        onSelectConnector(connector as AvailableNode);
                                                    }}
                                                />
                                            );
                                        })}
                                    </GridContainer>
                                </div>
                            );
                        })
                    ) : (
                        <GridContainer>
                            {connectors.map((item, index) => {
                                const connector = item as Item;
                                return (
                                    <ButtonCard
                                        key={connector.metadata.label + index}
                                        title={connector.metadata.label}
                                        description={
                                            (connector as AvailableNode).codedata.org +
                                            " / " +
                                            (connector as AvailableNode).codedata.module
                                        }
                                        icon={
                                            connector.metadata.icon ? (
                                                <img
                                                    src={connector.metadata.icon}
                                                    alt={connector.metadata.label}
                                                    style={{ width: "24px" }}
                                                />
                                            ) : (
                                                <Codicon name="package" />
                                            )
                                        }
                                        onClick={() => {
                                            onSelectConnector(connector as AvailableNode);
                                        }}
                                    />
                                );
                            })}

                        </GridContainer>
                    )} */}
                    {/* </ListContainer>
            )} */}
                    {/* {!isSearching && !connectors || (connectors.length === 0 && <p>No connectors found</p>)} */}
                </Container>
            </ViewContent>
        </View>
    );
}

export default ViewConfigurableVariables;
