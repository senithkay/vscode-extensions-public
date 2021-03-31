/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import React, { useRef, useState } from "react";

import { ExplicitAnonymousFunctionExpression, LocalVarDecl, STNode } from "@ballerina/syntax-tree";

import { STModification } from "../../../../../Definitions";
import { updatePropertyStatement } from "../../../../utils/modification-util";
import { SourcePointViewState, TargetPointViewState } from "../../viewstate";
import { DataPoint } from "../DataPoint";
import { TypeDescComponent } from "../TypeDescComponent";
export interface DataMapperFunctionComponentProps {
    model: STNode;
    onSave: (modifications: STModification[]) => void;
}

export function DataMapperFunctionComponent(props: DataMapperFunctionComponentProps) {
    const { model, onSave } = props;
    const functionST = (model as LocalVarDecl).initializer as ExplicitAnonymousFunctionExpression;
    const drawingLineRef = useRef(null);
    const [isDataPointSelected, setIsDataPointSelected] = useState(false);
    const [selectedSource, setSelectedSource] = useState(undefined);
    const [eventListenerMap] = useState<any>({});

    const parameters: JSX.Element[] = [];
    const returnType: JSX.Element[] = [];
    const dataPoints: JSX.Element[] = [];

    const dataPointOnClick = (dataPointVS: SourcePointViewState | TargetPointViewState) => {
        // current element is wrapped by a <g/> element
        const parentSVG = (drawingLineRef.current as SVGGraphicsElement).parentElement.parentElement;

        if (parentSVG instanceof SVGSVGElement) {
            const ctm = (parentSVG as SVGSVGElement).getScreenCTM();
            const point = (parentSVG as SVGSVGElement).createSVGPoint();

            const onMouseMove = (evt: MouseEvent) => {
                point.x = evt.pageX;
                point.y = evt.pageY;
                const mappedPoint = point.matrixTransform(ctm.inverse());
                drawingLineRef.current.setAttribute('x2', mappedPoint.x - 20);
                drawingLineRef.current.setAttribute('y2', mappedPoint.y);
            }

            if (isDataPointSelected && dataPointVS instanceof TargetPointViewState) {
                setIsDataPointSelected(false);
                setSelectedSource(undefined);
                window.removeEventListener("mousemove", eventListenerMap.mousemove);
                eventListenerMap.mousemove = undefined;
                onSave([updatePropertyStatement(selectedSource.text, dataPointVS.position)])
            } else if (!isDataPointSelected && dataPointVS instanceof SourcePointViewState) {
                eventListenerMap.mousemove = onMouseMove;
                drawingLineRef.current.setAttribute('x1', dataPointVS.bBox.x);
                drawingLineRef.current.setAttribute('x2', dataPointVS.bBox.x);
                drawingLineRef.current.setAttribute('y1', dataPointVS.bBox.y);
                drawingLineRef.current.setAttribute('y2', dataPointVS.bBox.y);
                setIsDataPointSelected(true);
                setSelectedSource(dataPointVS);
                window.addEventListener('mousemove', eventListenerMap.mousemove);
            }
        }
    }

    if (drawingLineRef.current && !isDataPointSelected) {
        drawingLineRef.current.setAttribute('x1', -5);
        drawingLineRef.current.setAttribute('x2', -5);
        drawingLineRef.current.setAttribute('y1', -5);
        drawingLineRef.current.setAttribute('y2', -5);
    }

    functionST.functionSignature.parameters.forEach(param => {
        parameters.push(<TypeDescComponent model={param} />)
    });

    returnType.push(<TypeDescComponent model={functionST.functionSignature.returnTypeDesc} isOutput={true} />);

    functionST.dataMapperViewState.sourcePoints.forEach((dataPoint: SourcePointViewState) => {
        dataPoints.push(<DataPoint dataPointViewState={dataPoint} onClick={dataPointOnClick} />);
    });

    functionST.dataMapperViewState.targetPointMap.forEach((dataPoint: SourcePointViewState) => {
        dataPoints.push(<DataPoint dataPointViewState={dataPoint} onClick={dataPointOnClick} />);
    });

    return (
        <>
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="0"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" />
                </marker>
            </defs>
            {parameters}
            {returnType}
            {dataPoints}
            <line ref={drawingLineRef} style={{ stroke: 'rgb(255,0,0)', strokeWidth: 2 }} markerEnd="url(#arrowhead)" />
        </>
    )
}
