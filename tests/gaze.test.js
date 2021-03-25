const fetch = require('node-fetch');
const playwright = require('playwright');
const { dockerUp, dockerKill } = require("./utils/DockerCompose")(process.cwd());

jest.setTimeout(30 * 1000);

let browser = null;

beforeAll(async (done) => {
    browser = await playwright['chromium'].launch({'headless' : true});
    await dockerUp("Server running on");
    done();
}, 45 * 1000);

afterAll(async (done) => {
    await browser.close();
    await dockerKill();
    done();
}, 45 * 1000);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

test('event should be received', async (done) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/');
    await page.evaluate(() => window.init());
    await page.evaluate(() => window.update(["event1"]));
    const payload = JSON.stringify({"id" : 1});
    await fetch(`http://localhost:8001/emit.php?event=event1&payload=${payload}&role=`);
    await sleep(100);
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    let inBody = bodyHTML.includes(payload);
    expect(inBody).toBe(true);
    await page.close();
    done();
});

test('event should not be received', async (done) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/');
    await page.evaluate(() => window.init());
    await page.evaluate(() => window.update(["event2"]));
    const payload = JSON.stringify({"id" : 1});
    await fetch(`http://localhost:8001/emit.php?event=event1&payload=${payload}&role=`);
    await sleep(100);
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    let inBody = bodyHTML.includes(payload);
    expect(inBody).toBe(false);
    await page.close();
    done();
});

test('event should not be received', async (done) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/');
    await page.evaluate(() => window.init());
    await page.evaluate(() => window.update(["event1"]));
    await page.evaluate(() => window.update(["event2"]));
    const payload = JSON.stringify({"id" : 1});
    await fetch(`http://localhost:8001/emit.php?event=event1&payload=${payload}&role=`);
    await sleep(100);
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    let inBody = bodyHTML.includes(payload);
    expect(inBody).toBe(false);
    await page.close();
    done();
});

test('event should be received', async (done) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/');
    await page.evaluate(() => window.init(["admin"]));
    await page.evaluate(() => window.update(["event1"]));
    const payload = JSON.stringify({"id" : 1});
    await fetch(`http://localhost:8001/emit.php?event=event1&payload=${payload}&role=`);
    await sleep(100);
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    let inBody = bodyHTML.includes(payload);
    expect(inBody).toBe(true);
    await page.close();
    done();
});

test('event should not be received', async (done) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/');
    await page.evaluate(() => window.init([]));
    await page.evaluate(() => window.update(["event1"]));
    const payload = JSON.stringify({"id" : 1});
    await fetch(`http://localhost:8001/emit.php?event=event1&payload=${payload}&role=admin`);
    await sleep(100);
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    let inBody = bodyHTML.includes(payload);
    expect(inBody).toBe(false);
    await page.close();
    done();
});

test('event should be received', async (done) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/');
    await page.evaluate(() => window.init(["admin"]));
    await page.evaluate(() => window.update(["event1"]));
    const payload = JSON.stringify({"id" : 1});
    await fetch(`http://localhost:8001/emit.php?event=event1&payload=${payload}&role=admin`);
    await sleep(100);
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    let inBody = bodyHTML.includes(payload);
    expect(inBody).toBe(true);
    await page.close();
    done();
});

test('event should be received but not 2 times', async (done) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/');
    await page.evaluate(() => window.init(["admin"]));
    await page.evaluate(() => window.update(["event1", "event2"]));
    const payload = JSON.stringify({"id" : 1});
    await fetch(`http://localhost:8001/emit.php?event=event1&payload=${payload}&role=admin`);
    await sleep(100);
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    expect(bodyHTML.includes(payload)).toBe(true);
    expect(bodyHTML.includes(payload + payload)).toBe(false);
    await page.close();
    done();
});