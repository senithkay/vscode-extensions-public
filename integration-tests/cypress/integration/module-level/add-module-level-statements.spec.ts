import { BlockLevelPlusWidget } from "../../utils/components/block-level-plus-widget";
import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { ConfigurableForm } from "../../utils/forms/configurable-form";
import { ConstantForm } from "../../utils/forms/constant-form";
import { EnumerationForm } from "../../utils/forms/enumeration-form";
import { FunctionForm } from "../../utils/forms/function-form";
import { ListenerForm } from "../../utils/forms/listener-form";
import { LogForm } from "../../utils/forms/log-form";
import { OtherForm } from "../../utils/forms/other-form";
import { RecordForm } from "../../utils/forms/record-form";
import { VariableFormModuleLevel } from "../../utils/forms/variable-form-module-level";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "default/empty-file.bal";

describe('Add module-level statements via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Add a variable to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Variable");

    VariableFormModuleLevel.shouldBeVisible()
      .togglePublickAccessModifier()
      .isAccessModifierChecked("public")
      .toggleFinalkAccessModifier()
      .isAccessModifierChecked("public,final")
      .typeVariableType("string")
      .typeLabalShouldBeVisible("string")
      .typeVariableName("foo")
      .typeVariableValue('"Hello World"')
      .save();

    Canvas
      .clickTopLevelPlusButton(2);
    TopLevelPlusWidget.clickOption("Variable");

    VariableFormModuleLevel.shouldBeVisible()
      .togglePublickAccessModifier()
      .isAccessModifierChecked("public")
      .typeVariableType("string")
      .typeLabalShouldBeVisible("string")
      .typeVariableName("foo_public")
      .typeVariableValue('"Hello"')
      .save();

    Canvas
      .clickTopLevelPlusButton(3);
    TopLevelPlusWidget.clickOption("Variable");

    VariableFormModuleLevel.shouldBeVisible()
      .toggleFinalkAccessModifier()
      .isAccessModifierChecked("final")
      .typeVariableType("string")
      .typeLabalShouldBeVisible("string")
      .typeVariableName("foo_final")
      .typeVariableValue('"World"')
      .save();
  })

  it('Add a record to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Record");

    RecordForm.shouldBeVisible()
      .typeRecordName("Animal")
      .clickWhiteSpace()
      .haveRecordName("Animal")
      .editRecord()
      .typeRecordName("Foo")
      .clickWhiteSpace()
      .haveRecordName("Foo")
      .makePublicRecord()
      .toggleClosedRecord()
      .addNewField("int", "hello") //Have an issue here when adding default value
      .clickWhiteSpace()
      .addNewField("int", "world")
      .deleteFirstField("hello")
      .save()
  })

  it('Add a configurable to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Configurable");

    ConfigurableForm.shouldBeVisible()
      .togglePublickAccessModifier()
      .isAccessModifierChecked("public")
      .typeConfigurableType("string")
      .typeConfigurableName("foo")
      .toggleDefaultValue()
      .typeVariableValueShouldBeVisible()
      .typeLabalShouldBeVisible("string")
      .typeVariableValue('"Hello World"')
      .save()

  })

  it('Add a constant to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Constant");

    ConstantForm.shouldBeVisible()
      .togglePublickAccessModifier()
      .isAccessModifierChecked("public")
      .typeConstantName("foo")
      .toggleTypeDeclaration()
      .selectType("string")
      .typeLabalShouldBeVisible("string")
      .typeVariableValue('"Hello World"')
      .save()
  })

  it('Add a listener to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Listener");

    ListenerForm.shouldBeVisible()
      .typeListenerName("hello")
      .typeListenerPortValue(9090)
      .save()
  })

  it('Add a enum to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Enum");

    EnumerationForm.shouldBeVisible()
      .typeEnumName("Foo")
      .clickWhiteSpace()
      .haveEnumName("Foo")
      .addNewMember("RED")
      .addNewMember("GREEN")
      .addNewMember("BLUE")
      .save();
  })

  it('Add a other statement to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Other");

    OtherForm.shouldBeVisible()
      .typeStatement("int x = 123;")
      .save();
  })
})
