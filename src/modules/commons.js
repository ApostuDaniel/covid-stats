const dataURLs = {
  overview: 'https://covid.ourworldindata.org/data/owid-covid-data.json',
  testing:
    'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/testing/covid-testing-all-observations.csv',
  confirmed: 'https://covid.ourworldindata.org/data/owid-covid-data.json',
  vaccinations:
    'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json',
  mortality: 'https://covid.ourworldindata.org/data/owid-covid-data.json',
  variants:
    'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/variants/covid-variants.csv',
};

const covidData = {
  general: null,
  testing: null,
  vaccinations: null,
  variants: null,
};

export { dataURLs, covidData };
