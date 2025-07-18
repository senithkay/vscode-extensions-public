import { GetRecordConfigRequest, GetRecordConfigResponse, PropertyTypeMemberInfo, RecordSourceGenRequest, RecordSourceGenResponse, RecordTypeField, TypeField } from "@wso2/ballerina-core";
import { useRpcContext } from "@wso2/ballerina-rpc-client";
import { useSlidingPane } from "@wso2/ui-toolkit/lib/components/ExpressionEditor/components/Common/SlidingPane/context";
import { useEffect, useRef, useState } from "react";
import { RecordConfig } from "./RecordConfigView";
import { CompletionItem } from "@wso2/ui-toolkit";
import { getDefaultValue, isRowType } from "../Utils/types";
import ExpandableList from "../Components/ExpandableList";
import SelectableItem from "../Components/SelectableItem";

type CreateValuePageProps = {
    fileName: string;
    currentValue: string;
    onChange: (value: string, isRecordConfigureChange: boolean) => void;
    selectedType?: CompletionItem;
}

const passPackageInfoIfExists = (recordTypeMember: PropertyTypeMemberInfo) => {
    let org = "";
    let module = "";
    let version = "";
    if (recordTypeMember.packageInfo) {
        const parts = recordTypeMember.packageInfo.split(':');
        if (parts.length === 3) {
            [org, module, version] = parts;
        }
    }
    return { org, module, version }
}

const getPropertyMember = (field: RecordTypeField) => {
    return field?.recordTypeMembers.at(0);
}

export const CreateValue = (props: CreateValuePageProps) => {
    const { fileName, currentValue, onChange, selectedType } = props;
    const [recordModel, setRecordModel] = useState<TypeField[]>([]);
    //remove this
    const [show, setShow] = useState(false);

    const { rpcClient } = useRpcContext();

    const { getParams } = useSlidingPane();
    const params = getParams() as RecordTypeField;
    //RCD
    const propertyMember = getPropertyMember(params)

    const sourceCode = useRef<string>(currentValue);

    const fetchRecordModel = async () => {
        const packageInfo = passPackageInfoIfExists(params?.recordTypeMembers.at(0))
        const request: GetRecordConfigRequest = {
            filePath: fileName,
            codedata: {
                org: packageInfo.org,
                module: packageInfo.module,
                version: packageInfo.version,
                packageName: propertyMember?.packageName,
            },
            typeConstraint: propertyMember?.type,
        }
        const typeFieldResponse: GetRecordConfigResponse = await rpcClient.getBIDiagramRpcClient().getRecordConfig(request);
        if (typeFieldResponse.recordConfig) {
            const recordConfig: TypeField = {
                name: propertyMember?.type,
                ...typeFieldResponse.recordConfig
            }

            setRecordModel([recordConfig]);
        }
    }

    const handleModelChange = async (updatedModel: TypeField[]) => {
        const request: RecordSourceGenRequest = {
            filePath: fileName,
            type: updatedModel[0]
        }
        const recordSourceResponse: RecordSourceGenResponse = await rpcClient.getBIDiagramRpcClient().getRecordSource(request);
        console.log(">>> recordSourceResponse", recordSourceResponse);

        if (recordSourceResponse.recordValue !== undefined) {
            const content = recordSourceResponse.recordValue;
            sourceCode.current = content;
            onChange(content, true);
        }
    }


    useEffect(() => {
        fetchRecordModel()
    }, []);

    return (
        isRowType(selectedType) ? <RecordConfig
            recordModel={recordModel}
            onModelChange={handleModelChange}
        /> : <NonRecordCreateValue
            fileName={fileName}
            currentValue={currentValue}
            onChange={onChange}
            selectedType={selectedType}
        />
    )
}

const NonRecordCreateValue = (props: CreateValuePageProps) => {
    const { fileName, currentValue, onChange, selectedType } = props;

    const handleValueSelect = (value: string) => {
        console.log("value", value)
    }

    const defaultValue = getDefaultValue(selectedType);
    return (
        <>
            {defaultValue  && (
                <ExpandableList>
                    <SelectableItem onClick={() => { handleValueSelect(defaultValue) }} className="selectable-list-item">
                        <ExpandableList.Item sx={{ width: "100%" }}>
                            {defaultValue}
                        </ExpandableList.Item>
                    </SelectableItem>
                </ExpandableList>
            )}
        </>
    );
}
