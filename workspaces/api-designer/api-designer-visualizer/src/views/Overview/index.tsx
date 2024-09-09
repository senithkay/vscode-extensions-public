/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/api-designer-core";
import { useVisualizerContext } from "@wso2-enterprise/api-designer-rpc-client";
import { View, ViewContent, ViewHeader } from "../../components/View";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";

interface OverviewProps {
    stateUpdated: boolean;
}

export function Overview(props: OverviewProps) {
    const { rpcClient } = useVisualizerContext();
    const [selected, setSelected] = React.useState<string>("");

    useEffect(() => {

    }, []);

    const changeWorkspace = (fsPath: string) => {
        setSelected(fsPath);
    }

    return (
        <View>
            <ViewHeader
                title={"Project: Foo"}
                icon="project"
                iconSx={{ fontSize: "15px" }}
            >
                <Button
                    appearance="primary"
                    onClick={() => { }}
                    tooltip="Try Out"
                >
                    <Codicon name="add" sx={{ marginRight: "4px" }} />
                    Try
                </Button>
            </ViewHeader>
            <ViewContent padding>
                Hello overview
            </ViewContent>
        </View>
    );
}
