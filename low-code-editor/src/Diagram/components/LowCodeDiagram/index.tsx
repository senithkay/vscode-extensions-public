import React from "react";

import LowCodeDiagramRenderer from "./container";
import { Provider as  DiagramContext} from "./Context/diagram";
import { LowCodeDiagramProps } from "./Context/types";

export default function LowCodeDiagram(props: LowCodeDiagramProps) {
    return (
        <DiagramContext {...props}>
            <LowCodeDiagramRenderer />
        </DiagramContext>
    );
}
