import { Locator, Page, expect } from "@playwright/test";

export class HeaderComponent {
  private readonly page: Page;
  private readonly navLocator: Locator;
  private readonly loggedUserLocator: Locator;
  private readonly moviesLinkLocator: Locator;
  private readonly tvShowsLinkLocator: Locator;
  private readonly leadsLinkLocator: Locator;
  private readonly exitLinkLocator: Locator;

  constructor(page: Page){
    this.page = page;
    this.navLocator = this.page.locator('nav');
    this.loggedUserLocator = this.navLocator.locator('.logged-user');
    this.moviesLinkLocator = this.navLocator.getByRole('link', {name: 'Filmes'});
    this.tvShowsLinkLocator = this.navLocator.getByRole('link', {name: 'Séries de TV'});
    this.leadsLinkLocator = this.navLocator.getByRole('link', {name: 'Leads'});
    this.exitLinkLocator = this.navLocator.getByRole('link', {name: 'Sair'});
  }

  isCorrectUserLogged = async (user:string) => {
    await expect(this.loggedUserLocator).toHaveText(`Olá, ${user}`);
  }

  goToMovies = async () => {
    await this.moviesLinkLocator.click();
    await this.page.waitForLoadState('networkidle');
  }

  goToTvShows = async () => {
    await this.tvShowsLinkLocator.click();
    await this.page.waitForLoadState('networkidle');
  }

  goToLeads = async () => {
    await this.leadsLinkLocator.click();
    await this.page.waitForLoadState('networkidle');
  }

  loggoff = async () => {
    await this.exitLinkLocator.click();
    await this.page.waitForLoadState('networkidle');
  }
}