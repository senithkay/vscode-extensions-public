/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useState } from "react";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { DMType, IOType } from "@wso2-enterprise/mi-core";

import { DataMapperPortWidget, PortState, InputOutputPortModel } from '../../Port';
import { InputSearchHighlight } from './Search';
import { TreeContainer, TreeHeader } from './Tree/Tree';
import { useIONodesStyles } from "../../../styles";
import { getTypeName } from "../../utils/common-utils";
import { useDMIOConfigPanelStore } from "../../../../store/store";
import { Button, Codicon, TruncatedLabel } from "@wso2-enterprise/ui-toolkit";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import FieldActionWrapper from "./FieldActionWrapper";

export interface PrimitiveTypeItemWidgetProps {
    id: string; // this will be the root ID used to prepend for UUIDs of nested fields
    dmType: DMType;
    engine: DiagramEngine;
    getPort: (portId: string) => InputOutputPortModel;
    context: IDataMapperContext;
    valueLabel?: string;
    nodeHeaderSuffix?: string;
}

export function PrimitiveTypeInputWidget(props: PrimitiveTypeItemWidgetProps) {
    const { engine, dmType, id, getPort, context, valueLabel, nodeHeaderSuffix } = props;
    const focusOnRoot = context.views.length === 1 || undefined;

    const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);

    const { setIsIOConfigPanelOpen, setIOConfigPanelType, setIsSchemaOverridden } = useDMIOConfigPanelStore(state => ({
		setIsIOConfigPanelOpen: state.setIsIOConfigPanelOpen,
		setIOConfigPanelType: state.setIOConfigPanelType,
		setIsSchemaOverridden: state.setIsSchemaOverridden
	}));

    const classes = useIONodesStyles();

    const typeName = getTypeName(dmType);
    const portOut = getPort(`${id}.OUT`);

    const handlePortState = (state: PortState) => {
        setPortState(state)
    };

    const label = (
        <TruncatedLabel style={{ marginRight: "auto" }}>
            <span className={classes.valueLabel}>
                <InputSearchHighlight>{valueLabel ? valueLabel : id}</InputSearchHighlight>
                {typeName && ":"}
            </span>
            {typeName && (
                <span className={classes.inputTypeLabel}>
                    {typeName}
                </span>
            )}

        </TruncatedLabel>
    );

    const handleChangeSchema = (event: React.MouseEvent) => {
        event.preventDefault(); 
        setIOConfigPanelType(IOType.Input);
        setIsSchemaOverridden(true);
        setIsIOConfigPanelOpen(true);
    };

    return (
        <TreeContainer data-testid={`${id}-node`} onContextMenu={focusOnRoot && handleChangeSchema}>
            <TreeHeader id={"recordfield-" + id} isSelected={portState !== PortState.Unselected}>
                <span className={classes.label}>
                    {label}
                    <span className={classes.nodeType}>{nodeHeaderSuffix}</span>
                </span>
                {focusOnRoot && (
                    <FieldActionWrapper>
                        <Button
                            appearance="icon"
                            data-testid={"open-change-schema-btn"}
                            tooltip="Change input type"
                            sx={{ marginRight: "5px" }}
                            onClick={handleChangeSchema}
                        >
                            <Codicon
                                name="edit"
                                iconSx={{ color: "var(--vscode-input-placeholderForeground)" }}
                            />
                        </Button>
                    </FieldActionWrapper>
                )}
                <span className={classes.outPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut} handlePortState={handlePortState} />
                    }
                </span>
            </TreeHeader>
        </TreeContainer>
    );
}
