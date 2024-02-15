import { expect, Locator } from "@playwright/test";
import { Page} from "playwright-core";
import { BasePage } from "./BasePage";
import { ModalLeadsComponent } from "../components/ModalLeadsComponent";
import { ModalComponent } from "../components/ModalComponent";

export class HomePage extends BasePage {
  readonly modalLeadsBtnLocator: Locator;
  modalLeads: ModalLeadsComponent;

  constructor(page: Page) {
    super(page, '/');
    this.modalLeadsBtnLocator = this.page.getByRole('button', { name: /Aperte o play/});
  }

  openLeadModal = async() => {
    await this.modalLeadsBtnLocator.click()
    this.modalLeads = new ModalLeadsComponent(this.page);
    await this.modalLeads.toHaveHeading('Fila de espera');
  }

  isAlertModalOpened = async(title: string, text: RegExp) => {
    this.modal = new ModalComponent(this.page)
    await this.modal.isOpened(title, text);
  }

  goToAdmin = async () => {
    await this.go();
    const link = this.page.getByRole('link', { name: 'Admin'});
    await expect(link).toBeVisible();
    await link.click();
  }

  hasFeatured = async (count: number) => {
    const featuredContainer = this.page.getByRole('heading', { name:'Destaques', exact: true}).locator(".."); 
    await featuredContainer.scrollIntoViewIfNeeded();
    await expect((await featuredContainer.getByRole('img').all()).length).toBe(count);
  }


}