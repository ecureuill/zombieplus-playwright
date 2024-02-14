import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { FormBaseComponent } from "../components/FormBaseComponent";
import { IMovie } from "../../fixtures/utils/data.model";
import path from "path";

export class MoviesRegisterPage extends BasePage {
  private readonly backButton: Locator;
  private readonly registerButton: Locator;
  private readonly titleInput: Locator;
  private readonly overviewInput: Locator;
  private readonly companySelect: Locator;
  private readonly yearSelect: Locator;
  private readonly coverInput: Locator;
  private readonly featuredCheckbox: Locator;

  constructor(page: Page){
    super(page, '/admin/movies/register');

    this.form = new FormBaseComponent(page);
    this.backButton = this.page.getByRole('button', {name: 'voltar'});
    this.registerButton = this.page.getByRole('button', {name: 'cadastrar'});
    this.titleInput = this.form.formLocator.locator('input[name=title]');
    this.overviewInput = this.form.formLocator.locator('textarea[name=overview]');
    this.companySelect = this.form.formLocator.locator('input[name=select_company_id]').locator('..');
    this.yearSelect = this.form.formLocator.locator('input[name=select_year]').locator('..');
    this.coverInput = this.form.formLocator.locator('input[name=cover]');
    this.featuredCheckbox = this.form.formLocator.getByRole('switch').locator('..');
  }
  
  goBack = async () => {
    await this.backButton.click();
  }

  isOpened = async () => {
    await this.page.waitForLoadState('networkidle')
    await expect(this.page.getByRole('heading', { name: 'Cadastrar novo Filme'})).toBeVisible();
  }

  fill = async(movie: IMovie) => {
    await this.titleInput.fill(movie.title);
    await this.overviewInput.fill(movie.overview);
    if(movie.cover !== undefined){
      await this.coverInput.setInputFiles(path.join(process.cwd(), '/fixtures/data/', movie.cover));
    }
    await this.featuredCheckbox.setChecked(movie.featured);
    await this.companySelect.click();
    await this.companySelect.getByText(movie.company).click();
    await this.yearSelect.click();
    await this.yearSelect.getByText(movie.release_year.toString()).click();
  }

  submit = async () => {
    await this.registerButton.click();
  }

  toHaveAlert = async(text: string[] | string) => {
    await this.form.toHaveAlert(text);
  }

}