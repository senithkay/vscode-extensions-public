import * as React from 'react';

import { ExpressionLabelModel } from './ExpressionLabelModel';
import styled from '@emotion/styled';
import EditIcon from '@material-ui/icons/Edit';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';


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
}

// now we can render all what we want in the label
export const EditableLabelWidget: React.FunctionComponent<FlowAliasLabelWidgetProps> = (props) => {
	const [str, setStr] = React.useState(props.model.value);
	const [editable, setEditable] = React.useState(false);
	const [linkSelected, setLinkSelected] = React.useState(false);

	React.useEffect(() => {
		props.model.link.registerListener({
			selectionChanged(event) {
				setLinkSelected(event.isSelected);
			},
		})
	});

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
			{!editable && linkSelected && <CodeOutlinedIcon onClick={() => setEditable(true)} />}
		</S.Label>
	);
};
