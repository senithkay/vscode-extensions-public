import { CompletionInsertText, ConfigVariable, FlowNode, LineRange, TomalPackage } from "@wso2/ballerina-core";
import { useRpcContext } from "@wso2/ballerina-rpc-client";
import { ReactNode, useEffect, useState } from "react";
import ExpandableList from "../Components/ExpandableList";
import { SlidingPaneNavContainer } from "@wso2/ui-toolkit/lib/components/ExpressionEditor/components/Common/SlidingPane";
import { COMPLETION_ITEM_KIND, Divider, getIcon, ThemeColors } from "@wso2/ui-toolkit";
import { ScrollableContainer } from "../Components/ScrollableContainer";
import DynamicModal from "../Components/Modal";
import FooterButtons from "../Components/FooterButtons";
import FormGenerator from "../../Forms/FormGenerator";
import { URI, Utils } from "vscode-uri";


type ConfigVariablesState = {
    [category: string]: {
        [module: string]: ConfigVariable[];
    };
};

type ListItem = {
    name: string;
    items: any[]
}

type ConfigurablesPageProps = {
    onChange: (insertText: string | CompletionInsertText, isRecordConfigureChange?: boolean) => void;
    isInModal?: boolean;
    anchorRef: React.RefObject<HTMLDivElement>;
    fileName: string;
    targetLineRange: LineRange;
    projectPath?: string;
}



