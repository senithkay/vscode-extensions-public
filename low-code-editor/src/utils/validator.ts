import { FormField } from "../ConfigurationSpec/types";
import { keywords } from "../Diagram/components/Portals/utils/constants";

export function validatePath(text: string) {
    if (text !== "") {
        if ((text.match(/\[/g)?.length !== text.match(/\]/g)?.length) ||
            (text.charAt(text.length - 1) === "/") || (text.charAt(0) === "/")) {
            return false;
        }

        const splitPath = text.split("/");
        for (const word of splitPath) {
            if (keywords.includes(word)) {
                return false;
            }
        }

        if (text.includes("/") && text.includes("[") && text.includes("]")) {
            if (text.match(/\/\d/g)) return false;
            const paramArray = (text.match(/\[([^\[\]]*)\]/g));
            const arrayLength = paramArray.length;
            for (let i = 0; i < arrayLength; i++) {
                const splitString = paramArray[i].split(" ")
                if (!keywords.includes(splitString[0].slice(1)) || keywords.includes(splitString[1].slice(0, -1)) || (splitString[1].slice(0, -1) === "")) {
                    return false;
                }
                text = text.replace(paramArray[i], "")
            }
            return ((/^[a-zA-Z0-9\/\[\].]+$/g.test(text)) && (!/^\d/g.test(text)))
        } else if (!text.includes("/") && text.includes("[") && text.includes("]")) {
            return false;
        } else if (text === "[]") {
            return false;
        } else if (text.match(/\/\d/g)) {
            return false;
        } else {
            return ((/^[a-zA-Z0-9\/\[\]]+$/g.test(text)) && (!/^\d/g.test(text)));
        }
    } else {
        return true;
    }
}

export function validateFormFields(field: FormField, emptyFieldChecker: Map<string, boolean>): boolean {
    let allFieldsValid = true;
    if (field.type === "record" && !field.optional) {
        for (const recordField of field.fields) {
            allFieldsValid = validateFormFields(recordField, emptyFieldChecker);
            if (!allFieldsValid) {
                break;
            }
        }
    } else if (field.type === "union" && !field.optional) {
        const isFieldValueInValid: boolean = emptyFieldChecker.get(field.name);
        // breaks the loop if one field is empty
        if (isFieldValueInValid !== undefined && isFieldValueInValid) {
            allFieldsValid = !isFieldValueInValid;
        }
    } else if (!field.optional) {
        const isFieldValueInValid: boolean = emptyFieldChecker.get(field.name);
        // breaks the loop if one field is empty
        if (isFieldValueInValid !== undefined && isFieldValueInValid) {
            allFieldsValid = !isFieldValueInValid;
        }
    }
    return allFieldsValid;
}
