import * as React from 'react';

import { ExpressionLabelModel } from './ExpressionLabelModel';
import styled from '@emotion/styled';
import EditIcon from '@material-ui/icons/Edit';


export interface FlowAliasLabelWidgetProps {
	model: ExpressionLabelModel;
}

namespace S {
	// NOTE: this CSS rules allows to interact with elements in label
	export const Label = styled.div`
		user-select: none;
		pointer-events: auto;
	`;
}

// now we can render all what we want in the label
export const EditableLabelWidget: React.FunctionComponent<FlowAliasLabelWidgetProps> = (props) => {
	const [str, setStr] = React.useState(props.model.value);
	const [editable, setEditable] = React.useState(false);

	return (
		<S.Label>
			{editable && 
				<input
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
						}
					}
					onBlur={() => setEditable(false)}
				/>
			}
			{!editable && <EditIcon onClick={() => setEditable(true)} />}
		</S.Label>
	);
};
