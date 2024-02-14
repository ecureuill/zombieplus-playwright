import { Locator, Page, expect } from "@playwright/test";
import { FormBaseComponent } from "./FormBaseComponent";

export class SearchBarComponent {
  private readonly page: Page;
  private forms: FormBaseComponent;
  private inputLocator: Locator;
  private clearButtonLocator: Locator;

  constructor(page: Page){
    this.page = page;
  }

  init = async (placeholder:string) => {
    this.forms = new FormBaseComponent(this.page);
    await expect(this.forms.formLocator).toBeVisible();
    
    this.inputLocator = this.forms.formLocator.getByPlaceholder(placeholder);
    await expect(this.inputLocator).toBeVisible();
  }

  initClearButton = async () => {
    this.clearButtonLocator = this.forms.formLocator.getByRole('img').nth(1);
  }

  isClearButtonVisible = async () => {
    await expect(this.clearButtonLocator).toBeVisible();
  }

  isEmpty = async () => {
    await expect(this.inputLocator).toHaveValue('');
  }

  search = async (title:string) => {
    await this.inputLocator.fill(title);
    await this.forms.submit();
  }

  clear = async () => {
    await this.clearButtonLocator.click();
  }
}