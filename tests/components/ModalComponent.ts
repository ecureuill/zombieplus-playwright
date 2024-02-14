import { Locator, Page, expect } from "@playwright/test";

export class ModalComponent {
  readonly page: Page;
  readonly modal: Locator;
  readonly buttonLocator: Locator;

  constructor(page:Page){
    this.page = page;
    this.modal = this.page.getByRole('dialog');
    this.buttonLocator = this.modal.getByRole('button');
  }

  close = async() => {
    await this.buttonLocator.click();
    await this.isClosed();
  }

  isClosed = async () => {
    await expect(this.modal).not.toBeVisible();
  }

  isOpened = async (title: string, text: RegExp) => {
    await expect (this.modal).toBeVisible();
    await expect (this.modal.getByRole('heading', {name: title})).toBeVisible();
    await expect (this.modal.getByText(text)).toBeVisible();
  }
}