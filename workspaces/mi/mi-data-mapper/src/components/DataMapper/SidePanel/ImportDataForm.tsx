/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import {
    Button,
    SidePanel,
    SidePanelTitleContainer,
    SidePanelBody,
    Codicon
} from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

import { useDMIOConfigPanelStore } from "../../../store/store";
import { ImportDataButtons } from "./ImportDataButtons";
import { ImportDataPanel } from "./ImportDataPanel";

export type ImportDataWizardProps = {
    configName: string;
    documentUri: string;
};

export function ImportDataForm(props: ImportDataWizardProps) {
    const { configName, documentUri } = props;
    const { rpcClient } = useVisualizerContext();

    const [selectedImportType, setSelectedImportType] = useState<string>(undefined);

    const { isOpen, ioType, overwriteSchema, setSidePanelOpen } = useDMIOConfigPanelStore(state => ({
        isOpen: state.isIOConfigPanelOpen,
        ioType: state.ioConfigPanelType,
        overwriteSchema: state.isSchemaOverridden,
        setSidePanelOpen: state.setIsIOConfigPanelOpen
    }));

    const loadSchema = async () => {
        const request = {
            documentUri: documentUri,
            overwriteSchema: overwriteSchema,
            resourceName: configName + '_' + ioType.toLowerCase() + 'Schema',
            sourcePath: documentUri,
            ioType: ioType.toUpperCase(),
            schemaType: selectedImportType.toLowerCase(),
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

    const onClose = () => {
        setSelectedImportType(undefined);
        setSidePanelOpen(false);
    };

    const handleImportTypeChange = (importType: string) => {
        setSelectedImportType(importType);
    };

    return (
        <SidePanel
            isOpen={isOpen}
            alignment="right"
            width={312}
            overlay={false}
        >
            <SidePanelTitleContainer>
                {selectedImportType && (
                    <Codicon name="arrow-left"
                        sx={{ width: "20px"}}
                        onClick={() => setSelectedImportType(undefined)}
                    />
                )}
                <span>Import {ioType} Schema</span>
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
                    <ImportDataPanel
                        importType={selectedImportType}
                        rowRange={{ start: 5, offset: 10 }}
                    />
                )}
            </SidePanelBody>
        </SidePanel>
    );
}
