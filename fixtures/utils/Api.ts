import { APIRequestContext, expect } from "@playwright/test";
import dotenv from 'dotenv';
import { ILead, IMovie, ITvShow } from "./data.model";
import path from "path";
import { UUID } from "crypto";
import { createReadStream } from 'fs';

dotenv.config();

const API_HOST = process.env.API_HOST?? "";
const API_USER = process.env.API_USER?? "";
const API_PWD = process.env.API_PWD?? "";

export class Api{
  
  readonly request: APIRequestContext;
  private token: string;

  constructor(request){
    this.request = request;
  }
  
  setToken = async () => {
    try {
      const response = await this.request.post(`${API_HOST}/sessions`, {
        data: {
          email: API_USER,
          password: API_PWD
        }
      });
      console.log(`setToken ${response.status()}`);
      await expect(response.ok()).toBeTruthy();
      this.token = `Bearer ${JSON.parse(await response.text()).token}`;
    } catch (error) {
      console.error(`API Request Error while authenticating.\n${error}`);
    }
  } 

  createLead = async (lead: ILead) => {
    try {
      const response = await this.request.post(`${API_HOST}/leads`, {
        data: lead
      })
      console.info(`createLead ${response.status()}\n${lead}`);
      await expect(response.ok()).toBeTruthy();
    } catch (error) {
      console.error(`API Request Error while creating lead.\n${error}`);
    }
  }

  getCompanyId = async (name:string) =>  {
    try {
      const response = await this.request.get(`${API_HOST}/companies`, {
        headers: {
          Authorization: this.token,
        },
        params: {
          name: name
        }
      });
      console.info(`getCompanyId ${response.status()}\n${name}`);
      await expect(response.ok()).toBeTruthy();
      return await JSON.parse(await response.text()).data[0].id as UUID
    } catch (error) {
      console.error(`API Request Error while creating movie.\n${error}`);
    }    
  }
  createMovie = async (movie:IMovie) => {

    const {company, cover, ...data} = movie;
    
    const companyId = await this.getCompanyId(company);
    let file:any = undefined;
    if(cover !== undefined){
      file = createReadStream(path.join('fixtures/data',cover));
    }

    try {
      const response = await this.request.post(`${API_HOST}/movies`, {
        headers:{
          Authorization: this.token,
          ContentType: 'multipart/form-data',
          Accept: 'application/jsonl, text/plain, */*'
        },
        multipart: {
          ...data, 
          company_id: companyId!,
          cover: file?? ""
        }
      })
      console.info(`createMovie ${response.status()}\n${movie}`);
      await expect(response.ok()).toBeTruthy();
    } catch (error) {
      console.error(`API Request Error while creating movie.\n${error}`);
    }
  }

  
  createTvShow = async (tvshow:ITvShow) => {

    const {company, cover, ...data} = tvshow;
    
    const companyId = await this.getCompanyId(company);
    let file:any = undefined;
    if(cover !== undefined)
      file = createReadStream(path.join('fixtures/data',cover));

    try {
      const response = await this.request.post(`${API_HOST}/tvshows`, {
        headers:{
          Authorization: this.token,
          ContentType: 'multipart/form-data',
          Accept: 'application/jsonl, text/plain, */*'
        },
        multipart: {
          ...data, 
          company_id: companyId!,
          cover: file?? ""
        }
      })

      console.info(`createTvShow ${response.status()}\n${tvshow}`);
      await expect(response.ok()).toBeTruthy();
    } catch (error) {
      console.error(`API Request Error while creating tvshow.\n${error}`);
    }
  }

}