export const Configurables = (props: ConfigurablesPageProps) => {
    const { onChange, anchorRef, fileName, targetLineRange, projectPath } = props;

    const { rpcClient } = useRpcContext();
    const [configVariables, setConfigVariables] = useState<ConfigVariablesState>({});
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [configVarNode, setCofigVarNode] = useState<FlowNode>();
    const [isSaving, setIsSaving] = useState(false);
    const [packageInfo, setPackageInfo] = useState<TomalPackage>();


    useEffect(() => {
        const fetchNode = async () => {
            const node = await rpcClient.getBIDiagramRpcClient().getConfigVariableNodeTemplate({
                isNew: true
            });
            console.log("node: ", node)
            setCofigVarNode(node.flowNode);
        };

        fetchNode();
    }, []);

    useEffect(() => {
        getConfigVariables()
    }, [])

    useEffect(() => {
        const fetchTomlValues = async () => {
            try {
                const tomValues = await rpcClient.getCommonRpcClient().getCurrentProjectTomlValues();
                setPackageInfo(tomValues?.package);
            } catch (error) {
                console.error("Failed to fetch TOML values:", error);
                setPackageInfo({
                    org: "",
                    name: "",
                    version: ""
                });
            }
        };

        fetchTomlValues();
    }, []);


    const getConfigVariables = async () => {

        let data: ConfigVariablesState = {};
        let errorMsg: string = '';

        await rpcClient
            .getBIDiagramRpcClient()
            .getConfigVariablesV2()
            .then((variables) => {
                data = (variables as any).configVariables;
                errorMsg = (variables as any).errorMsg;
            });

        setConfigVariables(data);
        console.log(translateToArrayFormat(data))
        setErrorMessage(errorMsg);
        console.log(data)
    };

    const handleFormClose = () => {
        setIsModalOpen(false)
    }

    const handleSave = async (node: FlowNode) => {
        setIsSaving(true);
        await rpcClient.getBIDiagramRpcClient().updateConfigVariablesV2({
            configFilePath: Utils.joinPath(URI.file(projectPath), 'config.bal').fsPath,
            configVariable: node,
            packageName: `${packageInfo.org}/${packageInfo.name}`,
            moduleName: "",
        }).finally(() => {
            handleFormClose()
            setIsSaving(false);
            getConfigVariables
        });
    };

    const translateToArrayFormat = (object: object): ListItem[] => {
        if (Array.isArray(object)) return object;
        const keys = Object.keys(object);
        return keys.map((key): { name: string; items: object[] } => {
            return {
                name: key,
                items: translateToArrayFormat((object as Record<string, object>)[key])
            }
        });
    }

    const handleSubmit = (updatedNode?: FlowNode, isDataMapperFormUpdate?: boolean) => {

        // newNodeNameRef.current = "";
        // // Safely extract the variable name as a string, fallback to empty string if not available
        // const varName = typeof updatedNode?.properties?.variable?.value === "string"
        //     ? updatedNode.properties.variable.value
        //     : "";
        // newNodeNameRef.current = varName;
        // handleOnFormSubmit?.(updatedNode, isDataMapperFormUpdate, { shouldCloseSidePanel: false, shouldUpdateTargetLine: true });
        // if (isModalOpen) {
        //     setIsModalOpen(false)
        //     getVariableInfo();
        // }
    };

    const handleItemClicked = (name: string) => {
        onChange(name, true)
    }
    return (
        <div>
            <ScrollableContainer>
                <ExpandableList>
                    {translateToArrayFormat(configVariables)
                        .filter(category =>
                            Array.isArray(category.items) &&
                            category.items.some(sub => Array.isArray(sub.items) && sub.items.length > 0)
                        )
                        .map(category => (
                            <ExpandableList.Section
                                sx={{ marginTop: '20px' }}
                                key={category.name}
                                title={category.name}
                                level={0}
                            >
                                <div style={{ marginTop: '10px' }}>
                                    {category.items
                                        .filter(subCategory => subCategory.items && subCategory.items.length > 0)
                                        .map(subCategory => (
                                            <>
                                                {subCategory.name !== '' ? <>
                                                    <ExpandableList.Section
                                                        sx={{ marginTop: '20px' }}
                                                        key={subCategory.name}
                                                        title={subCategory.name}
                                                        level={1}
                                                    >
                                                        <div style={{ marginTop: '10px' }}>
                                                            {subCategory.items.map((item: ConfigVariable) => (
                                                                <SlidingPaneNavContainer key={item.id}>
                                                                    <ExpandableList.Item sx={{ color: ThemeColors.ON_SURFACE }} onClick={() => { handleItemClicked(item?.properties?.variable?.value as string) }}>
                                                                        {getIcon(COMPLETION_ITEM_KIND.Parameter)}
                                                                        {item?.properties?.variable?.value as ReactNode}
                                                                    </ExpandableList.Item>
                                                                </SlidingPaneNavContainer>
                                                            ))}
                                                        </div>
                                                    </ExpandableList.Section>
                                                </> : <>
                                                    {subCategory.items.map((item: ConfigVariable) => (
                                                        <SlidingPaneNavContainer key={item.id}>
                                                            <ExpandableList.Item sx={{ color: ThemeColors.ON_SURFACE }} onClick={() => { handleItemClicked(item?.properties?.variable?.value as string) }}>
                                                                {getIcon(COMPLETION_ITEM_KIND.Parameter)}
                                                                {item?.properties?.variable?.value as ReactNode}
                                                            </ExpandableList.Item>
                                                        </SlidingPaneNavContainer>
                                                    ))}</>}
                                            </>
                                        ))}
                                </div>
                            </ExpandableList.Section>
                        ))}
                </ExpandableList>
            </ScrollableContainer>
            {<div style={{ marginTop: "auto", display: 'flex', flexDirection: 'column' }}>
                <Divider />
                <DynamicModal
                    width={400}
                    height={600}
                    anchorRef={anchorRef}
                    title="New Configurable"
                    openState={isModalOpen}
                    setOpenState={setIsModalOpen}>
                    <DynamicModal.Trigger>
                        <FooterButtons startIcon='add' title="New Configurable" />
                    </DynamicModal.Trigger>
                    <FormGenerator
                        fileName={fileName}
                        node={configVarNode}
                        connections={[]}
                        targetLineRange={targetLineRange}
                        projectPath={projectPath}
                        editForm={false}
                        onSubmit={handleSave}
                        showProgressIndicator={false}
                        resetUpdatedExpressionField={() => { }}
                        isInModal={true}
                    />
                </DynamicModal>
                {/* <DynamicModal
                    width={400}
                    height={600}
                    anchorRef={anchorRef}
                    title="Declare Variable"
                    openState={isModalOpen}
                    setOpenState={setIsModalOpen}>
                    <DynamicModal.Trigger>
                        <FooterButtons startIcon='add' title="Import from ENV" />
                    </DynamicModal.Trigger>
                </DynamicModal> */}
            </div>}
        </div>


    )
}