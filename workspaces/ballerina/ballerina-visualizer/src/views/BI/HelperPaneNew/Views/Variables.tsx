import { useSlidingPane } from "@wso2/ui-toolkit/lib/components/ExpressionEditor/components/Common/SlidingPane/context"
import { ExpandableList } from "../Components/ExpandableList"
import { VariableTypeIndifcator } from "../Components/VariableTypeIndicator"
import { SlidingPaneNavContainer } from "@wso2/ui-toolkit/lib/components/ExpressionEditor/components/Common/SlidingPane"
import { useRpcContext } from "@wso2/ballerina-rpc-client"
import { ExpressionProperty, FlowNode, LineRange, TriggerCharacter } from "@wso2/ballerina-core"
import { Divider, HelperPaneCustom, SearchBox } from "@wso2/ui-toolkit"
import { useCallback, useEffect, useRef, useState } from "react"
import { HelperPaneCompletionItem, HelperPaneVariableInfo } from "@wso2/ballerina-side-panel"
import { debounce } from "lodash"
import { convertToHelperPaneVariable, filterHelperPaneVariables } from "../../../../utils/bi"
import FooterButtons from "../Components/FooterButtons"
import DynamicModal from "../Components/Modal"
import { FormGenerator } from "../../Forms/FormGenerator"
import { ScrollableContainer } from "../Components/ScrollableContainer"

type VariablesPageProps = {
    fileName: string;
    debouncedRetrieveCompletions?: (value: string, property: ExpressionProperty, offset: number, triggerCharacter?: string) => Promise<void>;
    onChange: (value: string, isRecordConfigureChange: boolean) => void;
    targetLineRange: LineRange;
    anchorRef: React.RefObject<HTMLDivElement>; 
    projectPath?: string;
    handleOnFormSubmit?: (updatedNode?: FlowNode, isDataMapperFormUpdate?: boolean) => void;
}


