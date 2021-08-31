async function getLocation() {
  const unformated = await fetch('https://ipapi.co/json/');
  const formated = await unformated.json();
  return [formated['country_code_iso3'], formated['country_name']];
}

export { getLocation };
