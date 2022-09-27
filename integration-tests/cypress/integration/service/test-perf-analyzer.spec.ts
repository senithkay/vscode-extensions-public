import { Canvas } from "../../utils/components/canvas"
import { FunctionDiagram } from "../../utils/components/diagram";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "service/perf-analyzer.bal";

describe('Test Performance Analyzer', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Test Performance Analyzer', () => {
    const diagram = Canvas.getService("/")
      .getResourceFunction("GET", "hello")
      .getDiagram();

    diagram
      .shouldBeRenderedProperly()
      .shouldHavePerfBar()
      .assertPerfText("Forecasted performance of the critical path: Concurrency 1 | Latency: 46  ms - 3.74  s | Tps: 8.28 - 21.66");


    diagram.assertPerfLabel(0, "19  ms - 18  ms");

    diagram.assertPerfLabel(1, "106  ms - 7.26  s");

    diagram.assertPerfLabel(2, "116  ms - 7.26  s");

    const diagram2 = Canvas.getService("/")
      .getResourceFunction("GET", "stats/[string shortCountryName]")
      .expand()
      .getDiagram();

    diagram2
      .shouldBeRenderedProperly()
      .shouldHavePerfBar()
      .assertPerfText("Forecasted performance of the critical path: Concurrency 1 - 50 | Latency: 107  ms - 7.28  s | Tps: 4.56 - 9.39");

    diagram2.assertPerfLabel(0, "256  ms - 5.28  s");

    diagram2
      .getAdvancedPerfData()
      .assertPerfText("Forecasted performance of the selected path: Concurrency 1 - 50 | Latency: 107  ms - 7.28  s | Tps: 6.25 - 9.39");

    diagram2.assertPerfLabel(0, "106  ms - 7.28  s");
    diagram2.assertControlFlowLineCount(14);

  })
})
