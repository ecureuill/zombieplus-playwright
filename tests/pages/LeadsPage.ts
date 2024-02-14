import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { SearchBarComponent } from "../components/SearchBarComponent";
import { HeaderComponent } from "../components/HeaderComponent";
import { TableComponent } from "../components/TableComponent";
import { PopupComponent } from "../components/PopupComponent";
import { ModalComponent } from "../components/ModalComponent";

export class LeadsPage extends BasePage {
  
  private searchBarComponent: SearchBarComponent;
  private headerComponent: HeaderComponent;
  private tableComponent: TableComponent;
  private popupComponent: PopupComponent;

  constructor(page:Page) {
    super(page, '/admin/leads');
  }

  init = async () => {
    await this.go();
    this.headerComponent = new HeaderComponent(this.page);
    this.searchBarComponent = new SearchBarComponent(this.page);
    await this.searchBarComponent.init('Busque pelo email');
    this.tableComponent = new TableComponent(this.page, 'td.name');
    this.popupComponent = new PopupComponent(this.page);
  }

  searchLead = async (title:string) => {
    await this.searchBarComponent.search(title);  
    await this.searchBarComponent.initClearButton();
  }
  
  isClearButtonVisible = async () => {
    await this.searchBarComponent.isClearButtonVisible();
  }

  clearSearch = async () => {
    await this.searchBarComponent.clear();  
  }
  
  deleteLead = async (email:string) => {
    await this.tableComponent.deleteByTextLocator(email);
    await this.popupComponent.isPopupOpen('Clique aqui para confirmar a exclusão!');
    await this.popupComponent.doAction();
    const modalComponent = new ModalComponent(this.page);
    await modalComponent.isOpened('Tudo Certo!', /Lead removido com sucesso./);
    await modalComponent.close();
    await this.tableComponent.isRowRemoved(email);
  }

  isSearchBarInputEmpty = async () => {
    await this.searchBarComponent.isEmpty();
  }

  isLoggedIn = async (user: string) => {
    await this.page.waitForLoadState('networkidle')
    await expect(this.page).toHaveURL('/admin/movies')

    this.headerComponent = new HeaderComponent(this.page);
    await this.headerComponent.isCorrectUserLogged(user);
  }

  listOfLeadsContains = async (movieTitle: string) => {
      await this.tableComponent.contains(movieTitle)
  };

  listOfLeadsContainsOnly = async (moviesTitle: string[]) => {
    for await (const movie of moviesTitle){
      await this.listOfLeadsContains(movie);
    }
    await this.tableComponent.isRowCountEqual(moviesTitle.length);
  };
}