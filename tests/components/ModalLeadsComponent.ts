import { Locator, Page, expect } from '@playwright/test';
import { ILead } from '../../fixtures/utils/data.model';

export class ModalLeadsComponent {
  readonly page: Page;
  readonly nameLocator: Locator;
  readonly emailLocator: Locator;
  readonly submitLocator: Locator;
  readonly modalLocator: Locator;

  constructor(page: Page){
    this.page = page;

    this.modalLocator = this.page.getByTestId('modal');
    this.nameLocator = this.modalLocator.locator('input[name=name]');
    this.emailLocator = this.modalLocator.locator('input[name=email]');
    this.submitLocator = this.modalLocator.getByRole('button', {name: /entrar na fila/});
  }

  toHaveHeading = async(text: string) => {
    await expect(this.modalLocator.getByRole('heading')).toHaveText(text);
  }

  toHaveAlert = async(text: string[] | string) => {
    await expect(this.modalLocator.locator('span.alert')).toHaveText(text);
  }

  do = async(data: ILead) => {
    await this.fill(data);
    await this.submit();
  }

  private fill = async(data: ILead) => {
    await this.nameLocator.fill(data.name);
    await this.emailLocator.fill(data.email);
  }

  private submit = async() => {
    await this.submitLocator.click();
  }
}