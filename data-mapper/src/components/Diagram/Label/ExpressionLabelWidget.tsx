import * as React from 'react';

import styled from '@emotion/styled';
import { Tooltip } from '@material-ui/core';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import QueryBuilderOutlinedIcon from '@material-ui/icons/QueryBuilderOutlined';
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from '@wso2-enterprise/syntax-tree';

import { CodeActionWidget } from '../CodeAction/CodeAction';
import { DataMapperLinkModel } from "../Link";
import {
	canConvertLinkToQueryExpr,
	generateQueryExpression
} from '../Link/link-utils';
import { FormFieldPortModel, SpecificFieldPortModel } from '../Port';
import { handleCodeActions } from "../utils/ls-utils";
import { RecordTypeDescriptorStore } from "../utils/record-type-descriptor-store";

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
			const targetPort = link.getTargetPort() instanceof FormFieldPortModel
				? link.getTargetPort() as FormFieldPortModel
				: link.getTargetPort() as SpecificFieldPortModel;

			if (targetPort instanceof SpecificFieldPortModel) {
				const fieldNamePosition = targetPort.field.fieldName.position;
				const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
				const targetType = recordTypeDescriptors.getTypeDescriptor({
					startLine: fieldNamePosition.startLine,
					startColumn: fieldNamePosition.startColumn,
					endLine: fieldNamePosition.startLine,
					endColumn: fieldNamePosition.startColumn
				});
				if (targetType && targetType.typeName === 'array' && targetType.memberType.typeName === 'record')
				{
					applyQueryExpression(link, targetType.memberType);
				}
			} else if (targetPort instanceof FormFieldPortModel) {
				const field = targetPort.field;
				if (field.typeName === 'array' && field.memberType.typeName === 'record') {
					applyQueryExpression(link, field.memberType);
				}
			}
		}
	};

	const onClickDelete = () => {
		// TODO implement the delete link logic
	};

	const applyQueryExpression = (link: DataMapperLinkModel, targetRecord: FormField) => {
		if (link.value) {
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
