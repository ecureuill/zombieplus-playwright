export interface ILogin {
  email: string,
  pwd: string,
  name: string
}

export interface ILead {
  name: string,
  email: string
}

export interface IMovie {
  title: string,
  overview: string,
  company: string,
  release_year: number,
  featured: boolean,
  cover?: string
}

export interface ITvShow {
  title: string,
  overview: string,
  company: string,
  release_year: number,
  seasons: number,
  featured: boolean,
  cover?: string
}