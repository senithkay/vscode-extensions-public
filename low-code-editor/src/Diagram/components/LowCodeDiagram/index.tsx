import React from "react";

import { CanvasDiagram } from "./CanvasContainer";
import { Provider as DiagramContext } from "./Context/diagram";
import { LowCodeEditorProps } from "./Context/types";
import { getSTComponent } from "./Utils";

export default function LowCodeDiagram(props: LowCodeEditorProps) {
    const {syntaxTree} = props;
    const child = getSTComponent(syntaxTree);

    return (
        <DiagramContext {...props}>
            <CanvasDiagram>
                {child}
            </CanvasDiagram>
        </DiagramContext>
    );
}
