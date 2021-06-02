import * as React from "react";

import { FunctionDefinition, STKindChecker, STNode } from "@ballerina/syntax-tree";
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
    scale: string;
    panX: string;
    panY: string;
}

const ZOOM_STEP = 0.1;
const MAX_ZOOM = 2;
const MIN_ZOOM = 0.6;

export function DiagramGenerator(props: DiagramGeneratorProps) {
    const { diagramLangClient, filePath, startLine, startCharacter, updated, scale, panX, panY } = props;
    const classes = useGeneratorStyles();
    const defaultScale = scale ? Number(scale) : 1;
    const defaultPanX = panX ? Number(panX) : 0;
    const defaultPanY = panY ? Number(panY) : 0;

    const defaultZoomStatus = {
        scale: defaultScale,
        panX: defaultPanX,
        panY: defaultPanY,
    };

    const [syntaxTree, setSyntaxTree] = React.useState(undefined);
    const [zoomStatus, setZoomStatus] = React.useState(defaultZoomStatus);

    React.useEffect(() => {
        (async () => {
            try {
                const genSyntaxTree = await getSyntaxTree(filePath, diagramLangClient);
                const vistedSyntaxTree : STNode = getLowcodeST(genSyntaxTree, startLine, startCharacter);
                if (!vistedSyntaxTree) {
                    return (<div><h1>Parse error...!</h1></div>);
                }
                setSyntaxTree(vistedSyntaxTree);
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

    function onPanLocation(appId: number, newPanX: number, newPanY: number) {
        const newZoomStatus = cloneDeep(zoomStatus);
        newZoomStatus.panX = newPanX;
        newZoomStatus.panY = newPanY;
        setZoomStatus(newZoomStatus);
    }

    if (!syntaxTree){
        return (<div className={classes.loaderContainer}><CirclePreloader position="relative"/></div>);
    }

    if (syntaxTree && STKindChecker.isFunctionDefinition(syntaxTree)) {
        const vst : FunctionDefinition = syntaxTree as FunctionDefinition;
        if (STKindChecker.isExternalFunctionBody(vst.functionBody)) {
            return (<div className={classes.errorMessageDialog}><h4>Sorry...! External Function Body is not supported yet.</h4></div>);
        }
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

