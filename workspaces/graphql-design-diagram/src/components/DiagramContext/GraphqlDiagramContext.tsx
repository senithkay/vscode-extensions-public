// tslint:disable: no-empty jsx-no-multiline-js
import React, { createContext } from "react";

import { NodePosition } from "@wso2-enterprise/syntax-tree";

interface GraphqlDiagramContextProps {
    children?: React.ReactNode,
    functionPanel?: (position: NodePosition, functionType: string) => void;
}

export const DiagramContext = createContext({
        functionPanel: (position: NodePosition, functionType: string) => {}
    }
);

export function GraphqlDiagramContext(props: GraphqlDiagramContextProps) {
    const { children, functionPanel } = props;

    return (
        <DiagramContext.Provider
            value={{
                functionPanel
            }}
        >
            {children}
        </DiagramContext.Provider>
    );
}
