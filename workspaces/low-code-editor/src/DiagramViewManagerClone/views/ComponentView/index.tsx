import { BallerinaProjectComponents, FileListEntry } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import React, { useEffect } from "react";
import { useDiagramContext } from "../../../Contexts/Diagram";
import { ComponentCollection } from "../../../OverviewDiagram/util";
import { useHistoryContext } from "../../context/history";
import { ProjectComponentProcessor } from "./util/project-component-processor";

interface ComponentViewProps {
    lastUpdatedAt: string;
    projectComponents: BallerinaProjectComponents;
}

// shows a view that includes document/project symbols(functions, records, etc.)
// you can switch between files in the project and view the symbols in eachfile
// when you select a symbol, it will show the symbol's visualization in the diagram view
export function ComponentView(props: ComponentViewProps) {
    const { projectComponents } = props;
    const { history } = useHistoryContext();
    const file = history.length > 0 ? history[history.length - 1].file : undefined;
    const isBalFile = file && file.endsWith(".bal");
    let currentComponents: ComponentCollection;
    let fileList: FileListEntry[] = [];

    if (projectComponents) {
        const projectComponentProcessor = new ProjectComponentProcessor(projectComponents);
        projectComponentProcessor.process();
        currentComponents = projectComponentProcessor.getComponents();
        const fileMap = projectComponentProcessor.getFileMap();
        console.log('>>>', currentComponents, fileMap);
    }

    return (
        <div>
            <h1>Component View</h1>
        </div>
    )
}
