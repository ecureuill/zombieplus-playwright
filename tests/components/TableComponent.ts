import { Locator, Page, expect } from "@playwright/test";

export class TableComponent {
  private readonly page: Page;
  private readonly tableLocator: Locator;
  private readonly keyLocator: string;

  constructor(page: Page, keyLocator: string){
    this.page = page;
    this.keyLocator = keyLocator;
    this.tableLocator = this.page.getByRole('table');
  }

  private getColumnClassLocator = (title:string) => {
    const regex = new RegExp(`^${title}$`);
    return this.tableLocator.locator(this.keyLocator, { hasText: regex });
  }

  private getByTextLocator = (text:string) => {
    return this.tableLocator.getByText(text);
  }

  deleteByColumnClassLocator = async (text:string) => {
    const item = this.getColumnClassLocator(text);
    await this.delete(item);
  }

  deleteByTextLocator = async (text:string) => {
    const item = this.getByTextLocator(text);
    await this.delete(item);
  }

  private delete = async (item: Locator) => {
    const row = item.locator('..');
    const deleteButton = row.getByRole('button');
    await deleteButton.click(); 
  
  }

  isRowRemoved = async (title:string) => {
    const item = this.getColumnClassLocator(title);
    await expect(item).not.toBeVisible();
  }

  isRowCountEqual = async (length:number) => {
    const rows = this.tableLocator.getByRole('row');
    expect(await rows.count()).toEqual(length);
  }

  contains = async (title:string) => {
    await expect(this.getColumnClassLocator(title)).toBeVisible();
  }
}