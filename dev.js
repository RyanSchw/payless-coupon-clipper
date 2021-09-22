const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const username = ''; // can be phone number or email
const password = '';
const headless = false;
const MAX_COUPONS = 150;

let couponsClipped = 0;

const filtersToEnable = ['In Ad', 'Dairy', 'Deli', 'Dry Grocery', 'Fresh Meat', 'Frozen Foods', 'Packaged Meat', 'Snacks & Soft Drinks'];
const ignoreKeywords = ['coffee', 'creamer', 'almond', 'pizza', 'gum', 'pods', 'nut'];

// https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/#async-filter-with-map
const asyncFilter = async (arr, predicate) => {
    const results = await Promise.all(arr.map(predicate));
    return arr.filter((_v, index) => results[index]);
}

(async () => {
    puppeteer.use(StealthPlugin())
    const browser = await puppeteer.launch({ 
        headless,
        slowMo: 400,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()

    const navigationPromise = page.waitForNavigation()

    // may need to set "chooseWayToShop-dismissed=true" in Session Storage
    await page.goto('https://www.pay-less.com/signin?redirectUrl=/cl/coupons/')

    await navigationPromise

    // sign in

    await page.waitForSelector('#SignIn-emailInput')
    await page.type('#SignIn-emailInput', username, {delay: 100})

    await page.waitForSelector('#SignIn-passwordInput')
    await page.type('#SignIn-passwordInput', password, {delay: 100})

    await page.click('#SignIn-submitButton')

    await navigationPromise

    // find number of coupons already clipped
    await page.waitForSelector('#content > section > div > section.SavingsDashboard.flex.mb-16.flex-wrap.-mx-4 > div:nth-child(3) > div > div > div.DashboardTile--value.text-action-800.underline.text-center')
    const clippedElement = await page.$('#content > section > div > section.SavingsDashboard.flex.mb-16.flex-wrap.-mx-4 > div:nth-child(3) > div > div > div.DashboardTile--value.text-action-800.underline.text-center');
    const clippedNumber = await clippedElement.evaluate(node => node.innerText);
    couponsClipped = parseInt(clippedNumber);

    // // filter by category

    // await page.waitForSelector('.mperks-checkbox__container')
    // const filters = await page.$$('.mperks-checkbox__container');

    // // console.log(await filters[0].evaluate(node => node.innerText)) // Show Clipped Coupons
    // // now just need to filter out by the innertext for all filters and then click the ones that are valid

    // const filtersToClick = await asyncFilter(filters, async (eleHand) => {
    //     const txt = await eleHand.evaluate(node => node.innerText)
    //     return filtersToEnable.some(e => txt.startsWith(e));
    // });
    
    // for (const filter of filtersToClick) {
    //     const checkbox = await filter.$('span');
    //     await checkbox.click();
    // }

    // const couponTiles = await page.$$('.coupon-tile__container');

    // for (const coupon of couponTiles) {
    //     if (couponsClipped >= maxCouponsClipped - 1) { break; }
    //     const txtBox = await coupon.$('.coupon-tile__desc-line-clamp__text');
    //     const txt = await txtBox.evaluate(node => node.innerText);

    //     if (ignoreKeywords.some(key => txt.toLowerCase().includes(key))) {
    //         console.log('filtered', txt)
    //         continue;
    //     }

    //     try {
    //         // could be coupon-tile__button--unclip if already clipped, so ignore and move on
    //         const clipButton = await coupon.$('.coupon-tile__button--clip');
    //         await clipButton.click();
    //         couponsClipped += 1;
    //         console.log('clipped', txt, '- total', couponsClipped);
    //     } catch (e) {}
    // }

    // // await page.waitForSelector('#asdf') // timeout

    await browser.close()
})().catch(e => {console.error(e)})