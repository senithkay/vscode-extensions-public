import * as React from 'react';

import styled from '@emotion/styled';
import { Tooltip } from '@material-ui/core';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import QueryBuilderOutlinedIcon from '@material-ui/icons/QueryBuilderOutlined';
import { NodePosition, STKindChecker } from '@wso2-enterprise/syntax-tree';

import { canConvertLinkToQueryExpr, generateQueryExpression, generateQueryExpressionNew } from '../Link/link-utils';
import { FormFieldPortModel } from '../Port';
import { STNodePortModel } from "../Port/model/STNodePortModel";

import { ExpressionLabelModel } from './ExpressionLabelModel';


export interface FlowAliasLabelWidgetProps {
	model: ExpressionLabelModel;
}

namespace S {
	// NOTE: this CSS rules allows to interact with elements in label
	export const Label = styled.div`
		user-select: none;
		pointer-events: auto;
		cursor: pointer;
		color: #5567D5;
	`;

	export const ActionsContainer = styled.div`
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
	`;
}

// now we can render all what we want in the label
export const EditableLabelWidget: React.FunctionComponent<FlowAliasLabelWidgetProps> = (props) => {
	const [str, setStr] = React.useState(props.model.value);
	const [editable, setEditable] = React.useState(false);
	const [linkSelected, setLinkSelected] = React.useState(false);
	const [canUseQueryExpr, setCanUseQueryExpr] = React.useState(false);

	const onClickConvertToQuery = () => {
		if (canUseQueryExpr) {
			const link = props.model.link;
			const sourcePort = link.getSourcePort() instanceof FormFieldPortModel
				? link.getSourcePort() as FormFieldPortModel
				: link.getSourcePort() as STNodePortModel;
			const targetPort = link.getTargetPort() instanceof FormFieldPortModel
				? link.getTargetPort() as FormFieldPortModel
				: link.getTargetPort() as STNodePortModel;

			if (sourcePort instanceof STNodePortModel && STKindChecker.isRecordField(sourcePort.field)) {
				const fieldType = sourcePort.field.typeName;
				if (STKindChecker.isArrayTypeDesc(fieldType) && STKindChecker.isRecordTypeDesc(fieldType.memberTypeDesc)) {
					const querySrc = generateQueryExpression(link.value.source, fieldType.memberTypeDesc, undefined);
					console.log(querySrc);
					if (link.value) {
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
				}
			} else if (sourcePort instanceof FormFieldPortModel) {
				const field = sourcePort.field;
				if (field.typeName === 'array' && field.memberType.typeName === 'record') {
					const querySrc = generateQueryExpressionNew(link.value.source, field.memberType);
					console.log(querySrc);
					if (link.value) {
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
				}
			}

		}
	};

	const onClickDelete = () => {
		// TODO implement the delete link logic
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

	return (
		<S.Label>
			{editable &&
				<input

					size={str.length}
					spellCheck={false}
					style={{
						padding: "5px",
						fontFamily: "monospace",
						zIndex: 1000,
						border: "1px solid #5567D5"
					}}
					autoFocus={true}
					value={str}
					onChange={(event) => {
						const newVal = event.target.value;

						// update value both in internal component state
						setStr(newVal);
						// and in model object
						props.model.value = newVal;
					}}
					onKeyUp={(evt) => {
							if (evt.key === "Escape") {
								setEditable(false);
							}
							if (evt.key === "Enter") {
								props.model.updateSource();
							}
						}
					}
					onBlur={() => setEditable(false)}
				/>
			}
			<S.ActionsContainer>
				<span style={{display: "flex", alignItems: "center"}}>
					<div>{!editable && linkSelected && <CodeOutlinedIcon onClick={() => setEditable(true)} />}</div>
					<div>{!editable && linkSelected && canUseQueryExpr &&
							(
						        <Tooltip title={"Make Query"} placement="top" arrow={true}>
									<QueryBuilderOutlinedIcon onClick={onClickConvertToQuery} />
								</Tooltip>
							)}
					</div>
					<div>{!editable && linkSelected && <DeleteIcon onClick={() => onClickDelete()} />}</div>

				</span>
			</S.ActionsContainer>
		</S.Label>
	);
};
