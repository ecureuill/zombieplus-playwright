import { test } from '@playwright/test';
import { Mutex } from 'async-mutex';
import * as loginData from '../../fixtures/data/login.json';
import * as moviesData from '../../fixtures/data/movies.json';
import { Api } from '../../fixtures/utils/Api';
import { executeSQL } from '../../fixtures/utils/db';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { MoviesPage } from '../pages/MoviesPage';
import { MoviesRegisterPage } from '../pages/MoviesRegisterPage';

const mutex = new Mutex();
let moviesPage: MoviesPage;
let moviesRegisterPage: MoviesRegisterPage;

test.describe('Movies tests suit', () => {
  
  test.beforeEach(async ({page}) => {  
    const adminPage = new AdminLoginPage(page);
    await adminPage.do(loginData.success);
    moviesPage = new MoviesPage(page);
    await moviesPage.init();
  })
  
  test.describe('Search feature', () => {
    
    test.beforeAll (async ({request}) => {
      const release = await mutex.acquire();
      try {
        await executeSQL(`DELETE FROM movies`);
        
        const api = new Api(request);
        await api.setToken();
        for await (const movie of moviesData.search_feature.data){
          await api.createMovie(movie);
        }
      } finally {
        release();
      }
    })

    test.beforeEach(async () => {
      await moviesPage.page.reload();
      await moviesPage.page.waitForLoadState('networkidle');
    })


    test('Should enable clear button', async () => {
      await moviesPage.searchMovie(moviesData.search_feature.filter.input);
      await moviesPage.isClearButtonVisible();
    });
    
    test('Should filter movies @smoke', async () => {
      await moviesPage.searchMovie(moviesData.search_feature.filter.input);
      await moviesPage.listOfMoviesContainsOnly(moviesData.search_feature.filter.outputs);
    });

    test('Should not retrieve movies', async () => {
      await moviesPage.searchMovie(moviesData.search_feature.no_records.input);
      await moviesPage.listOfMoviesContainsOnly(moviesData.search_feature.no_records.outputs)
    });

    test('Should clear search bar and show complete list', async () => {
      await moviesPage.searchMovie(moviesData.search_feature.clear_filter.input);
      await moviesPage.clearSearch();
      await moviesPage.isSearchBarInputEmpty();
      await moviesPage.listOfMoviesContainsOnly(moviesData.search_feature.clear_filter.outputs)
    });
  });

  test('Open registration form', async ({request}) => {
    const release = await mutex.acquire();
    try {
      const api = new Api(request);
      await api.setToken();
      for await (const movie of moviesData.search_feature.data){
        await executeSQL(`DELETE FROM movies WHERE title='${movie.title}'`);
        await api.createMovie(movie);
      }
    } finally {
      release();
    }
    
    await moviesPage.goToRegisterForm();
    moviesRegisterPage = new MoviesRegisterPage(moviesPage.page);
    await moviesRegisterPage.isOpened();
  });
  
  test.describe('Create movie feature', () =>{
    
    test.beforeEach(async ({page}) => { 
      moviesRegisterPage = new MoviesRegisterPage(page);
      await moviesRegisterPage.go();
    })

    test.afterAll(async ({request}) => {
      await executeSQL(`DELETE FROM movies`);
    })

    test('Should add movie @smoke', async ({page}) => {
      const movie = moviesData.create_feature.success.not_featured;
      
      const release = await mutex.acquire();
      try {
        await executeSQL(`DELETE FROM movies WHERE title='${movie.title}'`);
      } finally {
        release();
      }   
      await moviesRegisterPage.fill(movie);
      await moviesRegisterPage.submit();

      moviesPage.init();
      await moviesPage.isRegisterConfirmationModalOpened(movie.title);
      await moviesPage.closeModal();
      await moviesPage.listOfMoviesContains(movie.title);
    });

    test('Should add movie as featured', async ({page}) => {
      const movie = moviesData.create_feature.success.featured;
      
      const release = await mutex.acquire();
      try {
        await executeSQL(`DELETE FROM movies WHERE title='${movie.title}'`);
      } finally {
        release();
      }  

      await moviesRegisterPage.fill(movie);
      await moviesRegisterPage.submit();

      await moviesPage.isRegisterConfirmationModalOpened(movie.title);
    });

    test('Should not add movie with duplicated title', async ({request}) => {
      const movie = moviesData.create_feature.failure.duplicate;

      const release = await mutex.acquire();
      try {
        await executeSQL(`DELETE FROM movies WHERE title='${movie.title}'`);
        const api = new Api(request);
        await api.setToken();
        await api.createMovie(movie);  
      } finally {
        release();
      }  
      
      await moviesRegisterPage.fill(movie);
      await moviesRegisterPage.submit();

      await moviesPage.isDuplicatedRegisterModalOpened(movie.title);
    });

    test('Should not add movie with long title', async () => {
      const movie = moviesData.create_feature.failure.long_title;

      const release = await mutex.acquire();
      try {
        await executeSQL(`DELETE FROM movies WHERE title='${movie.title}'`);
      } finally {
        release();
      }  
      
      await moviesRegisterPage.fill(movie);
      await moviesRegisterPage.submit();

      await moviesRegisterPage.toHaveAlert('Tamanho máximo permitidotamanho do texto inserido excede o limite permitido');
    });

    test('Should not add movie with long overview', async () => {
      const movie = moviesData.create_feature.failure.long_overview;

      const release = await mutex.acquire();
      try {
        await executeSQL(`DELETE FROM movies WHERE title='${movie.title}'`);
      } finally {
        release();
      }  
      
      await moviesRegisterPage.fill(movie);
      await moviesRegisterPage.submit();

      await moviesRegisterPage.toHaveAlert('Tamanho máximo permitidotamanho do texto inserido excede o limite permitido');
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
        await executeSQL(`DELETE FROM movies`);
        
        const api = new Api(request);
        await api.setToken();
        for await (const movie of moviesData.delete_feature.data){
          // await executeSQL(`DELETE FROM movies WHERE title='movie'`);
          await api.createMovie(movie);
        }
      } finally {
        release();
      }

      await page.reload();
      await moviesPage.deleteMovie(moviesData.delete_feature.remove);
    });
  });
  
  test.describe('Special characters validations', () => {

    test.beforeEach(async () => {
        const release = await mutex.acquire();
        try {
          await executeSQL(`DELETE FROM movies`);
        } finally {
          release();
        }    
    });
    
    moviesData.create_feature.success.special_character.forEach(movie => {
      test(`Should add movie with title ${movie.title}`, async ({page}) => {
        const moviesRegisterPage = new MoviesRegisterPage(page);
        await moviesRegisterPage.go();
        
        await moviesRegisterPage.fill(movie);
        await moviesRegisterPage.submit();

        await moviesPage.init();
        await moviesPage.isRegisterConfirmationModalOpened(movie.title);
        await moviesPage.closeModal();
        await moviesPage.listOfMoviesContains(movie.title);
      })
    });
      
    moviesData.create_feature.success.special_character.forEach(movie => {
      test(`Should filter movie with special character title ${movie.title}`, async ({request}) => {
        const release = await mutex.acquire();
        try {
          const api = new Api(request);
          await api.setToken();
          await api.createMovie(movie);
        } finally {
          release();
        }  
          
        await moviesPage.searchMovie(movie.title);
        await moviesPage.listOfMoviesContainsOnly([movie.title]);
      })
    });

    moviesData.delete_feature.special_character.forEach(movie => {
      test(`Should remove movie with special character in title ${movie.title}`, async ({request}) => {
        const release = await mutex.acquire();
        try {
          const api = new Api(request);
          await api.setToken();
          await api.createMovie(movie);
        } finally {
          release();
        }
        await moviesPage.page.reload();
        await moviesPage.deleteMovie(movie.title);
      })
    });
  })
});