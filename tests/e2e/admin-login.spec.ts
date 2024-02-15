import {test} from "@playwright/test"
import { HomePage } from "../pages/HomePage"
import { AdminLoginPage } from "../pages/AdminLoginPage"
import * as data from '../../fixtures/data/login.json';
import { MoviesPage } from "../pages/MoviesPage";

let adminPage: AdminLoginPage;
let homePage: HomePage;

test.describe('Admin login test suit', () => {
  
  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goToAdmin();
  
    adminPage = new AdminLoginPage(page);
    await adminPage.init();
  })
  test('Should sign in @smoke', async () => {
    await adminPage.submit(data.success);
    const moviesPage = new MoviesPage(adminPage.page);
    await moviesPage.isLoggedIn(data.success.name);
  })

  test('should not sign in with wrong credentials @smoke', async () => {
    await adminPage.submit(data.fail.credential);
    await adminPage.isAlertModalOpened('Oops!', /Ocorreu um erro ao tentar efetuar o login. Por favor, verifique suas credenciais e tente novamente./);
  })

  test('Should not sign in when password is not provided', async ({page})=>{
    await adminPage.submit(data.fail.empty_pwd);
    await adminPage.toHaveAlert('Campo obrigatório');
  })
  
  test('Should not sign in when email is not provided', async ({page})=>{
    await adminPage.go();
    await adminPage.submit(data.fail.empty_email);
    await adminPage.toHaveAlert('Campo obrigatório');
  })
  
  test('Should not sign in when form is not filled', async ({page})=>{
    await adminPage.go();
    await adminPage.submit(data.fail.empty_form);
    await adminPage.toHaveAlert(['Campo obrigatório', 'Campo obrigatório']);
  })
  test('Should not sign with invalid e-mail', async ({page})=>{
    await adminPage.go();
    await adminPage.submit(data.fail.invalid);
    await adminPage.toHaveAlert('Email incorreto');
  })
})