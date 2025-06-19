import { Codicon } from "@wso2-enterprise/ui-toolkit"
import { HorizontalListContainer, HorizontalListItem, HorizontalListItemLeftContent } from "../styles/HorizontalList"


export const ExpandableList = () => {
    return (
        <HorizontalListContainer>
            <ExpandableListItem title="Construct Record" icon={<Codicon name="bracket-dot" />}/>
            <ExpandableListItem title="Suggestions" icon={<Codicon name="lightbulb" />}/>
            <ExpandableListItem title="Functions" icon={<Codicon name="variable-group" />}/>
            <ExpandableListItem title="Configurables" icon={<Codicon name="settings" />}/>
        </HorizontalListContainer>
    )
}

type ExpandableListItemProps = {
    title: string;
    icon: React.ReactElement;
}

const ExpandableListItem = ({title, icon}:ExpandableListItemProps) => {
    return (
        <HorizontalListItem>
            <HorizontalListItemLeftContent>
                {icon}
                <span>{title}</span>
            </HorizontalListItemLeftContent>
            <Codicon name="chevron-right" />
        </HorizontalListItem>
    )
}
