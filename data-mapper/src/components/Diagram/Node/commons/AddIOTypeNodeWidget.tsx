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
import React, { useEffect, useState } from 'react';

import { MenuItem, Select, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { default as AddIcon } from  "@material-ui/icons/Add";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { RecordTypeDesc } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { AddOutputTypeNode } from "../AddOutputType";

import { RecordFromJson } from "./RecordFromJson";

const useStyles = makeStyles(() =>
	createStyles({
		contentWrapper: {
			minHeight: '600px',
			minWidth: '300px',
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
		},
		selectDropDown: {
			height: '32px',
			borderRadius: 4,
			background: "linear-gradient(180deg, #FFFFFF 0%, #F7F7F9 100%)",
			boxShadow: "inset 0 0 0 1px #DEE0E7, 0 1px 2px -1px rgba(0,0,0,0.08)",
			cursor: "pointer",
			"&:active": {
				background: "linear-gradient(180deg, #ffffff 0%, #f7f7f9 100%)",
				boxShadow: "inset 0 0 0 1px #a6b3ff, 0 1px 1px 0 rgba(0, 0, 0, 0.06)",
				border: "1px solid #5567d5",
			},
			"&:focused": {
				background: "linear-gradient(180deg, #ffffff 0%, #f7f7f9 100%)",
				boxShadow: "inset 0 0 0 1px #a6b3ff, 0 1px 1px 0 rgba(0, 0, 0, 0.06)",
				border: "1px solid #5567d5 !important"
			},
			'& .MuiSelect-icon': {
				marginRight: 11,
			},
			"& .MuiSelect-selectMenu": {
				height: "inherit !important",
				paddingLeft: 10,
				"& .TextSpan": {
					top: "calc(50% - 8px)",
					position: "absolute",
					maxWidth: "156px",
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
				}
			},
			"& .MuiSelect-select.MuiSelect-select": {
				padding: "0 0 0 10px",
				minWidth: "100px"
			},
			"& .MuiSelect-select.MuiSelect-select:focus": {
				backgroundColor: "transparent"
			}
		},
		dropdownStyle: {
			boxSizing: "border-box",
			width: "auto",
			border: "1px solid #DEE0E7",
			borderRadius: "5px",
			boxShadow: "0 5px 10px -3px rgba(50,50,77,0.1)",
			color: "#222228",
			marginTop: '0.25rem',
			marginLeft: '4px'
		}
	})
);

export interface AddOutputTypeNodeWidgetProps {
	node: AddOutputTypeNode;
	engine: DiagramEngine;
	title: string;
	context: IDataMapperContext;
}

enum TypeAddingMechanism {
	Import,
	Select
}

export function AddIOTypeNodeWidget(props: AddOutputTypeNodeWidgetProps) {
	const { node, engine, title, context } = props;
	const classes = useStyles();

	const [typeAddingMechanism, setTypeAddingMechanism] = useState<TypeAddingMechanism>(undefined);
	const [selection, setSelection] = React.useState('');
	const [menuItems, setMenuItems] = React.useState<React.ReactNode[]>();

	const handleImportClicked = () => {
		setTypeAddingMechanism(TypeAddingMechanism.Import);
	}

	const handleImportFormClose = () => {
		setTypeAddingMechanism(undefined);
	}

	const handleSelectClicked = () => {
		const records: React.ReactNode[] = [];
		const recordTypeDescMap = context.stSymbolInfo.recordTypeDescriptions;
		for (const st of recordTypeDescMap.values()) {
			const recordName = (st as RecordTypeDesc)?.typeData.typeSymbol.name;
			records.push(
				<MenuItem key={recordName} value={recordName}>
					<span className="TextSpan">{recordName}</span>
				</MenuItem>
			);
		}
		setTypeAddingMechanism(TypeAddingMechanism.Select);
		setMenuItems([...records]);
	}

	const handleImportFormSave = (recordName: string, recordString: string) => {
		setTypeAddingMechanism(undefined);
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
		// TODO: Update the parameters and the return type in the draft function
	}

	const handleSelection = (event: React.ChangeEvent<{ value: string }>) => {
		setSelection(event.target.value);
		setTypeAddingMechanism(undefined);
	}

	useEffect(() => {
		if (selection !== '') {
			if (title === 'Input') {
				(async () => {
					const position = context.functionST.functionSignature.openParenToken.position;
					const modifications = [
						{
							type: "INSERT",
							config: {
								"STATEMENT": `${selection} input`,
							},
							endColumn: position.endColumn,
							endLine: position.endLine,
							startColumn: position.endColumn,
							startLine: position.endLine
						}
					];
					context.applyModifications(modifications);
				})();
			} else {
				(async () => {
					const position = context.functionST.functionSignature.returnTypeDesc.type.position;
					const modifications = [
						{
							type: "INSERT",
							config: {
								"STATEMENT": selection,
							},
							endColumn: position.endColumn,
							endLine: position.endLine,
							startColumn: position.startColumn,
							startLine: position.startLine
						}
					];
					context.applyModifications(modifications);
				})();
			}
		}
	}, [selection]);

	return (
		<div className={classes.contentWrapper}>
			<Typography className={classes.title}>{title}</Typography>
			<div className={classes.addButton} onClick={handleImportClicked}>
				<AddIcon/>
				<p>Import From JSON</p>
			</div>
			<div className={classes.addButton} onClick={handleSelectClicked}>
				<AddIcon/>
				<p>Select From Existing</p>
			</div>
			{typeAddingMechanism === TypeAddingMechanism.Import && (
				<RecordFromJson onCancel={handleImportFormClose} onSave={handleImportFormSave} context={context} />
			)}
			{typeAddingMechanism === TypeAddingMechanism.Select  && (
				<Select
					value={selection}
					onChange={handleSelection}
					className={classes.selectDropDown}
					inputProps={{ 'aria-label': 'Without label' }}
					MenuProps={{
						getContentAnchorEl: null,
						classes: { paper: classes.dropdownStyle },
						anchorOrigin: {
							vertical: "bottom",
							horizontal: "left",
						}
					}}
				>
					{menuItems}
				</Select>
			)}
		</div>
	);
}
