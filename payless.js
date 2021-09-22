const puppeteer = require('puppeteer')

function runPuppeteer(req, res) {
    const urlToScreenshot = 'http://www.google.com';
    (async () => {
        const browser = await puppeteer.launch({
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
            ],
          });

        const page = await browser.newPage();
        await page.goto(urlToScreenshot);
        await page.screenshot().then(function(buffer) {
            res.setHeader('Content-Disposition', 'attachment;filename="' + urlToScreenshot + '.png"');
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer)
        });

        await browser.close();
    })()
}
  

module.exports = runPuppeteer;
