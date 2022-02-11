import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { ConnectorForm } from "../../../utils/forms/connector-form";
import { GoogleSheetForm } from "../../../utils/forms/connectors/google-sheet-form";
import { getIntegrationTestStoryURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/connector/add-connector-to-function.bal";

describe('Add connector to function via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
  })

  it('Add a google-sheet connector and save', () => {
    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Connector");

    ConnectorForm
      .shouldBeVisible()
      .waitForConnectorsLoading()
      .searchConnector("Sheet")
      .waitForConnectorsLoading()
      .selectConnector("google sheets")

    GoogleSheetForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .haveDefaultName()
      .typeConnectionName("gsheet")
      .typeToken('"hello-world"')
      .saveConnection();
  })


  it('Add a google-sheet connector and invoke', () => {
    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Connector");

    ConnectorForm
      .shouldBeVisible()
      .waitForConnectorsLoading()
      .searchConnector("Sheet")
      .waitForConnectorsLoading()
      .selectConnector("google sheets")

    GoogleSheetForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .haveDefaultName()
      .typeConnectionName("gsheet")
      .typeToken('"hello-world"')
      .continueToInvoke()
      .selectOperation("addSheet")
      .addSheetFill("id123", "sheet1")
      .save();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "google-sheet.expected.bal");
  })

  it('Open and Close Form', () => {
    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Connector");

    ConnectorForm
      .shouldBeVisible()
      .close();

  });

})
