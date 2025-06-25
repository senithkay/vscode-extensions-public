import { SlidingPaneNavContainer } from "@wso2-enterprise/ui-toolkit/lib/components/ExpressionEditor/components/Common/SlidingPane"
import { ExpandableList } from "../Components/ExpandableList"
import { Codicon } from "@wso2-enterprise/ui-toolkit"
import { VariableTypeIndifcator } from "../Components/VariableTypeIndicator"

const variablesList = [
    {
        type: "int",
        name: "age",
        isRow: true
    },
    {
        type: "string",
        name: "name",
        isRow: true
    },
    {
        type: "Person",
        name: "person",
        isRow: false
    }
]

export const Variables = () => {
    return(
        <ExpandableList>
            {variablesList.map((variable) => (
                variable.isRow ?
                     <ExpandableList.Item>
                        <VariableTypeIndifcator type={variable.type}/>
                        <span>{variable.name}</span>
                    </ExpandableList.Item>
                    :
                     <SlidingPaneNavContainer to="PAGE3">
                        <ExpandableList.Item>
                            <VariableTypeIndifcator type={variable.type}/>
                            <span>{variable.name}</span>
                        </ExpandableList.Item>
                    </SlidingPaneNavContainer>
            ))}
        </ExpandableList>
    )
}