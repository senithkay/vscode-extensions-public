import { ExpressionEditor } from "../components/expression-editor";

export class EnumerationForm {
  private static selector = '[data-testid="enum-form"]';

  static clickWhiteSpace() {
    this.getForm().click();
    return this;
  }

  static haveEnumName(name: string) {
    this.getForm().should("contain", name);
    return this;
  }

  static editRecord() {
    this.getForm().within(() => {
      cy.get("[id=edit-button]").click();
    });
    return this;
  }

  static typeEnumName(name: string) {
    this.getForm()
      .get('[placeholder="Enum name"]')
      .type("{selectall}{del}{esc}", { delay: 100 })
      .type(name, { delay: 100 })
      .type("{enter}", { delay: 100 });
    return this;
  }

  static addNewMember(member: string) {
    this.getForm().within(() => {
      cy.contains("Add Member").parent().click().wait(3000);
    });
    this.getForm()
      .get('[placeholder="Member name"]')
      .type(member, { delay: 100 })
      .type("{enter}", { delay: 100 });
    return this;
  }

  static shouldBeVisible() {
    this.getForm().should("be.visible");
    return this;
  }

  static clickAddExpression() {
    this.getForm().get('[data-testid="plus-button"]').first().click();
    return this;
  }

  private static getForm() {
    return cy.get(this.selector);
  }

  static save() {
    this.getForm().get("button").contains("Save").click();
    return this;
  }
}
