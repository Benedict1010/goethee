const { chromium } = require('playwright');

(async () => {
    const numberOfBrowsers = 2;
    const pageURL = 'https://www.goethe.de/ins/de/en/prf/ort/fra/gzb2.cfm';
    const targetTime = '21:16:00'; // The exact time you want to start clicking (e.g., 10:30 AM)

    try {
        // Function to wait until the exact target time
        const waitUntilTime = (targetTime) => {
            return new Promise(resolve => {
                const now = new Date();
                const target = new Date(now.toDateString() + ' ' + targetTime);
                const delay = target.getTime() - now.getTime();

                if (delay > 0) {
                    setTimeout(resolve, delay);
                } else {
                    resolve();
                }
            });
        };

        // Function to perform the selection process in each browser
        async function selectModulesInBrowser(browserIndex) {
            const browser = await chromium.launch({
                headless: false, // Run Chromium with the UI visible
            });

            const context = await browser.newContext();
            const page = await context.newPage();
            await page.goto(pageURL, { waitUntil: 'networkidle' });

            // Wait until the target time
            await waitUntilTime(targetTime);

            try {
                // Wait for the "SELECT MODULES" button to be available and click it
                await page.waitForSelector('.btnGruen.icon-double-arrow-right', { timeout: 10000 });
                await page.click('.btnGruen.icon-double-arrow-right');
                console.log(`Browser ${browserIndex + 1}: "SELECT MODULES" button clicked.`);

                // Wait for the "Continue" button to be available and click it
                await page.waitForSelector('.cs-button.cs-button--arrow_next', { timeout: 10000 });
                await page.click('.cs-button.cs-button--arrow_next');
                console.log(`Browser ${browserIndex + 1}: "Continue" button clicked.`);
            } catch (error) {
                console.error(`Browser ${browserIndex + 1}: Failed to complete the selection process.`, error);
            }

            // The browser will remain open
        }

        const browserPromises = [];
        for (let i = 0; i < numberOfBrowsers; i++) {
            browserPromises.push(selectModulesInBrowser(i));
        }

        await Promise.all(browserPromises);

    } catch (error) {
        console.error('Error occurred:', error);
    }
})();









