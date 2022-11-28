import fetch from 'cross-fetch'
import taxRates from './data/taxRate.json'
import importedItems from './data/importedItems.json'

/**
 * Get site titles of cool websites.
 *
 * Task: Can we change this to make the requests async so they are all fetched at once then when they are done, return all
 * the titles and make this function faster?
 *
 * @returns array of strings
 */
export async function returnSiteTitles() {
  const urls = [
    'https://patientstudio.com/',
    'https://www.startrek.com/',
    'https://www.starwars.com/',
    'https://www.neowin.net/'
  ]  /*----------Import Notes Regarding This Funcation-----------*/
  // 'https://www.neowin.net/' Title is "Tech News, Reviews & Betas | Neowin but "
  // But in the Test Case It is Written "Neowin - Where unprofessional journalism looks better"
  // If you change the test case to "Tech News, Reviews & Betas | Neowin" then it will pass
  // SomeTime URL Ping take moretime due to low internet speed or low bandwidth to get the response
 /*-------------------------------------------------------- */
  const reqs = [];
  const tempData = [];
  const titles = [];
  let match
  //I used for loop to make it faster
  for (const url of urls) {
    reqs.push(fetch(url, { method: 'GET' }));
  }
  //I used Promise.all() to make all the requests at once
  const data = await Promise.all(reqs)
  for (let i = 0; i < data.length; i++) {
    tempData.push(data[i].text())
  }
  const textData = await Promise.all(tempData);
  //I used for loop to make it faster and use match to get the title of the website
  for (let i = 0; i < textData.length; i++) {
    match = textData[i].match(/<title>(.*?)<\/title>/);
    if (match?.length) {
      titles.push(match[1]);
    }
  }
  return titles
}
/**
 * Count the tags and organize them into an array of objects.
 *
 * Task: That's a lot of loops; can you refactor this to have the least amount of loops possible.
 * The test is also failing for some reason.
 *
 * @param localData array of objects
 * @returns array of objects
 */
export function findTagCounts(localData: Array<SampleDateRecord>): Array<TagCounts> {
  const tagCounts: Array<TagCounts> = []
  let tagIndex = -1;
  for (let i = 0; i < localData.length; i++) {
    for (let j = 0; j < localData[i].tags.length; j++) {
      //I used findIndex() to find the index of the tag in the tagCounts array
      tagIndex = tagCounts.findIndex(tag => tag.tag == localData[i].tags[j]);
      if (tagIndex >= 0) {
        tagCounts[tagIndex].count++;
      } else {
        tagCounts.push({ tag: localData[i].tags[j], count: 1 });
      }
    }
  }
  return tagCounts
}

/**
 * Calcualte total price
 *
 * Task: Write a function that reads in data from `importedItems` array (which is imported above) and calculates the total price, including taxes based on each
 * countries tax rate.
 *
 * Here are some useful formulas and infomration:
 *  - import cost = unit price * quantity * importTaxRate
 *  - total cost = import cost + (unit price * quantity)
 *  - the "importTaxRate" is based on they destiantion country
 *  - if the imported item is on the "category exceptions" list, then no tax rate applies
 */
export function calcualteImportCost(importedItems: Array<ImportedItem>): Array<ImportCostOutput> {
  // please write your code in here.
  // note that `taxRate` has already been imported for you
  const output: Array<ImportCostOutput> = [];
  const taxRate = taxRates as Array<ImportTaxRate>;
  //Accorging to the test case I used the for loop to get the value of the taxRate and importedItems 
  for (let i = 0; i < importedItems.length; i++) {
    const item = importedItems[i];
    const taxRateIndex = taxRate.findIndex(rate => rate.country === item.countryDestination);
    let importTaxRate = 0;
    //I used if condition to check the taxRateIndex is greater than or equal to 0 or not
    //If it is greater than or equal to 0 then it will get the value of the taxRate
    //If it is not greater than or equal to 0 then it will get the value of the importTaxRate as 0
    if (taxRateIndex >= 0) {
      importTaxRate = taxRate[taxRateIndex].importTaxRate;
      if (taxRate[taxRateIndex].categoryExceptions.includes(item.category)) {
        importTaxRate = 0;
      }
    }
    //I used the formula to get the value of the importCost and totalCost
    const importCost = item.unitPrice * item.quantity * importTaxRate;
    const totalCost = importCost + (item.unitPrice * item.quantity);
    //I used the push() method to push the value of the importCost and totalCost in the output array
    output.push({
      name: item.name,
      subtotal: item.unitPrice * item.quantity,
      importCost,
      totalCost
    });
  }
  return output;
}
