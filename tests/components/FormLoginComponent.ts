import { Locator, Page, expect } from "@playwright/test";
import { FormBaseComponent } from "./FormBaseComponent";
import { ILogin } from "../../fixtures/utils/data.model";

export class FormLoginComponent extends FormBaseComponent {

  readonly pwdLocator: Locator;
  readonly emailLocator: Locator;

  constructor(page: Page){
    super(page);

    this.pwdLocator = this.formLocator.getByPlaceholder('senha');
    this.emailLocator = this.formLocator.getByPlaceholder('e-mail');
  }

  fill = async(data: ILogin) => {
    this.pwdLocator.fill(data.email);
    this.pwdLocator.fill(data.pwd);
  }
}