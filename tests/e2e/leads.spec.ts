import { test } from '@playwright/test';
import { Mutex } from 'async-mutex';
import * as leads from '../../fixtures/data/leads.json';
import * as data from '../../fixtures/data/login.json';
import { Api } from '../../fixtures/utils/Api';
import { executeSQL } from '../../fixtures/utils/db';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { LeadsPage } from '../pages/LeadsPage';

let leadsPage: LeadsPage;
const mutex = new Mutex();

test.describe('Leads tests suit', () => {

  test.beforeEach(async ({page}) => {
    const adminPage = new AdminLoginPage(page);
    await adminPage.do(data.success);
    
    leadsPage = new LeadsPage(page);
    await leadsPage.init();
  })

  test.describe('Search feature', () => {
    
    test.beforeAll(async ({request}) => {
      const release = await mutex.acquire();
      try {
        await executeSQL('DELETE FROM leads');

        const api = new Api(request);
        await api.setToken();
        for await (const lead of leads.search_feature.data){
          await api.createLead(lead);
        }
      } finally {
        release();
      }
    })

    test.beforeEach(async ({request}) => {
      await leadsPage.page.reload();
      await leadsPage.page.waitForLoadState('networkidle');
    })

    test('Should enable clear button', async () => {
      await leadsPage.searchLead(leads.search_feature.filter.input);
      await leadsPage.isClearButtonVisible();
    });
    
    test('Should filter leads @smoke', async () => {
      await leadsPage.searchLead(leads.search_feature.filter.input);
      await leadsPage.listOfLeadsContainsOnly(leads.search_feature.filter.outputs);
    });

    test('Should not retrieve leads', async () => {
      await leadsPage.searchLead(leads.search_feature.no_records.input);
      await leadsPage.listOfLeadsContainsOnly(leads.search_feature.no_records.outputs)
    });


    test('Should clear search bar and show complete list', async () => {
      await leadsPage.searchLead(leads.search_feature.clear_filter.input);
      await leadsPage.clearSearch();
      await leadsPage.isSearchBarInputEmpty();
      await leadsPage.listOfLeadsContainsOnly(leads.search_feature.clear_filter.outputs)
    });
  });

  test.describe('Delete lead feature @smoke', () => {
    test('Should remove a lead', async ({page, request}) => {
      const release = await mutex.acquire();
      try {
        await executeSQL('DELETE FROM leads');
        const api = new Api(request);
        await api.setToken();
        for await (const lead of leads.delete_feature.data){
          await api.createLead(lead);
        }
      } finally {
        release();
      }
      await leadsPage.page.reload();
      await leadsPage.page.waitForLoadState('networkidle')
      await leadsPage.deleteLead(leads.delete_feature.remove);
    });
  });
});