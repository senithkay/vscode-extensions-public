/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

// tslint:disable: no-empty jsx-no-multiline-js
import React, { createContext } from "react";

import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

interface GraphqlDiagramContextProps {
    children?: React.ReactNode,
    functionPanel?: (position: NodePosition, functionType: string, model?: STNode) => void;
    servicePanel?: () => void;
    model?: STNode;
    operationDesignView?: (functionPosition: NodePosition) => void;
    onDelete?: (position: NodePosition) => void;
    fullST?: STNode;
    goToSource?: (filePath: string, position: NodePosition) => void
}

export const DiagramContext = createContext({
        functionPanel: (position: NodePosition, functionType: string, model?: STNode) => {},
        servicePanel: () => {},
        model: undefined,
        operationDesignView: (functionPosition: NodePosition) => {},
        onDelete: (position: NodePosition) => {},
        fullST: undefined,
        goToSource: (filePath: string, position: NodePosition) => {},
    }
);

export function GraphqlDiagramContext(props: GraphqlDiagramContextProps) {

    const { 
        children, functionPanel, servicePanel, model, operationDesignView, onDelete, fullST, goToSource 
    } = props;

    return (
        <DiagramContext.Provider
            value={{
                functionPanel,
                servicePanel,
                model,
                operationDesignView,
                onDelete,
                fullST,
                goToSource
            }}
        >
            {children}
        </DiagramContext.Provider>
    );
}

export const useGraphQlContext = () => React.useContext(DiagramContext);

