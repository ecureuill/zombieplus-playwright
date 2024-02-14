import { Locator, Page, expect } from "@playwright/test";
import { HeaderComponent } from "../components/HeaderComponent";
import { ModalComponent } from "../components/ModalComponent";
import { PopupComponent } from "../components/PopupComponent";
import { SearchBarComponent } from "../components/SearchBarComponent";
import { TableComponent } from "../components/TableComponent";
import { BasePage } from "./BasePage";

export class TvShowsPage extends BasePage {
  
  private searchBarComponent: SearchBarComponent;
  private headerComponent: HeaderComponent;
  private tableComponent: TableComponent;
  private popupComponent: PopupComponent;
  private modalComponent: ModalComponent;
  private readonly addTvShowLocator: Locator;

  constructor(page:Page) {
    super(page, '/admin/tvshows');
    this.addTvShowLocator = this.page.locator('a[href$=register]');
  }

  init = async () => {
    this.headerComponent = new HeaderComponent(this.page);
    this.searchBarComponent = new SearchBarComponent(this.page);
    await this.searchBarComponent.init('Busque pelo nome');
    this.tableComponent = new TableComponent(this.page, 'td.title');
    this.popupComponent = new PopupComponent(this.page);
  }

  goToRegisterForm = async () => {
    await this.addTvShowLocator.click();
  }

  searchTvShow = async (title:string) => {
    await this.searchBarComponent.search(title);  
    await this.searchBarComponent.initClearButton();
  }
  
  isClearButtonVisible = async () => {
    await this.searchBarComponent.isClearButtonVisible();
  }

  clearSearch = async () => {
    await this.searchBarComponent.clear();  
  }

  isRegisterConfirmationModalOpened = async (title:string) => {
    this.modalComponent = new ModalComponent(this.page);
    await this.modalComponent.isOpened('Ótima notícia!', new RegExp(`série '${title}' foi adicionada`));
  }

  isDuplicatedRegisterModalOpened = async (title:string) => {
    this.modalComponent = new ModalComponent(this.page);
    await this.modalComponent.isOpened('Atenção!', new RegExp(`título '${title}' já consta em nosso catálogo`));
  }
  closeModal = async () =>{
    await this.modalComponent.close();
  }
  
  deleteTvShow = async (title:string) => {
    //click button to delete row
    await this.tableComponent.deleteByTextLocator(title);
    //click popup to confirm deletion
    await this.popupComponent.isPopupOpen('Clique aqui para confirmar a exclusão!');
    await this.popupComponent.doAction();
    //close confirmation modal 
    this.modalComponent = new ModalComponent(this.page);
    await this.modalComponent.isOpened('Tudo Certo!', /Série removida com sucesso./);
    await this.modalComponent.close();
    //checks tvshow was really removed
    await this.tableComponent.isRowRemoved(title);
  }

  isSearchBarInputEmpty = async () => {
    await this.searchBarComponent.isEmpty();
  }

  isLoggedIn = async (user: string) => {
    await this.page.waitForLoadState('networkidle')
    await expect(this.page).toHaveURL('/admin/tvshows')

    this.headerComponent = new HeaderComponent(this.page);
    await this.headerComponent.isCorrectUserLogged(user);
  }

  listOfTvShowsContains = async (tvshowTitle: string) => {
      await this.tableComponent.contains(tvshowTitle)
  };

  listOfTvShowsContainsOnly = async (tvshowsTitle: string[]) => {
    await this.tableComponent.isRowCountEqual(tvshowsTitle.length);
    
    for await (const tvshow of tvshowsTitle){
      await this.listOfTvShowsContains(tvshow);
    }
  };
}