import { promises } from 'fs';
import { csvtojson, getJSON } from './data-procesing.js';

async function getData(fileName, fallBackURL, sourceType) {
  let retData;
  let fileHandle = null;
  try {
    fileHandle = await promises.open(fileName, 'w+');
    const fstat = await fileHandle.stat();
    let mtime = new Date(fstat.mtime);
    let timeElapsed = Date.now() - mtime.getTime();
    //24h = 86400000 milliseconds
    if (timeElapsed >= 86400000 || fstat.size === 0) {
      if (sourceType === 'json') {
        retData = await getJSON(fallBackURL);
      } else {
        retData = await csvtojson(fallBackURL);
      }
      await fileHandle.writeFile(retData);
    } else {
      let rawData = await fileHandle.readFile('utf8');
      retData = JSON.parse(rawData);
    }
    await fileHandle.sync();
  } catch (err) {
    console.log('Error in fs-interactions.js', err);
  } finally {
    if (fileHandle) {
      await fileHandle.close();
    }
  }
  return retData;
}

export { getData };
