import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { GoogleSheetForm } from "../../utils/forms/connectors/google-sheet-form";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";

const BAL_FILE_PATH = "custom-connector/edit-gsheet-connector.bal";

describe('edit and delete google-sheet connector', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('edit a google-sheet connector and save', () => {
    Canvas
      .getConnector('gsheet')
      .clickEdit();

    GoogleSheetForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .typeToken('"new-Token"')
      .saveConnection();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "edit-gsheet-connector.expected.bal");
  })

  it('delete a google-sheet', () => {
    Canvas
      .getConnector('gsheet')
      .clickDelete();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "delete-gsheet-connector.expected.bal");
  })

})
