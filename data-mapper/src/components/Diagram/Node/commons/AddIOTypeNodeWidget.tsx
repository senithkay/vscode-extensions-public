/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React, { useState } from 'react';

import { Typography } from '@material-ui/core';
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { default as AddIcon } from  "@material-ui/icons/Add";
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { AddOutputTypeNode } from "../AddOutputType";

import { RecordFromJson } from "./RecordFromJson";

const useStyles = makeStyles(() =>
	createStyles({
		contentWrapper: {
			minHeight: '600px',
			minWidth: '344px',
			borderRadius: '8px',
			backgroundColor: '#FFFFFF',
			boxShadow: '0 2px 40px 0 rgba(102,103,133,0.15)',
			padding: '20px'
		},
		title: {
			display: "flex",
			paddingBottom: '20px'
		},
		addButton: {
			margin: `10px 10px 10px 5px`,
			color: "#5567D5",
			fontSize: 12,
			display: "flex",
			alignItems: "center",
			cursor: "pointer",
			"& .MuiSvgIcon-root": {
				height: '18px !important',
			}
		}
	})
);

export interface AddOutputTypeNodeWidgetProps {
	node: AddOutputTypeNode;
	engine: DiagramEngine;
	title: string;
	context: IDataMapperContext;
}

export function AddIOTypeNodeWidget(props: AddOutputTypeNodeWidgetProps) {
	const { node, engine, title, context } = props;
	const classes = useStyles();

	const [isImportFormVisible, setIsImportFormVisible] = useState(false);

	const handleImportClicked = () => {
		setIsImportFormVisible(true);
	}

	const handleImportFormClose = () => {
		setIsImportFormVisible(false);
	}

	const handleImportFormSave = (recordName: string, recordString: string) => {
		setIsImportFormVisible(false);
		const paramTargetPos = context.functionST.functionSignature.openParenToken.position;
		const modifications = [
			{
				type: "INSERT",
				config: {
					"STATEMENT": recordString,
				},
				endColumn: 0,
				endLine: 0,
				startColumn: 0,
				startLine: 0
			}
		];
		context.applyModifications(modifications);
	}

	return (
		<div className={classes.contentWrapper}>
			<Typography className={classes.title}>{title}</Typography>
			<div className={classes.addButton} onClick={handleImportClicked}>
				<AddIcon/>
				<p>Import From JSON</p>
			</div>
			<div className={classes.addButton}>
				<AddIcon/>
				<p>Select From Existing</p>
			</div>
			{isImportFormVisible && (
				<RecordFromJson onCancel={handleImportFormClose} onSave={handleImportFormSave} context={context} />
			)}
		</div>
	);
}
