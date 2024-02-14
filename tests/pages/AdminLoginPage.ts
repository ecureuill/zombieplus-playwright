import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { FormBaseComponent } from "../components/FormBaseComponent";
import { ILogin } from "../../fixtures/utils/data.model";
import { ModalComponent } from "../components/ModalComponent";

export class AdminLoginPage extends BasePage{
  readonly page: Page
  private formComponent: FormBaseComponent;
  private modalAlert: ModalComponent;

  constructor(page: Page) {
    super(page, '/admin/login');
    this.page = page
  }

  do = async (credential: ILogin) => {
    await this.go();
    this.init();
    await this.submit(credential);
    await this.page.waitForLoadState('networkidle');
    //Fix delayed redirection to admin/movies
    await this.page.waitForURL('/admin/movies');
  }
  
  init = () => {
    this.formComponent = new FormBaseComponent(this.page);
  }
  submit = async (credential: ILogin) => {
    await expect(this.formComponent.formLocator).toBeVisible();
    await this.formComponent.formLocator.getByPlaceholder('E-mail').fill(credential.email)
    await this.formComponent.formLocator.locator('input[type=password]').fill(credential.pwd)
    await this.formComponent.submit();
  }
  
  isAlertModalOpened = async(title: string, text: RegExp) => {
    this.modalAlert = new ModalComponent(this.page)
    await this.modalAlert.isOpened(title, text);
  }

  toHaveAlert = async (text: string | string[]) => {
    await this.formComponent.toHaveAlert(text);
  }

}