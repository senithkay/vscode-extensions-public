import * as React from 'react';

import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker } from '@wso2-enterprise/syntax-tree';

import { CodeActionWidget } from '../CodeAction/CodeAction';
import { DataMapperLinkModel } from "../Link";
import {
	canConvertLinkToQueryExpr,
	generateQueryExpression
} from '../Link/link-utils';
import { RecordFieldPortModel } from '../Port';
import { handleCodeActions } from "../utils/ls-utils";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { ExpressionLabelModel } from './ExpressionLabelModel';
import clsx from 'clsx';
export interface FlowAliasLabelWidgetProps {
	model: ExpressionLabelModel;
}

export const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		container: {
			borderRadius: '10px',
			display: 'flex',
			alignItems: 'center',
			overflow: 'hidden',
			boxShadow: '0px 5px 50px rgba(203, 206, 219, 0.5)',
		},
		containerHidden: {
			visibility: 'hidden'
		},
		element: {
			backgroundColor: theme.palette.common.white,
			padding: '10px',
			cursor: 'pointer',
			transitionDuration: '0.2s',
			userSelect: 'none',
			pointerEvents: 'auto',
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			'&:hover': {
				filter: 'brightness(0.95)'
			}
		},
		lightBulbWrapper: {
			height: "22px",
			width: "22px",
			backgroundColor: theme.palette.warning.light,

			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			borderRadius: "50%",
		},
		codeIcon: {
			color: theme.palette.grey[500]
		},
		deleteIcon: {
			color: theme.palette.error.main
		},
		separator: {
			height: '35px',
			width: '1px',
			backgroundColor: theme.palette.grey[200],
		},
		rightBorder: {
			borderRightWidth: '2px',
			borderColor: theme.palette.grey[300]
		}
	})
);

// now we can render all what we want in the label
export const EditableLabelWidget: React.FunctionComponent<FlowAliasLabelWidgetProps> = (props) => {
	const [linkSelected, setLinkSelected] = React.useState(false);
	const [canUseQueryExpr, setCanUseQueryExpr] = React.useState(false);
	const [codeActions, setCodeActions] = React.useState([]);
	const classes = useStyles();

	React.useEffect(() => {
		async function genModel() {
			const actions = (await handleCodeActions(props.model.context.filePath, props.model.link?.diagnostics, props.model.context.langClientPromise))
			setCodeActions(actions)
		}
		if (props.model.value) {
			genModel();
		}
	}, [props.model]);

	const onClickDelete = () => {
		if (props.model.deleteLink) {
			props.model.deleteLink();
		}
	};

	const onClickEdit = () => {
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
		const link = props.model.link;
		link.registerListener({
			selectionChanged(event) {
				setLinkSelected(event.isSelected);
			},
		});
		setCanUseQueryExpr(canConvertLinkToQueryExpr(link));
	}, [props.model]);

	const elements: React.ReactNode[] = [
		<>
			<div className={classes.element} onClick={onClickEdit}>
				<CodeOutlinedIcon className={classes.codeIcon} />
			</div>
			<div className={classes.separator} />
			<div className={classes.element} onClick={onClickDelete}>
				<DeleteIcon className={classes.deleteIcon} />
			</div>
		</>,
	];

	const additionalActions = [];
	if (canUseQueryExpr) {
		additionalActions.push({
			title: 'Convert to Query', onClick: () => {
				const link = props.model.link;
				const targetPort = link.getTargetPort();

				if (targetPort instanceof RecordFieldPortModel) {
					const field = targetPort.field;
					if (field.typeName === PrimitiveBalType.Array && field.memberType.typeName === PrimitiveBalType.Record) {
						applyQueryExpression(link, field.memberType);
					}
				}
			}
		});
	}

	if (codeActions.length > 0 || additionalActions.length > 0) {
		elements.push(<div className={classes.separator} />);
		elements.push(<CodeActionWidget
			codeActions={codeActions}
			context={props.model.context}
			labelWidgetVisible={linkSelected}
			additionalActions={additionalActions}
		/>);
	}

	return <div className={clsx(classes.container, !linkSelected && classes.containerHidden)}>{elements}</div>;
};
