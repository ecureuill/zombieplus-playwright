import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { SearchBarComponent } from "../components/SearchBarComponent";
import { HeaderComponent } from "../components/HeaderComponent";
import { TableComponent } from "../components/TableComponent";
import { PopupComponent } from "../components/PopupComponent";
import { ModalComponent } from "../components/ModalComponent";

export class MoviesPage extends BasePage {
  
  private searchBarComponent: SearchBarComponent;
  private headerComponent: HeaderComponent;
  private tableComponent: TableComponent;
  private popupComponent: PopupComponent;
  private modalComponent: ModalComponent;
  private readonly addMovieLocator: Locator;

  constructor(page:Page) {
    super(page, '/admin/movies');
    this.addMovieLocator = this.page.locator('a[href$=register]');
  }

  init = async () => {
    this.headerComponent = new HeaderComponent(this.page);
    this.searchBarComponent = new SearchBarComponent(this.page);
    await this.searchBarComponent.init('Busque pelo nome');
    this.tableComponent = new TableComponent(this.page, 'td.title');
    this.popupComponent = new PopupComponent(this.page);
  }

  goToRegisterForm = async () => {
    await this.addMovieLocator.click();
  }

  searchMovie = async (title:string) => {
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
    await this.modalComponent.isOpened('Ótima notícia!', new RegExp(`filme '${title.replace('\\', '\\\\')}' foi adicionado`));
  }

  isDuplicatedRegisterModalOpened = async (title:string) => {
    this.modalComponent = new ModalComponent(this.page);
    await this.modalComponent.isOpened('Atenção!', new RegExp(`título '${title}' já consta em nosso catálogo`));
  }

  closeModal = async () =>{
    await this.modalComponent.close();
  }
  
  deleteMovie = async (title:string) => {
    //click button to delete row
    await this.tableComponent.deleteByColumnClassLocator(title);
    //click popup to confirm deletion
    await this.popupComponent.isPopupOpen('Clique aqui para confirmar a exclusão!');
    await this.popupComponent.doAction();
    //close confirmation modal 
    this.modalComponent = new ModalComponent(this.page);
    await this.modalComponent.isOpened('Tudo Certo!', /Filme removido com sucesso./);
    await this.modalComponent.close();
    //checks movie was really removed
    await this.tableComponent.isRowRemoved(title);
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

  listOfMoviesContains = async (movieTitle: string) => {
      await this.tableComponent.contains(movieTitle)
  };

  listOfMoviesContainsOnly = async (moviesTitle: string[]) => {
    await this.tableComponent.isRowCountEqual(moviesTitle.length);
    
    for await (const movie of moviesTitle){
      await this.listOfMoviesContains(movie);
    }
  };
}