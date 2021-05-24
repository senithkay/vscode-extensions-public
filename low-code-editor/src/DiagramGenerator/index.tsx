import * as React from "react";

import Grid from "@material-ui/core/Grid";
import { StringValueNode } from "graphql";
import cloneDeep from "lodash.clonedeep";

import LowCodeEditor from "..";
import { ExpressionEditorLangClientInterface } from "../Definitions";
import { DiagramEditorLangClientInterface } from "../Definitions/diagram-editor-lang-client-interface";
import { CirclePreloader } from "../PreLoader/CirclePreloader";

import { DiagramGenErrorBoundary } from "./ErrorBoundrary";
import { getLowcodeST, getSyntaxTree } from "./generatorUtil";
import { useGeneratorStyles } from "./styles";

export interface DiagramGeneratorProps {
    diagramLangClient: DiagramEditorLangClientInterface;
    filePath: string;
    startLine: string;
    startCharacter: string;
    updated: boolean;
}

const defaultZoomStatus = {
    scale: 1,
    panX: 0,
    panY: 0,
};

const ZOOM_STEP = 0.1;
const MAX_ZOOM = 2;
const MIN_ZOOM = 0.6;

export function DiagramGenerator(props: DiagramGeneratorProps) {
    const { diagramLangClient, filePath, startLine, startCharacter, updated } = props;
    const classes = useGeneratorStyles();
    // tslint:disable-next-line:no-console
    console.log("Diagram Generator render()");

    const [syntaxTree, setSyntaxTree] = React.useState(undefined);
    const [zoomStatus, setZoomStatus] = React.useState(defaultZoomStatus);

    React.useEffect(() => {
        (async () => {
            try {
                const genSyntaxTree = await getSyntaxTree(filePath, diagramLangClient);
                const vistedSyntaxTree = getLowcodeST(genSyntaxTree, startLine, startCharacter);
                if (!syntaxTree) {
                    return (<div><h1>Parse error...!</h1></div>);
                } else {
                    setSyntaxTree(vistedSyntaxTree);
                }
            } catch (err) {
                throw err;
            }
        })();
    }, [updated]);

    function onZoomIn(appId: number) {
        const newZoomStatus = cloneDeep(zoomStatus);
        newZoomStatus.scale = (zoomStatus.scale + ZOOM_STEP >= MAX_ZOOM) ? MAX_ZOOM : zoomStatus.scale + ZOOM_STEP;
        setZoomStatus(newZoomStatus);
    }

    function onZoomOut(appId: number) {
        const newZoomStatus = cloneDeep(zoomStatus);
        newZoomStatus.scale = (zoomStatus.scale - ZOOM_STEP <= MIN_ZOOM) ? MIN_ZOOM : zoomStatus.scale - ZOOM_STEP;
        setZoomStatus(newZoomStatus);
    }

    function onFitToScreen(appId: number) {
        setZoomStatus(defaultZoomStatus);
    }

    function onPanLocation(panX: number, panY: number, appId: number) {
        const newZoomStatus = cloneDeep(zoomStatus);
        newZoomStatus.panX = panX;
        newZoomStatus.panY = panY;
        setZoomStatus(newZoomStatus);
    }

    if (!syntaxTree){
        return (<div className={classes.loaderContainer}><CirclePreloader position="relative"/></div>);
    }

    return (
        <div className={classes.lowCodeContainer}>
            <Grid container={true}>
                <Grid item={true} xs={10} sm={11} md={11}>
                    <DiagramGenErrorBoundary>
                        <LowCodeEditor isReadOnly={true} syntaxTree={syntaxTree} zoomStatus={zoomStatus} onZoomIn={onZoomIn} onZoomOut={onZoomOut} onFitToScreen={onFitToScreen} onPanLocation={onPanLocation}/>
                    </DiagramGenErrorBoundary>
                </Grid>
            </Grid>
        </div>
    );
}

