import got from 'got';
import puppeteer from 'puppeteer'

// // get latest url from https://www.npmjs.com/package/auth0-js
// const auth0js = 'https://cdn.auth0.com/js/auth0/9.18.0/auth0.min.js'
const start_transaction = 'https://plugitcloud.com/api/charge-points/' + process.env.PLUGIT_CHARGE_POINT + '/charge-boxes/' + process.env.PLUGIT_CHARGE_BOX + '/remote-start-transaction';

console.log('Hello, world');

const loginWithPuppeteer = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://plugitcloud.com');
    await page.screenshot({ path: 'step1.png' });
    await page.click('button.loginPage__loginActionButton');

    await page.waitForSelector('input[name="email"]', { visible: true });
    await page.focus('input[name="email"]')
    await page.keyboard.type(process.env.PLUGIT_USERNAME || '')
    await page.focus('input[name="password"]')
    await page.keyboard.type(process.env.PLUGIT_PASSWORD || '')
    await page.screenshot({ path: 'step2.png' });
    await page.click('button[type="submit"][aria-label="Log In"]')
    await page.waitForNavigation({waitUntil: 'networkidle2'})
    const params = await page.evaluate(() => {
        return {
          accessToken: window.localStorage.accessToken,
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
          deviceScaleFactor: window.devicePixelRatio,
        };
      });
    await page.screenshot({ path: 'step3.png' });
    await browser.close();
    return params
};

// const loginBasic = async () => {
//     const browser = await puppeteer.launch({ headless: false, timeout: 90000 });
//     const page = await browser.newPage();
//     await page.goto('https://plugitcloud.com/login')
//     await page.addScriptTag({ url: auth0js });
//     await page.waitForTimeout(2000)
//     // await page.waitForNavigation({waitUntil: 'networkidle2'})
//     await page.screenshot({ path: 'basic-1.png' });
//     const params = await page.evaluate(() => {
//         const auto = new window.auth0.WebAuth({
//             audience: 'https://capi.plugitcloud.com',
//             domain: 'plugitcloud.eu.auth0.com',
//             clientID: '7QgIcJZwbxHRLfY0wQk188mWAPWbzwEp',
//             redirectUri: 'http://localhost/callback',
//             responseType: 'token id_token',
//             scope: 'openid',
//           });
//           auto.login({username: process.env.PLUGIT_USERNAME || '', password: process.env.PLUGIT_PASSWORD || ''}, console.log);
//           return {
//             loc: window.document.location,
//             authzero: auto,
//             window: window,
//           }
//     })
//     await page.waitForTimeout(120000)
//     await browser.close()
//     return params
// }

const startCharging = async (params: any) => {
    const startResult = await got.post(start_transaction, {
        headers: {
            'authorization': 'Bearer ' + params.accessToken,
            'accept': 'application/json, text/plain, */*',
        }
    })
    return {statusCode: startResult.statusCode, body: startResult.body }
}

const main = async () => {
    const params = await loginWithPuppeteer()
    // const params = await loginBasic()
    console.log(params)
    const chargingResult = await startCharging(params)
    console.log(chargingResult)
}
main()

export {}