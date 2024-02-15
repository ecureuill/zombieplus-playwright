import { test } from '@playwright/test';
import * as loginData from '../../fixtures/data/login.json';
import * as tvshowsData from '../../fixtures/data/tvshows.json';
import { Api } from '../../fixtures/utils/Api';
import { executeSQL } from '../../fixtures/utils/db';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { TvShowsPage } from '../pages/TvShowsPage';
import { TvShowsRegisterPage } from '../pages/TvShowsRegisterPage';

let tvshowsPage: TvShowsPage;
let tvshowsRegisterPage: TvShowsRegisterPage;

test.describe('TvShows tests suit', () => {
  test.beforeEach(async ({page}) => {  
    const adminPage = new AdminLoginPage(page);
    await adminPage.do(loginData.success);
    tvshowsPage = new TvShowsPage(page);
    await tvshowsPage.init();
    await tvshowsPage.go();
  })

  test.describe('Search feature', () => {

    test.beforeAll(async ({ request}) => {
      await executeSQL('DELETE FROM tvshows');
      const api = new Api(request);
      await api.setToken();
      for await (const tvshow of tvshowsData.search_feature.data){
        await api.createTvShow(tvshow);
      }
    })

    test.beforeEach(async () => {
      await tvshowsPage.page.reload();
      await tvshowsPage.page.waitForLoadState('networkidle');
    })

    test('Should enable clear button', async () => {
      await tvshowsPage.searchTvShow(tvshowsData.search_feature.filter.input);
      await tvshowsPage.isClearButtonVisible();
    });
    
    test('Should filter tvshows @smoke', async () => {
      await tvshowsPage.searchTvShow(tvshowsData.search_feature.filter.input);

      await tvshowsPage.listOfTvShowsContainsOnly(tvshowsData.search_feature.filter.outputs);
    });

    test('Should not retrieve tvshows', async () => {
      await tvshowsPage.searchTvShow(tvshowsData.search_feature.no_records.input);

      await tvshowsPage.listOfTvShowsContainsOnly(tvshowsData.search_feature.no_records.outputs)
    });

    test('Should clear search bar and show complete list', async ({page, request}) => {
      await tvshowsPage.searchTvShow(tvshowsData.search_feature.clear_filter.input);
      await tvshowsPage.clearSearch();
      await tvshowsPage.isSearchBarInputEmpty();
      await tvshowsPage.listOfTvShowsContainsOnly(tvshowsData.search_feature.clear_filter.outputs)
    });
  });

  test('Open registration form', async ({page}) => {
    await tvshowsPage.goToRegisterForm();
    const tvshowsRegisterPage = new TvShowsRegisterPage(page);
    await tvshowsRegisterPage.isOpened();
  });

  test.describe('Create tvshows feature', () =>{
    
    test.beforeEach(async ({page}) => { 
      tvshowsRegisterPage = new TvShowsRegisterPage(page);
      await tvshowsRegisterPage.go();
    })
    
    test('Should add tvshows @smoke', async ({page}) => {
      const tvshows = tvshowsData.create_feature.success.not_featured;
      
      await executeSQL(`DELETE FROM tvshows WHERE title='${tvshows.data.title}'`);
      await tvshowsRegisterPage.fill(tvshows.data);
      await tvshowsRegisterPage.submit();

      const tvshowsPage = new TvShowsPage(page);
      tvshowsPage.init();
      await tvshowsPage.isRegisterConfirmationModalOpened(tvshows.data.title);
      await tvshowsPage.closeModal();
      await tvshowsPage.listOfTvShowsContains(tvshows.outputs);
    });

    test('Should add tvshows as featured', async ({page}) => {
      const tvshows = tvshowsData.create_feature.success.featured;
      
      await executeSQL(`DELETE FROM tvshows WHERE title='${tvshows.data.title}'`);
      
      await tvshowsRegisterPage.fill(tvshows.data);
      await tvshowsRegisterPage.submit();

      const tvshowsPage = new TvShowsPage(page);
      tvshowsPage.init();
      await tvshowsPage.isRegisterConfirmationModalOpened(tvshows.data.title);
      await tvshowsPage.closeModal();
      await tvshowsPage.listOfTvShowsContains(tvshows.outputs);
    });

    test('Should not add tvshows with duplicated title', async ({page, request}) => {
      const tvshows = tvshowsData.create_feature.failure.duplicate;
      
      const api = new Api(request);
      await api.setToken();
      await api.createTvShow(tvshows);  
  
      await tvshowsRegisterPage.fill(tvshows);
      await tvshowsRegisterPage.submit();

      const tvshowsPage = new TvShowsPage(page);
      await tvshowsPage.isDuplicatedRegisterModalOpened(tvshows.title);
    });

    test('Should not add tvshows without required fields', async () => {
      await tvshowsRegisterPage.submit();    
      await tvshowsRegisterPage.toHaveAlert([
      'Campo obrigatório', 
      'Campo obrigatório',
      'Campo obrigatório',
      'Campo obrigatório',
      'Campo obrigatório (apenas números)'
    ])
    });
  });

  test.describe('Delete tvshow feature @smoke', () => {
    
    test('Should remove a tvshow', async ({page, request}) => {
      await executeSQL('DELETE FROM tvshows');
      const api = new Api(request);
      await api.setToken();
      for await (const tvshow of tvshowsData.delete_feature.data){
        await api.createTvShow(tvshow);
      }

      await page.reload();
      await tvshowsPage.deleteTvShow(tvshowsData.delete_feature.remove);
    });
  });
});