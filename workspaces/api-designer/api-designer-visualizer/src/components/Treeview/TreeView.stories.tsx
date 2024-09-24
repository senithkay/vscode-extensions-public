/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Param } from "../../Definitions/ServiceDefinitions";
import { TreeItem, TreeView } from "./TreeView";
import styled from "@emotion/styled";

export default {
    component: TreeView,
    title: 'SplitView',
};

export const TreeViewStory = () => {
    const sampleItems: TreeItem[] = [
        {
            id: '1',
            content: 'Item 1',
            children: [
                {
                    id: '1-1',
                    content: 'Item 1.1',
                    body: 'Body 1.1',
                },
                {
                    id: '1-2',
                    content: 'Item 1.2',
                    children: [
                        {
                            id: '1-2-1',
                            content: 'Item 1.2.1',
                            body: 'Body 1.2.1',
                        },
                    ],
                },
            ],
        },
        {
            id: '2',
            content: 'Item 2',
        },
    ];
    return (
        <div>
            <TreeView items={sampleItems} />
        </div>
    );
};
