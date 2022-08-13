import * as React from 'react';

import styled from '@emotion/styled';
import { Tooltip } from '@material-ui/core';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import QueryBuilderOutlinedIcon from '@material-ui/icons/QueryBuilderOutlined';
import { NodePosition, STKindChecker } from '@wso2-enterprise/syntax-tree';

import { getTypeDescForFieldName } from "../../../utils/st-utils";
import { CodeActionWidget } from '../CodeAction/CodeAction';
import {
	canConvertLinkToQueryExpr,
	generateQueryExpressionFromFormField,
	generateQueryExpressionFromTypeDesc
} from '../Link/link-utils';
import { FormFieldPortModel, STNodePortModel } from '../Port';
import { handleCodeActions } from "../utils/ls-utils";

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
	const [codeActions, setCodeActions] = React.useState([]);

	React.useEffect(() => {
		async function genModel() {
			const actions = (await handleCodeActions(props.model.context.filePath, props.model.link?.diagnostics, props.model.context.langClientPromise))
			setCodeActions(actions)
        }
  genModel();
	}, [props.model]);

	const onClickConvertToQuery = async () => {
		if (canUseQueryExpr) {
			const link = props.model.link;
			const sourcePort = link.getSourcePort() instanceof FormFieldPortModel
				? link.getSourcePort() as FormFieldPortModel
				: link.getSourcePort() as STNodePortModel;
			const targetPort = link.getTargetPort() instanceof FormFieldPortModel
				? link.getTargetPort() as FormFieldPortModel
				: link.getTargetPort() as STNodePortModel;
			let targetTypeDesc;

			if (targetPort instanceof STNodePortModel) {
				if (STKindChecker.isRecordField(targetPort.field)
					&& STKindChecker.isArrayTypeDesc(targetPort.field.typeName)
					&& STKindChecker.isRecordTypeDesc(targetPort.field.typeName.memberTypeDesc)
				) {
					targetTypeDesc = targetPort.field.typeName.memberTypeDesc;
				} else if (STKindChecker.isSpecificField(targetPort.field)) {
					const targetType = await getTypeDescForFieldName(targetPort.field.fieldName, props.model.context);
					if (STKindChecker.isRecordTypeDesc(targetType)) {
						targetTypeDesc = targetType;
					}
				}
				if (link.value && targetTypeDesc) {
					const querySrc = generateQueryExpressionFromTypeDesc(link.value.source, targetTypeDesc);
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
			} else if (targetPort instanceof FormFieldPortModel) {
				const field = targetPort.field;
				if (field.typeName === 'array' && field.memberType.typeName === 'record') {
					const querySrc = generateQueryExpressionFromFormField(link.value.source, field.memberType);
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
				<span style={{display: "flex"}}>
					<div>{!editable && linkSelected && <CodeOutlinedIcon onClick={() => setEditable(true)} />}</div>
					<div>{!editable && linkSelected && canUseQueryExpr &&
							(
						        <Tooltip title={"Make Query"} placement="top" arrow={true}>
									<QueryBuilderOutlinedIcon onClick={onClickConvertToQuery} />
								</Tooltip>
							)}
					</div>
					<div>{!editable && linkSelected && <DeleteIcon onClick={() => onClickDelete()} />}</div>
					{!editable && linkSelected && codeActions.length > 0 && <CodeActionWidget codeActions={codeActions} context={props.model.context} />}

				</span>
			</S.ActionsContainer>
		</S.Label>
	);
};
