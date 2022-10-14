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
import * as React from 'react';

import { CircularProgress } from "@material-ui/core";
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker } from '@wso2-enterprise/syntax-tree';
import clsx from 'clsx';

import { CodeActionWidget } from '../CodeAction/CodeAction';
import { DiagnosticWidget } from '../Diagnostic/Diagnostic';
import { DataMapperLinkModel } from "../Link";
import {
	canConvertLinkToQueryExpr,
	generateQueryExpression
} from '../Link/link-utils';
import { RecordFieldPortModel } from '../Port';
import { getBalRecFieldName } from '../utils/dm-utils';
import { handleCodeActions } from "../utils/ls-utils";

import { ExpressionLabelModel } from './ExpressionLabelModel';

export interface FlowAliasLabelWidgetProps {
	model: ExpressionLabelModel;
}

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		container: {
			borderRadius: "10px",
			display: "flex",
			alignItems: "center",
			overflow: "hidden",
			boxShadow: "0px 5px 50px rgba(203, 206, 219, 0.5)",
		},
		containerHidden: {
			visibility: "hidden",
		},
		element: {
            backgroundColor: theme.palette.common.white,
            padding: "10px",
            cursor: "pointer",
            transitionDuration: "0.2s",
            userSelect: "none",
            pointerEvents: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            "&:hover": {
                filter: "brightness(0.95)",
            },
        },
		iconWrapper: {
            height: "22px",
            width: "22px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
		codeIconButton: {
			color: theme.palette.grey[400],
		},
		deleteIconButton: {
			color: theme.palette.grey[400],
		},
		separator: {
			height: "35px",
			width: "1px",
			backgroundColor: theme.palette.grey[200],
		},
		rightBorder: {
			borderRightWidth: "2px",
			borderColor: theme.palette.grey[300],
		},
		loadingContainer: {
			padding: "10px"
		},
		circularProgress: {
			color: "#CBCEDB",
			display: "block"
		}
	})
);

export enum LinkState {
	TemporaryLink,
	LinkSelected,
	LinkNotSelected
}

