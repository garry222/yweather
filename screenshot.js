const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;
  while(checkCounts++ <= maxChecks){
    let html = await page.content();
    let currentHTMLSize = html.length;
    let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);
    console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);
    if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
      countStableSizeIterations++;
    else
      countStableSizeIterations = 0; //reset the counter
    if(countStableSizeIterations >= minStableSizeIterations) {
      console.log("Page rendered fully..");
      break;
    }
    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }
};

const puppeteer = require('puppeteer')
const Xvfb = require('xvfb');
const dr = __dirname + '/extdarkreader';

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    ;(async () => {
      var xvfb = new Xvfb({
        silent: true,
        xvfb_args: ["-screen", "0", '1280x720x24', "-ac"],
      });
      xvfb.start((err)=>{if (err) console.error(err)})

      const customArgs = [
        `--start-maximized`,
        `--no-sandbox`,
        `--display=`+xvfb._display,
        `--load-extension=${dr}`
      ];

      const browser = await puppeteer.launch({
        defaultViewport: null,
        executablePath:process.env.chrome,
        headless: false,
        ignoreDefaultArgs: ["--disable-extensions","--enable-automation"],
        args: customArgs,
      })

      const page = await browser.newPage()

      await page.setViewport({
        width: 1024,
        height: 630,
        deviceScaleFactor: 1,
        isLandscape: true
      });

      await page.goto(url, {
        timeout: "10000",
        waitUntil: ['load', 'networkidle0', 'domcontentloaded']
      })

      await waitTillHTMLRendered(page)

/*      try {
        await page.waitForNavigation()
      } catch {
      }
*/

      const data = await page.content()

      const buffer = await page.screenshot({
        type: 'png',
        clip: { x: 550, y: 220, width: 250, height: 230 }
      })

      await browser.close()

      resolve(buffer)
    })()
  })
}
