import { Locator, Page, expect } from "@playwright/test";

export class PopupComponent {
  private readonly page: Page;
  private readonly popupLocator: Locator;

  constructor(page: Page){
    this.page = page;
    this.popupLocator = this.page.getByRole('tooltip');
  }

  isPopupOpen = async (text:string) => {
    await expect(this.popupLocator).toHaveText(text);
  }

  doAction = async () => {
    await this.popupLocator.locator('.confirm-removal').click();
  }
}