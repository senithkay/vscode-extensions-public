import * as React from "react";

import { StringValueNode } from "graphql";

import LowCodeEditor from "..";
import { ExpressionEditorLangClientInterface } from "../Definitions";
import { DiagramEditorLangClientInterface } from "../Definitions/diagram-editor-lang-client-interface";
import { useStyles } from "../Diagram/styles";

import { getLowcodeST, getSyntaxTree } from "./generatorUtil";

export interface DiagramGeneratorProps {
    diagramLangClient: DiagramEditorLangClientInterface;
    filePath: string;
    startLine: string;
    startCharacter: string;
}

export function DiagramGenerator(props: DiagramGeneratorProps) {
    const { diagramLangClient, filePath, startLine, startCharacter } = props;
    const classes = useStyles();

    const [syntaxTree, setSyntaxTree] = React.useState(undefined);

    React.useEffect(() => {
        (async () => {
            const genSyntaxTree = await getSyntaxTree(filePath, diagramLangClient);
            const vistedSyntaxTree = getLowcodeST(genSyntaxTree, startLine, startCharacter);
            setSyntaxTree(vistedSyntaxTree);
        })();
    }, []);

    if (!syntaxTree){
        return (<div><h1>Diagram Not Loaded...!</h1></div>);
    }

    return (
        <div>
            <LowCodeEditor isReadOnly={true} syntaxTree={syntaxTree}  />
        </div>
    );
}

