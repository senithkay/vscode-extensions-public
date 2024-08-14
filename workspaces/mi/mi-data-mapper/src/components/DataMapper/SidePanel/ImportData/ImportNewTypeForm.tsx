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
import { ImportNewTypePanel } from "./ImportNewTypePanel";

export interface ImportType {
    type: string;
    label: string;
}

export enum FileExtension {
    JSON = ".json",
    XML = ".xml",
    CSV = ".csv"
}

export type ImportDataWizardProps = {
    configName: string;
    documentUri: string;
    setImportNewTypeFormOpen: Dispatch<SetStateAction<boolean>>;
};

export function ImportNewTypeForm(props: ImportDataWizardProps) {
    const { configName, documentUri, setImportNewTypeFormOpen } = props;
    const { rpcClient } = useVisualizerContext();

    const [selectedImportType, setSelectedImportType] = useState<ImportType>(undefined);


    const { isOpen, ioType, overwriteSchema, setSidePanelOpen } = useDMIOConfigPanelStore(state => ({
        isOpen: state.isIOConfigPanelOpen,
        ioType: state.ioConfigPanelType,
        overwriteSchema: state.isSchemaOverridden,
        setSidePanelOpen: state.setIsIOConfigPanelOpen
    }));

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


    const loadSchema = async (content: string) => {
        const request = {
            documentUri: documentUri,
            overwriteSchema: overwriteSchema,
            resourceName: configName + '_' + ioType.toLowerCase() + 'Schema',
            content: content,
            ioType: ioType.toUpperCase(),
            schemaType: selectedImportType.type.toLowerCase(),
            configName: configName,
        }
        await rpcClient.getMiDataMapperRpcClient().browseSchema(request).then(response => {
            setSidePanelOpen(false);
            if (response.success) {
                console.log("Schema imported successfully");
            } else {
                console.error("Error while importing schema");
            }
        }).catch(e => {
            console.error("Error while importing schema", e);
        });
    };

    const handleFileUpload = (text: string) => {
        loadSchema(text);
    };

    const onClose = () => {
        setSelectedImportType(undefined);
        setImportNewTypeFormOpen(false);
        setSubMappingConfig({
            ...subMappingConfig,
            isSMConfigPanelOpen: false
        });
    };

    const onBack = () => {
        setSelectedImportType(undefined);
        // setSidePanelOpen(false);
        if(!selectedImportType)
        setImportNewTypeFormOpen(false);
    };

    const handleImportTypeChange = (importType: ImportType) => {
        setSelectedImportType(importType);
    };

    return (
        <>
            <SidePanelTitleContainer>
                <Codicon name="arrow-left"
                    sx={{ width: "20px" }}
                    onClick={onBack}
                />
                <span>{`${overwriteSchema ? "Change" : "Import"} data type`}</span>
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
                    <ImportNewTypePanel
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
