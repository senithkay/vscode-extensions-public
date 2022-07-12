import * as React from 'react';

import { ExpressionLabelModel } from './ExpressionLabelModel';
import styled from '@emotion/styled';
import Button from '@material-ui/core/Button'
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import { canConvertLinkToQueryExpr } from '../Link/link-utils';


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
					autoFocus
					value={str}
					onChange={(event) => {
						const newVal = event.target.value;

						// update value both in internal component state
						setStr(newVal);
						// and in model object
						props.model.value = newVal;
					}}
					onKeyUp={(evt) => {
							if(evt.key === "Escape") {
								setEditable(false);
							}
							if(evt.key === "Enter") {
								props.model.updateSource();
							}
						}
					}
					onBlur={() => setEditable(false)}
				/>
			}
			<S.ActionsContainer>
				<div>{!editable && linkSelected && <CodeOutlinedIcon onClick={() => setEditable(true)} />}</div>
				<div>{!editable && linkSelected && canUseQueryExpr && <Button>make Query</Button>}</div>
			</S.ActionsContainer>
		</S.Label>
	);
};
