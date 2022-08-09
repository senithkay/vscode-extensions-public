import { Canvas } from "../../utils/components/canvas"
import { SourceCode } from "../../utils/components/code-view"
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget"
import { getCurrentSpecFolder } from "../../utils/file-utils"
import { HttpForm } from "../../utils/forms/connectors/http-form"
import { LogForm } from "../../utils/forms/log-form"
import { ResourceForm } from "../../utils/forms/resource-form"
import { ServiceForm } from "../../utils/forms/service-form"
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "service/add-service-to-empty-file.bal";

describe('add a http service to an empty file', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add new service with resource', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget
            .clickOption('Service');

        ServiceForm
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-service.expected.bal");
    });

    it('Add new service with different basepath and port number', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget
            .clickOption('Service');

        ServiceForm
            .typeServicePath('/hello')
            .typeListenerPort(8080)
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-service-diff-port.expected.bal");
    });

    it('Edit service', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget
            .clickOption('Service');

        ServiceForm
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-service.expected.bal");

        Canvas.getService('/').clickEdit();

        ServiceForm
            .typeServicePath('/hello')
            .typeListenerPort(8080)
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-service-diff-port.expected.bal");
    });

    it('Delete service', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget
            .clickOption('Service');

        ServiceForm
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-service.expected.bal");

        Canvas.getService('/').clickDelete();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "delete-service.expected.bal");
    });
})
