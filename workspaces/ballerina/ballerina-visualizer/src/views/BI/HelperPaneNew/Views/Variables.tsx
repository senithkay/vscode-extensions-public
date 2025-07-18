import { useSlidingPane } from "@wso2/ui-toolkit/lib/components/ExpressionEditor/components/Common/SlidingPane/context"
import { ExpandableList } from "../Components/ExpandableList"
import { VariableTypeIndifcator } from "../Components/VariableTypeIndicator"
import { SlidingPaneNavContainer } from "@wso2/ui-toolkit/lib/components/ExpressionEditor/components/Common/SlidingPane"
import { useRpcContext } from "@wso2/ballerina-rpc-client"
import { ELineRange, ExpressionProperty, FlowNode, LinePosition, LineRange, TriggerCharacter } from "@wso2/ballerina-core"
import { CompletionItem, Divider, HelperPaneCustom, SearchBox } from "@wso2/ui-toolkit"
import { useCallback, useEffect, useRef, useState } from "react"
import { HelperPaneCompletionItem, HelperPaneVariableInfo } from "@wso2/ballerina-side-panel"
import { debounce, find } from "lodash"
import { convertToHelperPaneVariable, filterHelperPaneVariables } from "../../../../utils/bi"
import FooterButtons from "../Components/FooterButtons"
import DynamicModal from "../Components/Modal"
import { FormGenerator } from "../../Forms/FormGenerator"
import { ScrollableContainer } from "../Components/ScrollableContainer"
import { isUnionType } from "../Utils/types"
import { FormSubmitOptions } from "../../FlowDiagram"

type VariablesPageProps = {
    fileName: string;
    debouncedRetrieveCompletions?: (value: string, property: ExpressionProperty, offset: number, triggerCharacter?: string) => Promise<void>;
    onChange: (value: string, isRecordConfigureChange: boolean) => void;
    targetLineRange: LineRange;
    anchorRef: React.RefObject<HTMLDivElement>; 
    projectPath?: string;
    handleOnFormSubmit?: (updatedNode?: FlowNode, isDataMapperFormUpdate?: boolean, options?: FormSubmitOptions) => void;
    selectedType?: CompletionItem;
    setTargetLineRange?: (targetLineRange: LineRange) => void;
}


export const Variables = (props: VariablesPageProps) => {
    const { fileName, targetLineRange, onChange, anchorRef, projectPath, handleOnFormSubmit, selectedType ,  setTargetLineRange} = props;
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
    const newNodeNameRef = useRef<string>("");

    console.log("recordFieldType", data)

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

    const updateLineRangeForRecursiveInserts = (nodes: FlowNode[]) => {
        setTargetLineRange(getUpdatedTargetLineRangeForRecursiveInserts(nodes));
    }

    const handleSubmit = (updatedNode?: FlowNode, isDataMapperFormUpdate?: boolean) => {
        newNodeNameRef.current = "";
        // Safely extract the variable name as a string, fallback to empty string if not available
        const varName = typeof updatedNode?.properties?.variable?.value === "string"
            ? updatedNode.properties.variable.value
            : "";
        newNodeNameRef.current = varName;
        handleOnFormSubmit?.(updatedNode, isDataMapperFormUpdate, { shouldCloseSidePanel: false, updateLineRangeForRecursiveInserts });
    };

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


    const getTypeDef = () => {
        if (isUnionType(selectedType)) {
            return ({
                metadata: {
                    label: "Type",
                    description: "Type of the variable",
                },
                valueType: "SINGLE_SELECT",
                value: selectedType?.label || "",
                placeholder: "var",
                optional: false,
                editable: true,
                advanced: false,
                hidden: false,
                valueTypeConstraint: ["int", "float", "string", "boolean", "record"],
            })
        }

        return (
            {
                metadata: {
                    label: "Type",
                    description: "Type of the variable",
                },
                valueType: "TYPE",
                value: data?.property?.valueTypeConstraint,
                placeholder: "var",
                optional: false,
                editable: false,
                advanced: false,
                hidden: false,
            }
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
            type: getTypeDef(),
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

    const findNodeWithName = (node: FlowNode, name: string) => {
        return node?.properties?.variable?.value === name;
    }

    const searchNodes = (nodes: FlowNode[], name: string): FlowNode | undefined => {
        for (const node of nodes) {
            if (findNodeWithName(node, name)) {
                return node;
            }
            if (node.branches && node.branches.length > 0) {
                for (const branch of node.branches) {
                    if (branch.children && branch.children.length > 0) {
                        const foundNode = searchNodes(branch.children, name);
                        if (foundNode) {
                            return foundNode;
                        }
                    }
                }
            }
        }
        return undefined;
    };

    const getUpdatedTargetLineRangeForRecursiveInserts = (nodes: FlowNode[]) => {
        const insertedNode = searchNodes(nodes, newNodeNameRef.current);
        if (!insertedNode) return ;

        const updatedTargetLineRange: ELineRange = {
            startLine: {
                line: insertedNode.codedata.lineRange.endLine.line,
                offset: insertedNode.codedata.lineRange.endLine.offset
            },
            endLine: {
                line: insertedNode.codedata.lineRange.endLine.line,
                offset: insertedNode.codedata.lineRange.endLine.offset
            },
            fileName: insertedNode.codedata.lineRange.fileName
        }
        return updatedTargetLineRange;
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
                        onSubmit={handleSubmit}
                        showProgressIndicator={false}
                        resetUpdatedExpressionField={()=>{}}
                        helperPaneZIndex={40000}
                    />
                </DynamicModal>
            </div>
        </div>
    )
}