import { Page } from "@playwright/test";
import { FormBaseComponent } from '../components/FormBaseComponent';
import { HeaderComponent } from '../components/HeaderComponent';
import { ModalComponent } from '../components/ModalComponent';
import { PopupComponent } from '../components/PopupComponent';
import { TableComponent } from '../components/TableComponent';

export abstract class BasePage {
  readonly page: Page;
  private readonly url: string;
  modal: ModalComponent;
  form: FormBaseComponent;
  table: TableComponent;
  header: HeaderComponent;
  popup: PopupComponent;


  constructor(page: Page, url: string){
    this.page = page;
    this.url = url;
  }

  go = async () => {
    await this.page.goto(this.url);
    await this.page.waitForLoadState();
  }
}