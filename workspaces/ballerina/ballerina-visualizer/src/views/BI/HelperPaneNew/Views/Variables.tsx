import { useSlidingPane } from "@wso2/ui-toolkit/lib/components/ExpressionEditor/components/Common/SlidingPane/context"
import { ExpandableList } from "../Components/ExpandableList"
import { VariableTypeIndifcator } from "../Components/VariableTypeIndicator"
import { SlidingPaneNavContainer } from "@wso2/ui-toolkit/lib/components/ExpressionEditor/components/Common/SlidingPane"

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
     const { params } = useSlidingPane();
    return(
        <ExpandableList>
            {variablesList.map((variable) => (
                variable.isRow ?
                    <SlidingPaneNavContainer>
                        <ExpandableList.Item>
                            <VariableTypeIndifcator type={variable.type}/>
                        <span>{params}</span>
                    </ExpandableList.Item>
                    </SlidingPaneNavContainer>
                    :
                    <SlidingPaneNavContainer to="PAGE3" data>
                        <ExpandableList.Item>
                            <VariableTypeIndifcator type={variable.type}/>
                            <span>{variable.name}</span>
                        </ExpandableList.Item>
                    </SlidingPaneNavContainer>
            ))}
        </ExpandableList>
    )
}