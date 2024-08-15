/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
    Button,
    SidePanel,
    SidePanelTitleContainer,
    SidePanelBody,
    Codicon
} from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

import { useDMIOConfigPanelStore, useDMSubMappingConfigPanelStore } from "../../../../store/store";
import { ImportDataButtons } from "./ImportDataButtons";
import { ImportCustomTypePanel } from "./ImportCustomTypePanel";

export interface ImportType {
    type: string;
    label: string;
}

export enum FileExtension {
    JSON = ".json",
    XML = ".xml",
    CSV = ".csv"
}

export type ImportCustomTypeFormProps = {
    configName: string;
    documentUri: string;
    setIsImportCustomTypeFormOpen: Dispatch<SetStateAction<boolean>>;
};

export function ImportCustomTypeForm(props: ImportCustomTypeFormProps) {
    const { configName, documentUri, setIsImportCustomTypeFormOpen } = props;
    const { rpcClient } = useVisualizerContext();

    const [selectedImportType, setSelectedImportType] = useState<ImportType>(undefined);

    const { subMappingConfig, setSubMappingConfig } = useDMSubMappingConfigPanelStore(state => ({
        subMappingConfig: state.subMappingConfig,
        setSubMappingConfig: state.setSubMappingConfig
    }));

    const fileExtension = useMemo(() => {
        if (!selectedImportType) return undefined;

        switch (selectedImportType.type) {
            case 'JSON':
                return FileExtension.JSON;
            case 'CSV':
                return FileExtension.CSV;
            case 'XML':
                return FileExtension.XML;
            case 'JSONSCHEMA':
                return FileExtension.JSON;
        }
    }, [selectedImportType]);


    const loadSchema = async (typeName: string, content: string) => {
        const request = {
            documentUri: documentUri,
            overwriteSchema: false,
            resourceName: 'Schema', //TODO: unused property need to remove
            content: content,
            ioType: "custom", //TODO: use enum 
            schemaType: selectedImportType.type.toLowerCase(),
            configName: configName,
            typeName: typeName
        }
        await rpcClient.getMiDataMapperRpcClient().browseSchema(request).then(response => {
            setSelectedImportType(undefined);
            setIsImportCustomTypeFormOpen(false);
            if (response.success) {
                console.log("Schema imported successfully");
            } else {
                console.error("Error while importing schema");
            }
        }).catch(e => {
            console.error("Error while importing schema", e);
        });
    };

    const handleFileUpload = (typeName: string, text: string) => {
        loadSchema(typeName, text);
    };

    const onClose = () => {
        setSelectedImportType(undefined);
        setIsImportCustomTypeFormOpen(false);
        setSubMappingConfig({
            ...subMappingConfig,
            isSMConfigPanelOpen: false
        });
    };

    const onBack = () => {
        if (!selectedImportType)
            setIsImportCustomTypeFormOpen(false);
        setSelectedImportType(undefined);
    };

    const handleImportTypeChange = (importType: ImportType) => {
        setSelectedImportType(importType);
    };

    return (
        <>
            <SidePanelTitleContainer>
                <Button
                    onClick={onBack}
                    appearance="icon"
                >
                    <Codicon name="arrow-left" />
                </Button>
                <span style={{padding:10}}>Import custom data type</span>
                <Button
                    sx={{ marginLeft: "auto" }}
                    onClick={onClose}
                    appearance="icon"
                >
                    <Codicon name="close" />
                </Button>
            </SidePanelTitleContainer>
            <SidePanelBody>
                {!selectedImportType && <ImportDataButtons onImportTypeChange={handleImportTypeChange} />}
                {selectedImportType && (
                    <ImportCustomTypePanel
                        importType={selectedImportType}
                        extension={fileExtension}
                        rowRange={{ start: 15, offset: 10 }}
                        onSave={handleFileUpload}
                    />
                )}
            </SidePanelBody>
        </>
    );
}
