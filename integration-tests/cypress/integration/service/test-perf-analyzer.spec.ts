import { Canvas } from "../../utils/components/canvas"
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

describe('Test Performance Analyzer', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL("service/perf-analyzer.bal"))
  })

  it('Test Performance Analyzer', () => {
    Canvas.getService("/")
      .getResourceFunction("GET", "hello")
      .getDiagram()
      .shouldBeRenderedProperly()
      .shouldHavePerfBar()
      .assertPerfText("Forecasted performance for concurrency 1 - 50 | Latency: 46  ms - 3.738  s | Tps: 8.28 - 21.66 req/s");

    Canvas.getService("/")
      .getResourceFunction("GET", "hello")
      .getDiagram()
      .getAdvancedPerfData()
      .assertPerfText("Forecasted performance for concurrency 1 | Latency: 137  ms | Tps: 7.28 req/s");

    Canvas.getService("/")
      .getResourceFunction("GET", "hello")
      .getDiagram()
      .assertPerfLabel(0, "46 ms");

    Canvas.getService("/")
      .getResourceFunction("GET", "hello")
      .getDiagram()
      .assertPerfLabel(1, "45 ms");

    Canvas.getService("/")
      .getResourceFunction("GET", "hello")
      .getDiagram()
      .assertPerfLabel(2, "47 ms");

    Canvas.getService("/")
      .getResourceFunction("GET", "hello2/fxx")
      .expand()
      .getDiagram()
      .shouldBeRenderedProperly()
      .shouldHavePerfBar()
      .assertPerfText("Forecasted performance for a single user: Latency: 3.738  s | Tps: 21.66 req/s");

    Canvas.getService("/")
      .getResourceFunction("GET", "hello2/fxx")
      .getDiagram()
      .assertPerfButton("Insufficient data to provide detailed estimations");

    Canvas.getService("/")
      .getResourceFunction("GET", "hello2/fxx")
      .getDiagram()
      .getAdvancedPerfData()
      .assertPerfText("Forecasted performance for a single user: Latency: 3.738  s | Tps: 21.66 req/s");

  })
})
