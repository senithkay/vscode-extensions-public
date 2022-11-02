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
import React, { useEffect } from 'react';

import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	List,
	Typography
} from '@material-ui/core';
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { default as AddIcon } from  "@material-ui/icons/Add";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { FunctionDefinition, RecordTypeDesc } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { AddOutputTypeNode } from "../AddOutputType";

import { RecordFromJson } from "./RecordFromJson";
import { RecordItem } from "./RecordItem";
import { STModification, STSymbolInfo } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { IBallerinaLangClient } from '@wso2-enterprise/ballerina-languageclient';

const useStyles = makeStyles(() =>
	createStyles({
		contentWrapper: {
			minHeight: '600px',
			maxWidth: '300px',
			borderRadius: '8px',
			backgroundColor: '#FFFFFF',
			boxShadow: '0 2px 40px 0 rgba(102,103,133,0.15)',
			padding: '20px',
			margin: '10px'
		},
		title: {
			display: "flex",
			paddingBottom: '20px',
			fontSize: '14px'
		},
		recordList: {
			display: 'grid',
			gridTemplateColumns: '100%',
		},
		label: {
			fontSize: '13px'
		},
		summary: {
			maxWidth: '300px',
			color: "#5567D5",
		}
	})
);

export interface AddOutputTypeNodeWidgetProps {
	title: string;
	applyModifications: (modifications: STModification[]) => void;
    langClientPromise: Promise<IBallerinaLangClient>;
    stSymbolInfo: STSymbolInfo;
    functionST?: FunctionDefinition;
}

export function AddIOTypeNodeWidget(props: AddOutputTypeNodeWidgetProps) {
	const { title, stSymbolInfo, functionST, applyModifications, langClientPromise } = props;
	const classes = useStyles();

	const [selection, setSelection] = React.useState('');
	const [menuItems, setMenuItems] = React.useState<React.ReactNode[]>();

	const handleSelectClicked = () => {
		const records: React.ReactNode[] = [];
		const recordTypeDescMap = stSymbolInfo.recordTypeDescriptions;
		for (const st of recordTypeDescMap.values()) {
			const recordName = (st as RecordTypeDesc)?.typeData.typeSymbol.name;
			records.push(
				<RecordItem recordName={recordName} onClickRecordItem={handleSelection} />
			);
		}
		setMenuItems([...records]);
	}

	const handleImportFormSave = (recordName: string, recordString: string) => {
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
		applyModifications(modifications);
		// TODO: Update the parameters and the return type in the draft function
	}

	const handleSelection = (recordName: string) => {
		setSelection(recordName);
	}

	useEffect(() => {
		if (selection !== '') {
			if (title === 'Input') {
				(async () => {
					const position = functionST?.functionSignature.openParenToken.position;
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
					applyModifications(modifications);
				})();
			} else {
				(async () => {
					const position = functionST.functionSignature.returnTypeDesc.type.position;
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
					applyModifications(modifications);
				})();
			}
		}
	}, [selection]);

	return (
		<div className={classes.contentWrapper}>
			<Typography className={classes.title}>{title}</Typography>
			<Accordion disabled={true}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1a-content"
					id="panel1a-header"
					className={classes.summary}
				>
					<AddIcon/>
					<Typography className={classes.label}>Import From JSON</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<RecordFromJson onSave={handleImportFormSave} langClientPromise={langClientPromise} />
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel3a-content"
					id="panel3a-header"
					onClick={handleSelectClicked}
					className={classes.summary}
				>
					<AddIcon/>
					<Typography className={classes.label}>Select From Existing</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<List className={classes.recordList}>
						{menuItems}
					</List>
				</AccordionDetails>
			</Accordion>
		</div>
	);
}
