/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { Component } from "@wso2-enterprise/choreo-core";
import { Codicon } from "../Codicon/Codicon";
import styled from "@emotion/styled";

export interface ComponentListProps {
    components: Component[] | undefined;
}

const InlineIcon = styled.span`
    vertical-align: sub;
    padding-left: 5px;
`;

// react component
export function ComponentList(props: ComponentListProps) {

    if (!props.components) {
        return <><VSCodeProgressRing /></>;
    }

    if (props.components.length === 0) {
        return <><p><InlineIcon><Codicon name="info" /></InlineIcon> No components found. Clone & Open the project to create components.</p></>;
    }

    return (
        <>
            <VSCodeDataGrid aria-label="Components">
                <VSCodeDataGridRow rowType="header">
                    <VSCodeDataGridCell cellType={"columnheader"} gridColumn="1">Name</VSCodeDataGridCell>
                    <VSCodeDataGridCell cellType={"columnheader"} gridColumn="2">Version</VSCodeDataGridCell>
                </VSCodeDataGridRow>
                {
                    props.components?.map((component) => {
                        return <VSCodeDataGridRow>
                            <VSCodeDataGridCell gridColumn="1">{component.name}</VSCodeDataGridCell>
                            <VSCodeDataGridCell gridColumn="2">{component.version}</VSCodeDataGridCell>
                        </VSCodeDataGridRow>
                    })
                }
            </VSCodeDataGrid>
        </>
    );
}