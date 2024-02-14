import { test } from '@playwright/test';
import { Mutex } from 'async-mutex';
import * as loginData from '../../fixtures/data/login.json';
import * as movies from '../../fixtures/data/movies.json';
import { Api } from '../../fixtures/utils/Api';
import { executeSQL } from '../../fixtures/utils/db';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { MoviesPage } from '../pages/MoviesPage';
import { MoviesRegisterPage } from '../pages/MoviesRegisterPage';

const mutex = new Mutex();
let moviesPage: MoviesPage;
let moviesRegisterPage: MoviesRegisterPage;

test.describe.serial('Movies tests suit', () => {

  test.beforeEach(async ({page}) => {  
    const adminPage = new AdminLoginPage(page);
    await adminPage.do(loginData.success);
    moviesPage = new MoviesPage(page);
    await moviesPage.init();
  })
  
  test.describe.serial('Search feature', () => {
    test.beforeEach (async ({page, request}) => {
      const release = await mutex.acquire();
      try {
          await executeSQL('DELETE FROM movies');
          const api = new Api(request);
          await api.setToken();
        for await (const movie of movies.search_feature.data){
          await api.createMovie(movie);
        }
      } finally {
        release();
      }
      await page.reload();
    })

    test('Should enable clear button', async () => {
      await moviesPage.searchMovie(movies.search_feature.filter.input);
      await moviesPage.isClearButtonVisible();
    });
    
    test('Should filter movies @smoke', async () => {
      await moviesPage.searchMovie(movies.search_feature.filter.input);
      await moviesPage.listOfMoviesContainsOnly(movies.search_feature.filter.outputs);
    });

    test('Should not retrieve movies', async () => {
      await moviesPage.searchMovie(movies.search_feature.no_records.input);
      await moviesPage.listOfMoviesContainsOnly(movies.search_feature.no_records.outputs)
    });

    test('Should clear search bar and show complete list', async () => {
      await moviesPage.searchMovie(movies.search_feature.clear_filter.input);
      await moviesPage.clearSearch();
      await moviesPage.isSearchBarInputEmpty();
      await moviesPage.listOfMoviesContainsOnly(movies.search_feature.clear_filter.outputs)
    });
  });

  test('Open registration form', async ({page}) => {
    await moviesPage.goToRegisterForm();
    moviesRegisterPage = new MoviesRegisterPage(page);
    await moviesRegisterPage.isOpened();
  });
  
  test.describe('Create movie feature', () =>{
    
    test.beforeEach(async ({page}) => { 
      const release = await mutex.acquire();
      try {
        await executeSQL('DELETE FROM movies');
      } finally {
        release();
      }   
      moviesRegisterPage = new MoviesRegisterPage(page);
      await moviesRegisterPage.go();
    })

    test('Should add movie @smoke', async ({page}) => {
      const movie = movies.create_feature.success.not_featured;
      await moviesRegisterPage.fill(movie);
      await moviesRegisterPage.submit();

      moviesPage.init();
      await moviesPage.isRegisterConfirmationModalOpened(movie.title);
      await moviesPage.closeModal();
      await moviesPage.listOfMoviesContains(movie.title);
    });

    test('Should add movie as featured', async ({page}) => {
      const title = movies.create_feature.success.not_featured.title;
      
      await moviesRegisterPage.fill(movies.create_feature.success.not_featured);
      await moviesRegisterPage.submit();

      await moviesPage.isRegisterConfirmationModalOpened(title);
    });

    test('Should not add movie with duplicated title', async ({page, request}) => {
      const movie = movies.create_feature.failure.duplicate;

      const api = new Api(request);
      await api.setToken();
      await api.createMovie(movie);
      
      await moviesRegisterPage.fill(movie);
      await moviesRegisterPage.submit();

      await moviesPage.isDuplicatedRegisterModalOpened(movie.title);
    });

    test('Should not add movie without required fields', async () => {
      await moviesRegisterPage.submit();    
      await moviesRegisterPage.toHaveAlert([
      'Campo obrigatório', 
      'Campo obrigatório',
      'Campo obrigatório',
      'Campo obrigatório'
    ])
    });
  });

  test.describe('Delete movie feature @smoke', () => {
    test('Should remove a movie', async ({page, request}) => {
      const release = await mutex.acquire();
      try {
        await executeSQL('DELETE FROM movies');

        const api = new Api(request);
        await api.setToken();
        for await (const movie of movies.delete_feature.data){
          await api.createMovie(movie);
        }
      } finally {
        release();
      }

      await page.reload();
      await moviesPage.deleteMovie(movies.delete_feature.remove);
    });
  });
});