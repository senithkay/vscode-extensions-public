// localEntryLogic.ts
import * as fs from "fs";

export function generateXmlData(
  name: string,
  type: string,
  value: string,
  URL: string
): string {
  const endpointType = type.toLowerCase();

  let localEntryAttributes = "";
  let otherAttributes = "";
  let closingAttributes = `</${endpointType}>`;
  if (endpointType === "in-line text entry") {
    localEntryAttributes = `<![CDATA[${value}]]>`;
  } else if (endpointType === "in-line xml entry") {
    const match = value.match(/<xml[^>]*>([\s\S]*?)<\/xml>/i);
    const filteredCode = match ? match[1] : "";
    localEntryAttributes = `<xml>${filteredCode}</xml>`;
  } else if (endpointType === "source url entry") {
    otherAttributes = `src="${URL}"`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<localEntry key="${name}" ${otherAttributes} xmlns="http://ws.apache.org/ns/synapse">
    ${localEntryAttributes}
</localEntry>`;
}

export function writeXmlDataToFile(filePath: string, xmlData: string): void {
  fs.writeFileSync(filePath, xmlData);
}
