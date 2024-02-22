import { StatusMessage, SmallProgressRing } from "./StyledComp";

export function Loading() {
    return (
        <StatusMessage>
            <SmallProgressRing />
            <div>Transforming into FHIR resource, Please wait ...</div>
        </StatusMessage>
    );
}