// now we can render all what we want in the label
export const EditableLabelWidget: React.FunctionComponent<FlowAliasLabelWidgetProps> = (props) => {
	const [linkStatus, setLinkStatus] = React.useState<LinkState>(LinkState.LinkNotSelected);
	const [canUseQueryExpr, setCanUseQueryExpr] = React.useState(false);
	const [codeActions, setCodeActions] = React.useState([]);
	const [deleteInProgress, setDeleteInProgress] = React.useState(false);
	const classes = useStyles();
	const diagnostic = props.model?.link && props.model.link.hasError() ? props.model.link.diagnostics[0] : null;

	React.useEffect(() => {
		async function genModel() {
			const actions = (await handleCodeActions(props.model.context.filePath, props.model.link?.diagnostics, props.model.context.langClientPromise))
			setCodeActions(actions)
		}
		if (props.model.value) {
			genModel();
		}
	}, [props.model]);

	const onClickDelete = (evt?: React.MouseEvent<HTMLDivElement>) => {
		if (evt) {
			evt.preventDefault();
			evt.stopPropagation();
		}
		setDeleteInProgress(true);
		if (props.model.deleteLink) {
			props.model.deleteLink();
		}
	};

	const onClickEdit = (evt?: React.MouseEvent<HTMLDivElement>) => {
		if (evt) {
			evt.preventDefault();
			evt.stopPropagation();
		}
		props.model.context.enableStatementEditor({
			valuePosition: props.model.field.position,
			value: props.model.field.source,
			label: props.model.editorLabel
		});
	};



	const applyQueryExpression = (link: DataMapperLinkModel, targetRecord: Type) => {
		if (link.value
			&& (STKindChecker.isFieldAccess(link.value) || STKindChecker.isSimpleNameReference(link.value))) {
			const querySrc = generateQueryExpression(link.value.source, targetRecord);
			const position = link.value.position as NodePosition;
			const applyModification = props.model.context.applyModifications;
			applyModification([{
				type: "INSERT",
				config: {
					"STATEMENT": querySrc,
				},
				endColumn: position.endColumn,
				endLine: position.endLine,
				startColumn: position.startColumn,
				startLine: position.startLine
			}]);
		}
	};

	React.useEffect(() => {
		if (props.model?.link) {
			const link = props.model.link;
			link.registerListener({
				selectionChanged(event) {
					setLinkStatus(event.isSelected ? LinkState.LinkSelected : LinkState.LinkNotSelected);
				},
			});
			setCanUseQueryExpr(canConvertLinkToQueryExpr(link));
		} else {
			setLinkStatus(LinkState.TemporaryLink);
		}
	}, [props.model]);

	const loadingScreen = (
		<CircularProgress
			size={22}
			thickness={3}
			className={classes.circularProgress}
		/>
	);

	const elements: React.ReactNode[] = [
		(
			<>
				<div className={classes.element} onClick={onClickEdit}>
					<div className={classes.iconWrapper}>
						<CodeOutlinedIcon className={classes.codeIconButton} />
					</div>
				</div>
				<div className={classes.separator} />
				{deleteInProgress ? (
					<div className={clsx(classes.element, classes.loadingContainer)}>
						{loadingScreen}
					</div>
				) : (
					<div className={classes.element} onClick={onClickDelete} >
						<div className={classes.iconWrapper}>
							<DeleteIcon className={classes.deleteIconButton} />
						</div>
					</div>
				)}
			</>
		),
	];

	const additionalActions = [];
	if (canUseQueryExpr) {
		additionalActions.push({
			title: "Convert to Query",
			onClick: () => {
				const link = props.model.link;
				const targetPort = link.getTargetPort();

				if (targetPort instanceof RecordFieldPortModel) {
					const field = targetPort.field;
					if (
						field.typeName === PrimitiveBalType.Array &&
						field.memberType.typeName ===
						PrimitiveBalType.Record
					) {
						applyQueryExpression(link, field.memberType);
					}
				}
			},
		});
	}

	if (codeActions.length > 0 || additionalActions.length > 0) {
		elements.push(<div className={classes.separator} />);
		elements.push(
			<CodeActionWidget
				codeActions={codeActions}
				context={props.model.context}
				labelWidgetVisible={linkStatus === LinkState.LinkSelected}
				additionalActions={additionalActions}
			/>
		);
	}

	if (diagnostic) {
		elements.push(<div className={classes.separator} />);
		elements.push(
			<DiagnosticWidget
				diagnostic={diagnostic}
				value={props.model.value}
				onClick={onClickEdit}
				isLabelElement={true}
			/>
		);
	}

	let isSourceCollapsed = false;
	let isTargetCollapsed = false;
	const collapsedFields = props.model?.context?.collapsedFields;

	const source = props.model?.link?.getSourcePort()
	const target = props.model?.link?.getTargetPort()

	if (source instanceof RecordFieldPortModel) {
		if (source?.parentId) {
			const fieldName = getBalRecFieldName(source.field.name);
			isSourceCollapsed = collapsedFields?.includes(`${source.parentId}.${fieldName}`)
		} else {
			isSourceCollapsed = collapsedFields?.includes(source.portName)
		}
	}

	if (target instanceof RecordFieldPortModel) {
		if (target?.parentId) {
			const fieldName = getBalRecFieldName(target.field.name);
			isTargetCollapsed = collapsedFields?.includes(`${target.parentId}.${fieldName}`)
		} else {
			isTargetCollapsed = collapsedFields?.includes(target.portName)
		}
	}

	if (props.model?.valueNode && isSourceCollapsed && isTargetCollapsed){
		// for direct links, disable link widgets if both sides are collapsed
		return null
	} else if (!props.model?.valueNode && (isSourceCollapsed || isTargetCollapsed)) {
		// for links with intermediary nodes,
		// disable link widget if either source or target port is collapsed
		return null;
	}

	return linkStatus === LinkState.TemporaryLink
		? (
			<div
				className={clsx(
					classes.container
				)}
			>
				<div className={clsx(classes.element, classes.loadingContainer)}>
					{loadingScreen}
				</div>
			</div>
		) : (
			<div
				className={clsx(
					classes.container,
					linkStatus === LinkState.LinkNotSelected && !deleteInProgress && classes.containerHidden
				)}
			>
				{elements}
			</div>
		);
};
