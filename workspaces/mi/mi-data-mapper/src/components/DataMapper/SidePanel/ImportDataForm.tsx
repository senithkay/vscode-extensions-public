/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import {
    Button,
    SidePanel,
    SidePanelTitleContainer,
    SidePanelBody,
    Codicon,
    AutoComplete,
    ComponentCard
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { useDMSidePanelStore } from "../../../store/store";

const SidePanelBodyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const cardStyle = { 
    display: "block",
    margin: "15px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
 };

 const Field = styled.div`
   margin-bottom: 12px;
`;

export type ImportDataWizardProps = {
    isOpen: boolean;
    onCancel: () => void;
    configName: string;
    documentUri: string;
    ioType: string;
    overwriteSchema: boolean;
};


export function ImportDataForm(props: ImportDataWizardProps) {
    const { configName, documentUri, ioType, overwriteSchema } = props;
    const { rpcClient } = useVisualizerContext();
    const setSidePanelOpen = useDMSidePanelStore(state => state.setSidePanelOpen);
    const [selectedResourceType, setSelectedResourceType] = React.useState<string>("JSON");

    const loadSchema = async () => {
        const request = {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            defaultUri: "",
            title: "Select a file to be imported as registry resource",
            overwriteSchema: overwriteSchema,
        }
        await rpcClient.getMiDataMapperRpcClient().browseSchema(request).then(response => {
            const filePathStr = response.filePath;
            setSidePanelOpen(false);
            rpcClient.getMiDiagramRpcClient().getProjectRoot({ path: documentUri })
                .then(response => {
                    const request = {
                        importPath: filePathStr,
                        resourceName: configName + '_' + ioType.toLowerCase() + 'Schema',
                        sourcePath: documentUri,
                        ioType: ioType.toUpperCase(),
                        schemaType: selectedResourceType.toLowerCase(),
                    }
                    rpcClient.getMiDataMapperRpcClient().importDMSchema(request).then(response => {
                        rpcClient.getMiDataMapperRpcClient().updateDMC({
                            sourcePath: documentUri,
                            dmName: configName,
                        });
                    });
                })
            
        }).catch(e => {
            console.error("Error while importing schema", e);
        });
    }

    return (
        <SidePanel
                isOpen={props.isOpen}
                alignmanet="right"
                width={312}
                overlay={false}
            >
                <SidePanelTitleContainer>
                    <Button sx={{ marginLeft: "auto" }} onClick={props.onCancel} appearance="icon">
                        <Codicon name="close" />
                    </Button>
                </SidePanelTitleContainer>
                <SidePanelBody>
                    <SidePanelBodyWrapper>
                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            <h3>Import {ioType} Schema</h3>
                            <Field>
                                <AutoComplete label="Resource Type" items={["JSON", "JSONSCHEMA", "XML"]} 
                                    borderBox onValueChange={(e: any) => setSelectedResourceType(e)}/>
                            </Field>
                            <Button appearance="primary" onClick={loadSchema}>Import</Button>
                        </ComponentCard>
                    </SidePanelBodyWrapper>
                </SidePanelBody>
        </SidePanel>
    );
}