/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { VSCodePanels, VSCodePanelTab } from "@vscode/webview-ui-toolkit/react";
import { Icon, PanelContent, Typography } from "@wso2-enterprise/ui-toolkit";
import { MediatorForm } from "./Form";
import { Range } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import TryOutView from "../tryout/Tryout";
import { useForm } from "react-hook-form";
import { Colors } from "../../../resources/constants";

interface MediatorPageProps {
    mediatorData: any;
    mediatorType: string;
    nodeRange: Range;
    documentUri: string;
    isUpdate: boolean;
    showMediaotrPanel: boolean;
}
export function MediatorPage(props: MediatorPageProps) {
    const { mediatorData, mediatorType, documentUri, nodeRange, isUpdate, showMediaotrPanel } = props;
    const [activeTab, setActiveTab] = React.useState("form");
    const { control, handleSubmit, setValue, getValues, watch, reset, formState: { dirtyFields, errors } } = useForm<any>({
        defaultValues: {
        }
    });

    const onChangeTab = (tabId: string) => {
        if (activeTab === tabId) {
            return;
        }
        setActiveTab(tabId);
    }
    return (
        <div>
            <VSCodePanels activeId={activeTab}>
                {showMediaotrPanel && <VSCodePanelTab id="form" onClick={() => onChangeTab("form")}>Edit</VSCodePanelTab>}
                <VSCodePanelTab id="tryout" onClick={() => onChangeTab("tryout")} style={{ alignItems: 'center' }}>
                    Tryout
                    {activeTab === "tryout" && <span style={{
                        marginLeft: '4px',
                        backgroundColor: Colors.SURFACE_CONTAINER,
                        color: Colors.ON_SURFACE,
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '9px',
                        fontStyle: 'italic'
                    }}>
                        Experimental
                    </span>}
                </VSCodePanelTab>

                {showMediaotrPanel && <PanelContent id={"form"} >
                    <MediatorForm
                        control={control}
                        errors={errors}
                        setValue={setValue}
                        reset={reset}
                        watch={watch}
                        getValues={getValues}
                        dirtyFields={dirtyFields}
                        handleSubmit={handleSubmit}
                        mediatorData={mediatorData}
                        mediatorType={mediatorType}
                        isUpdate={isUpdate}
                        documentUri={documentUri}
                        range={nodeRange} />
                </PanelContent>}
                <PanelContent id={"tryout"}>
                    {(!mediatorData || mediatorData.canTryOut) && <TryOutView
                        documentUri={documentUri}
                        nodeRange={nodeRange}
                        mediatorType={mediatorType}
                        getValues={getValues}
                        isActive={activeTab === "tryout" || !showMediaotrPanel}
                    />}
                    {(mediatorData && !mediatorData.canTryOut) && (
                        <Typography variant="body2" sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Icon name="warning" isCodicon /> Please update your MI runtime to the latest version to use the tryout feature.
                        </Typography>
                    )}
                </PanelContent>
            </VSCodePanels>
        </div>
    );
}
