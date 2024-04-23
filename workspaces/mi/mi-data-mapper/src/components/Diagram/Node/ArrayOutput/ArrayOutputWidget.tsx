/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useMemo, useState } from "react";

import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Button, Codicon, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { Node } from "ts-morph";
import classnames from "classnames";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { DataMapperPortWidget, PortState, InputOutputPortModel } from '../../Port';
import { TreeBody, TreeContainer, TreeHeader } from '../commons/Tree/Tree';
import { ArrayOutputFieldWidget } from "./ArrayOuptutFieldWidget";
import { useIONodesStyles } from '../../../styles';
import { useDMCollapsedFieldsStore } from "../../../../store/store";
import { getDiagnostics } from "../../utils/diagnostics-utils";
import { isConnectedViaLink } from "../../utils/common-utils";

export interface ArrayTypeOutputWidgetProps {
	id: string;
	dmTypeWithValue: DMTypeWithValue;
	typeName: string;
	engine: DiagramEngine;
	getPort: (portId: string) => InputOutputPortModel;
	context: IDataMapperContext;
	deleteField?: (node: Node) => Promise<void>;
}

export function ArrayTypeOutputWidget(props: ArrayTypeOutputWidgetProps) {
	const {
		id,
		dmTypeWithValue,
		getPort,
		engine,
		context,
		typeName,
		deleteField
	} = props;
	const classes = useIONodesStyles();

	const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);
	const collapsedFieldsStore = useDMCollapsedFieldsStore();

	const body = dmTypeWithValue && dmTypeWithValue.value;
	const hasValue = dmTypeWithValue && dmTypeWithValue?.elements && dmTypeWithValue.elements.length > 0;
	const isBodyArrayLitExpr = body && Node.isArrayLiteralExpression(body);
	const elements = isBodyArrayLitExpr ? body.getElements() : [];
	const hasDiagnostics = getDiagnostics(dmTypeWithValue?.value).length > 0;

	const portIn = getPort(`${id}.IN`);

	let expanded = true;
	if ((portIn && portIn.collapsed)) {
		expanded = false;
	}

	const indentation = (portIn && (!hasValue || !expanded)) ? 0 : 24;

	const shouldPortVisible = !hasDiagnostics
		&& (!hasValue || !expanded || !isBodyArrayLitExpr || elements.length === 0);

	const hasElementConnectedViaLink = useMemo(() => {
		return elements.some(expr => isConnectedViaLink(expr));
	}, [body]);

	let isDisabled = portIn?.descendantHasValue;
	if (expanded && !isDisabled && elements.length > 0) {
		portIn.setDescendantHasValue();
		isDisabled = true;
	} else if (!expanded && !hasElementConnectedViaLink && !isDisabled && elements.length > 0) {
		isDisabled = true;
	}

	const handleExpand = () => {
		const collapsedFields = collapsedFieldsStore.collapsedFields;
        if (!expanded) {
            collapsedFieldsStore.setCollapsedFields(collapsedFields.filter((element) => element !== id));
        } else {
            collapsedFieldsStore.setCollapsedFields([...collapsedFields, id]);
        }
	};

	const handlePortState = (state: PortState) => {
		setPortState(state)
	};

	const label = (
		<span style={{ marginRight: "auto" }}>
			<span className={classnames(classes.outputTypeLabel, isDisabled ? classes.labelDisabled : "")}>
				{typeName || ''}
			</span>
		</span>
	);

	return (
		<>
			<TreeContainer data-testid={`${id}-node`}>
				<TreeHeader
					isSelected={portState !== PortState.Unselected}
					isDisabled={isDisabled} id={"recordfield-" + id}
				>
					<span className={classes.inPort}>
						{portIn && shouldPortVisible && (
							<DataMapperPortWidget
								engine={engine}
								port={portIn}
								disable={isDisabled}
								handlePortState={handlePortState}
							/>
						)}
					</span>
					<span className={classes.label}>
						<Button
							appearance="icon"
							tooltip="Expand/Collapse"
							onClick={handleExpand}
							data-testid={`${id}-expand-icon-mapping-target-node`}
							sx={{ marginLeft: indentation }}
						>
							{expanded ? <Codicon name="chevron-right" /> : <Codicon name="chevron-down" />}
						</Button>
						{label}
					</span>
				</TreeHeader>
				{expanded && dmTypeWithValue && isBodyArrayLitExpr && (
					<TreeBody>
						<ArrayOutputFieldWidget
							key={id}
							engine={engine}
							field={dmTypeWithValue}
							getPort={getPort}
							parentId={id}
							parentObjectLiteralExpr={undefined}
							context={context}
							deleteField={deleteField}
							isReturnTypeDesc={true}
						/>
					</TreeBody>
				)}
			</TreeContainer>
		</>
	);
}