export const Variables = (props: VariablesPageProps) => {
    const { fileName, targetLineRange, onChange, anchorRef, projectPath, handleOnFormSubmit } = props;
    const [searchValue, setSearchValue] = useState<string>("");
    const { rpcClient } = useRpcContext();
    const { getParams } = useSlidingPane();
    const [showProgressIndicator, setShowProgressIndicator] = useState(false);
    const data = getParams();
    const firstRender = useRef<boolean>(true);
    const [variableInfo, setVariableInfo] = useState<HelperPaneVariableInfo | undefined>(undefined);
    const [filteredVariableInfo, setFilteredVariableInfo] = useState<HelperPaneVariableInfo | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [fieldsOfRecordTYpe, setFieldsOfRecordType] = useState<any[] | undefined>(undefined);

    const getVariableInfo = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            rpcClient
                .getBIDiagramRpcClient()
                .getVisibleVariableTypes({
                    filePath: fileName,
                    position: {
                        line: targetLineRange.startLine.line,
                        offset: targetLineRange.startLine.offset
                    }
                })
                .then((response) => {
                    if (response.categories?.length) {
                        const convertedHelperPaneVariable = convertToHelperPaneVariable(response.categories);
                        setVariableInfo(convertedHelperPaneVariable);
                        setFilteredVariableInfo(convertedHelperPaneVariable);
                    }
                })
                .then(() => setIsLoading(false));
        }, 150);
    }, [rpcClient, fileName, targetLineRange]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            getVariableInfo();
        }
    }, []);

    const debounceFilterVariables = useCallback(
        debounce((searchText: string) => {
            setFilteredVariableInfo(filterHelperPaneVariables(variableInfo, searchText));
            setIsLoading(false);
        }, 150),
        [variableInfo, setFilteredVariableInfo, setIsLoading, filterHelperPaneVariables, searchValue]
    );

    const handleSearch = (searchText: string) => {
        setSearchValue(searchText);
        setIsLoading(true);
        debounceFilterVariables(searchText);
    };

    const getFieldsOfRecordTypes = async () => {
        return [
            {
                "label": "var1",
                "type": "record"
            },
        ]
    }

    const handleRecordTypeSelect = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const fieldsOfRecordTypeFetched = await getFieldsOfRecordTypes();
        setFieldsOfRecordType(fieldsOfRecordTypeFetched)
    }

    const ExpandableListItems = () => {
        if (data && fieldsOfRecordTYpe && Array.isArray(fieldsOfRecordTYpe)) {
            return (
                <>
                    {
                        fieldsOfRecordTYpe.map((item: HelperPaneCompletionItem) => (
                            item.isRow ?
                                <SlidingPaneNavContainer to="VARIABLES" data={fieldsOfRecordTYpe}>
                                    <ExpandableList.Item onClick={handleRecordTypeSelect}>
                                        <span>{item.label}</span>
                                        <VariableTypeIndifcator type={item.type} />
                                    </ExpandableList.Item>
                                </SlidingPaneNavContainer>
                                :
                                <SlidingPaneNavContainer>

                                    <ExpandableList.Item>
                                        <span>{item.label}</span>
                                        <VariableTypeIndifcator type={item.type} />
                                    </ExpandableList.Item>

                                </SlidingPaneNavContainer>
                        ))
                    }
                </>
            )
        }

        return (
            <>
                {filteredVariableInfo?.category.map((cat) => (
                    <>
                        {
                            cat.items.map((item) => (
                                item.isRow ?
                                    <SlidingPaneNavContainer to="VARIABLES" data>
                                        <ExpandableList.Item onClick={handleRecordTypeSelect}>
                                            <span>{item.label}</span>
                                            <VariableTypeIndifcator type={item.type} />
                                        </ExpandableList.Item>
                                    </SlidingPaneNavContainer>
                                    :
                                    <SlidingPaneNavContainer>

                                        <ExpandableList.Item>
                                            <span>{item.label}</span>
                                            <VariableTypeIndifcator type={item.type} />
                                        </ExpandableList.Item>

                                    </SlidingPaneNavContainer>
                            ))
                        }
                    </>
                ))}
            </>
        )
    }

    const selectedNode: FlowNode = {
        codedata: {
            node: 'VARIABLE',
            isNew: true,
        },
        flags: 0,
        id: "31",
        metadata: {
            label: 'Declare Variable',
            description: 'New variable with type'
        },
        properties: {
            variable: {
                metadata: {
                    label: "Name",
                    description: "Name of the variable",
                },
                valueType: "IDENTIFIER",
                value: "var1",
                optional: false,
                editable: true,
                advanced: false,
                hidden: false,
            },
            type: {
                metadata: {
                    label: "Type",
                    description: "Type of the variable",
                },
                valueType: "TYPE",
                value: "",
                placeholder: "var",
                optional: false,
                editable: true,
                advanced: false,
                hidden: false,
            },
            expression: {
                metadata: {
                    label: "Expression",
                    description: "Expression of the variable",
                },
                valueType: "ACTION_OR_EXPRESSION",
                value: "",
                optional: false,
                editable: true,
                advanced: false,
                hidden: false,
            },
        },
        returning: false,
        branches: []
    };

    const testSubmit = () => {
        console.log(">>> Test submit");
        handleOnFormSubmit(selectedNode, false);
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden"
        }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "10px" }}>
                <SearchBox sx={{ width: "100%" }} placeholder='Search' autoFocus={true} value={searchValue} onChange={handleSearch} />
            </div>

            <ScrollableContainer>
                {isLoading ? (
                    <HelperPaneCustom.Loader />
                ) : (
                    <ExpandableList>
                        <ExpandableListItems />
                    </ExpandableList>
                )}
            </ScrollableContainer>

            <div style={{ marginTop: "auto" }}>
                <Divider />
                <DynamicModal width={400} height={600} anchorRef={anchorRef} title="Dynamic Modal">
                    <DynamicModal.Trigger>
                        <FooterButtons startIcon='add' title="New Variable" />
                    </DynamicModal.Trigger>
                    <FormGenerator
                        fileName={fileName}
                        node={selectedNode}
                        connections={[]}
                        targetLineRange={targetLineRange}
                        projectPath={projectPath}
                        editForm={false}
                        onSubmit={handleOnFormSubmit}
                        showProgressIndicator={false}
                        resetUpdatedExpressionField={()=>{}}
                        helperPaneZIndex={40000}
                    />
                </DynamicModal>
            </div>
        </div>
    )

    // return (
    //     <ExpandableList>
    //         { filteredVariableInfo?.category.map((variable) => (
    //             variable.kind !== "type-parameter" ?
    //                 <SlidingPaneNavContainer>
    //                     <ExpandableList.Item>
    //                         <span>{params}</span>
    //                         <VariableTypeIndifcator type={variable.kind} />
    //                     </ExpandableList.Item>
    //                 </SlidingPaneNavContainer>
    //                 :
    //                 <SlidingPaneNavContainer to="PAGE3" data>
    //                     <ExpandableList.Item>
    //                         <VariableTypeIndifcator type={variable.kind} />
    //                         <span>{variable.label}</span>
    //                     </ExpandableList.Item>
    //                 </SlidingPaneNavContainer>
    //         ))}
    //     </ExpandableList>
    // )


    // return (
    //     <>
    //         <HelperPane.Header
    //             searchValue={searchValue}
    //             onSearch={handleSearch}
    //             titleSx={{ fontFamily: "GilmerRegular" }}
    //         />
    //         <HelperPane.Body>
    //             {defaultValue && (
    //                 <HelperPane.Section
    //                     title="Suggestions"
    //                     titleSx={{ fontFamily: "GilmerMedium" }}
    //                 >
    //                     <HelperPane.CompletionItem
    //                         label={defaultValue}
    //                         onClick={() => onChange(defaultValue)}
    //                         getIcon={() => getIcon(COMPLETION_ITEM_KIND.Snippet)}
    //                     />
    //                 </HelperPane.Section>
    //             )}
    //             {isLoading ? (
    //                 <HelperPane.Loader />
    //             ) : (
    //                 filteredVariableInfo?.category.map((category) => {
    //                     if (category.items.length === 0) {
    //                         return null;
    //                     }

    //                     return (
    //                         <HelperPaneCustom.Section
    //                             key={category.label}
    //                             title={category.label}
    //                             titleSx={{ fontFamily: 'GilmerMedium' }}
    //                         >
    //                             {category.items.map((item) => (
    //                                 <HelperPaneCustom.CompletionItem
    //                                     key={`${category.label}-${item.label}`}
    //                                     label={item.label}
    //                                     type={item.type}
    //                                     onClick={() => onChange(item.label)}
    //                                     getIcon={() => getIcon(item.type as CompletionItemKind)}
    //                                 />
    //                             ))}
    //                         </HelperPaneCustom.Section>
    //                     );
    //                 })
    //             )}
    //         </HelperPane.Body>
    //     </>
    // );
}