import * as React from "react";

import { StringValueNode } from "graphql";

import LowCodeEditor from "..";
import { ExpressionEditorLangClientInterface } from "../Definitions";
import { DiagramEditorLangClientInterface } from "../Definitions/diagram-editor-lang-client-interface";

import { DiagramGenErrorBoundary } from "./ErrorBoundrary";
import { getLowcodeST, getSyntaxTree } from "./generatorUtil";
import { useGeneratorStyles } from "./styles";

export interface DiagramGeneratorProps {
    diagramLangClient: DiagramEditorLangClientInterface;
    filePath: string;
    startLine: string;
    startCharacter: string;
}

export function DiagramGenerator(props: DiagramGeneratorProps) {
    const { diagramLangClient, filePath, startLine, startCharacter } = props;
    const classes = useGeneratorStyles();

    const [syntaxTree, setSyntaxTree] = React.useState(undefined);

    React.useEffect(() => {
        (async () => {
            const genSyntaxTree = await getSyntaxTree(filePath, diagramLangClient);
            const vistedSyntaxTree = getLowcodeST(genSyntaxTree, startLine, startCharacter);
            setSyntaxTree(vistedSyntaxTree);
            if (!syntaxTree){
                return (<div><h1>Parse error...!</h1></div>);
            }
        })();
    }, []);

    if (!syntaxTree){
        return (<div className={classes.loader}/>);
    }

    return (
         <div>
            <DiagramGenErrorBoundary>
                <LowCodeEditor isReadOnly={true} syntaxTree={syntaxTree}  />
            </DiagramGenErrorBoundary>
        </div>
    );
}

