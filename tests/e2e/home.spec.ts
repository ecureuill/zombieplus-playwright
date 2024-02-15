import { expect, test } from '@playwright/test';
import { Mutex } from 'async-mutex';
import * as leadsData from '../../fixtures/data/leads.json';
import * as moviesData from '../../fixtures/data/movies.json';
import * as tvshowsData from '../../fixtures/data/tvshows.json';
import { Api } from '../../fixtures/utils/Api';
import { executeSQL } from '../../fixtures/utils/db';
import { HomePage } from '../pages/HomePage';

const mutex = new Mutex();
let homePage: HomePage;

test.describe('Home page suit tests', () => {
  
  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page)
    await homePage.go();
  })
  
  test.describe('Lead registration feature', () => {
  
    test.beforeEach(async () => {
      const release = await mutex.acquire();
      try {
        await executeSQL('DELETE FROM leads');
      }
      finally{
        release();
      }
      await homePage.openLeadModal()
    })
    
    test('should register a lead in wait list @smoke', async ()=>{
      await homePage.modalLeads.do(leadsData.create_feature.success); 
      await homePage.isAlertModalOpened('Fila de espera', /Agradecemos por compartilhar/);
    })

    test('should not register a lead already registered', async ({request})=>{
      
      const api = new Api(request);
      await api.createLead(leadsData.create_feature.fail.duplicated);

      await homePage.modalLeads.do(leadsData.create_feature.fail.duplicated); 
      await homePage.isAlertModalOpened('Atenção', /e-mail fornecido já consta em nossa lista de espera/);
    })

    test('should not register a lead with invalid email', async ()=>{
      await homePage.modalLeads.do(leadsData.create_feature.fail.invalid,); 
      await homePage.modalLeads.toHaveAlert('Email incorreto');
    })

    test('should not register a lead with blank name', async ()=>{
      await homePage.modalLeads.do(leadsData.create_feature.fail.empty_name); 
      await homePage.modalLeads.toHaveAlert('Campo obrigatório');
    })
    
    test('should not register a lead with blank email', async ()=>{
      await homePage.modalLeads.do(leadsData.create_feature.fail.empty_email); 
      await homePage.modalLeads.toHaveAlert('Campo obrigatório');
    })
    
    test('should not register a lead with empty form ', async ()=>{
      await homePage.modalLeads.do(leadsData.create_feature.fail.empty_form); 
      await homePage.modalLeads.toHaveAlert(['Campo obrigatório', 'Campo obrigatório']);
    })
  })

  test.describe('Featured movies and series feature', () => {
    test('Should feature featured movies and tvshows', async ({request}) => {
      const release = await mutex.acquire();
      try {
        await executeSQL('DELETE FROM movies');
        await executeSQL('DELETE FROM tvshows');

        const api = new Api(request);
        await api.setToken();
        for await (const movies of moviesData.featured_feature){
          await api.createMovie(movies);
        }
        for await (const tvshows of tvshowsData.featured_feature){
          await api.createTvShow(tvshows);
        }
      } finally {
        release();
      }
      
      await homePage.page.reload();
      await homePage.page.waitForLoadState('networkidle');
      await homePage.hasFeatured(moviesData.featured_feature.length + tvshowsData.featured_feature.length);
    })
  });
})