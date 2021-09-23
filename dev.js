const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const username = ''; // can be phone number or email
const password = '';
const headless = false;
const MAX_COUPONS = 150;

const recentOnly = true;

let couponsClipped = 0;

const filtersToEnable = ['Beverages', 'Canned-\\&\\ Packaged', 'Condiment-\\&\\ Sauces'];
const ignoreKeywords = ['coffee', 'creamer', 'almond', 'pizza', 'gum', 'pods', 'nut'];

// https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/#async-filter-with-map
const asyncFilter = async (arr, predicate) => {
    const results = await Promise.all(arr.map(predicate));
    return arr.filter((_v, index) => results[index]);
}

const delay = async (time_ms) => {
    return new Promise((res, rej) => setTimeout(res, time_ms))
}

const textContainsKeywords = (text) => {
    return ignoreKeywords.some(keyword => text.includes(keyword))
}

// https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore
async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

(async () => {
    puppeteer.use(StealthPlugin())
    const browser = await puppeteer.launch({ 
        headless,
        slowMo: 250,
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

    console.log(couponsClipped);

    // filter by category

    if (recentOnly) {
        await page.waitForSelector('#new-coupons-filer')
        await page.click('#new-coupons-filer')
    }

    // shop in store
    await page.waitForSelector('#SearchableList-item-In-Store')
    await page.click('#SearchableList-item-In-Store')
    
    const departmentSearchBox = await page.$('[placeholder="Search Departments"]')
    for (const filterSuffix of filtersToEnable) {
        // await departmentSearchBox.click({ clickCount: 3 })
        await departmentSearchBox.type(filterSuffix.substring(0, 3))
        const filter = `#SearchableList-item-${filterSuffix}`;
        await page.waitForSelector(filter)
        await page.click(filter)
        await delay(500)
    }

    const numberOfCouponsElement = await page.$('.CouponCount');
    const expectedAmountToClip = (await numberOfCouponsElement.evaluate(node => node.innerText)).substring(0, 3).trim();
    console.log('Expect to clip ', expectedAmountToClip)
    
    await autoScroll(page)

    const couponTiles = await page.$$('li > .kds-Card');

    console.log('Total cards found ', couponTiles.length)

    for (const coupon of couponTiles) {
        if (couponsClipped >= MAX_COUPONS - couponsClipped - 1) { break; }
        try {
            // could be coupon-tile__button--unclip if already clipped, so ignore and move on
            // kds-Button kds-Button--primary kds-Button--compact CouponActionButton shadow-4 hover:shadow:2 CouponCard-button ml-8 false w-1/2 body-m font-500
            // kds-Button kds-Button--cancel kds-Button--compact CouponActionButton CouponCard-button ml-8 false w-1/2 body-m font-500
            const clipButton = await coupon.$('.kds-Button--primary');
            const text = await coupon.$eval('.kds-Button--primary', node => node.getAttribute('aria-label'))
            // console.log(text)

            if (textContainsKeywords(text.toLowerCase())) {
                console.log('filtered', text)
                continue;
            } else {
                await clipButton.click();
                couponsClipped += 1;
                console.log('clipped', text, '- total', couponsClipped);
            }
        } catch (e) {
            console.log(e)
        }
        // break;
    }

    // await page.waitForSelector('#asdf') // timeout
    await delay(5000)

    await browser.close()
})().catch(e => {console.error(e)})