/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { WorkspaceFolder } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, Icon, Codicon } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { View, ViewContent, ViewHeader } from "../../components/View";

const ProjectActions = styled.div({
    display: 'flex',
    alignItems: 'center',
    gap: '5px'

});

export function OldProjectOverview() {
    const { rpcClient } = useVisualizerContext();
    const [activeWorkspaces, setActiveWorkspaces] = React.useState<WorkspaceFolder>(undefined);

    useEffect(() => {
        rpcClient.getMiVisualizerRpcClient().getWorkspaces().then((response) => {
            setActiveWorkspaces(response.workspaces[0]);
            console.log(response.workspaces[0]);
        });
    }, []);

    return (
        <View>
            <ViewHeader title={"Project: " + activeWorkspaces?.name} codicon="project">
                <ProjectActions>
                    <Button
                        appearance="icon"
                        onClick={() => { }}
                        tooltip="Icon Button"
                    >
                        <Codicon
                            name="combine"
                        />
                        &nbsp;&nbsp;Build

                    </Button>
                    <Button
                        appearance="icon"
                        tooltip="Deploy your integration on the Cloud with Choreo">
                        <Icon
                            name="choreo"
                            sx={{ marginTop: '2px', color: '#5567d5' }}
                        />
                        &nbsp;Deploy in Choreo
                    </Button>
                </ProjectActions>
            </ViewHeader>
            <ViewContent padding>
                Migrate
            </ViewContent>
        </View>
    );
}

