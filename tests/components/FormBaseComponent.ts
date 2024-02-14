import { Locator, Page, expect } from "@playwright/test";

export class FormBaseComponent {
  readonly page: Page;

  readonly formLocator: Locator;
  private readonly submitLocator: Locator;

  constructor(page: Page){
    this.page = page; 

    this.formLocator = this.page.locator('form');
    this.submitLocator = this.page.locator('[type=submit]');
  }

  toHaveAlert = async(text: string[] | string) => {
    await expect(this.formLocator.locator('span.alert')).toHaveText(text);
  }

  submit = async () => {
    await this.submitLocator.click();
  }

  
}