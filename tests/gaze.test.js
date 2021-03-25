const fetch = require('node-fetch');
const playwright = require('playwright');
const { dockerUp, dockerKill } = require("./utils/DockerCompose")(process.cwd());

jest.setTimeout(30 * 1000);

let browser = null;

beforeAll(async () => {
    browser = await playwright['chromium'].launch({'headless' : true});
    await dockerUp("Server running on");
}, 45 * 1000);

afterEach(() => {
    // browser.contexts().forEach(c => c.close()); // TODO: FIX ME
});

afterAll(async () => {
    await browser.close();
    await dockerKill();
}, 45 * 1000);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function emit(event, payload, role = ""){
    await fetch(`http://localhost:8001/emit.php?event=${event}&payload=${JSON.stringify(payload)}&role=${role}`);
    await sleep(100);
}

async function openClientPage(){
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/');
    page.expectIncludesPayload = async (payload, assertion) => {
        let bodyHTML = await page.evaluate(() => document.body.innerHTML);
        expect(bodyHTML.includes(JSON.stringify(payload))).toBe(assertion);
    }
    page.receivedHTML = async () => {
        return await page.evaluate(() => document.querySelector("#received").innerHTML);
    }
    return page;
}

test('if client receives payload', async () => {
    let page = await openClientPage();
    await page.evaluate(async () => {
        await init();
        await gaze.on(() => ["event1"], printToDom)
    });
    await emit("event1", {"id" : 1});
    await page.expectIncludesPayload({"id" : 1}, true);
});

test('if client updates subscription', async () => {
    let page = await openClientPage();

    await page.evaluate(async () => {
        await init();
        window.topics = ["event1"];
        window.sub1 = await gaze.on(() => window.topics, printToDom);
        window.topics = ["event2"];
        await window.sub1.update()
    });

    await emit("event1", {"name" : "kevin"});
    await emit("event2", {"name" : "patrik"});

    await page.expectIncludesPayload({"name" : "kevin"}, false);
    await page.expectIncludesPayload({"name" : "patrik"}, true);
});

test('if client does not receive other events', async () => {
    let page = await openClientPage();
    await page.evaluate(async () => {
        await init();
        await gaze.on(() => ["event2"], printToDom);
    });
    await emit("event1", {"name" : "kevin"});
    await page.expectIncludesPayload({"name" : "kevin"}, false);
});

test('if public event is received', async () => {
    let page = await openClientPage();
    await page.evaluate(async () => {
        await init(["admin"]);
        await gaze.on(() => ["event1"], printToDom);
    });
    await emit("event1", {"name" : "kevin"});
    await page.expectIncludesPayload({"name" : "kevin"}, true);
});

test('if admin event is not received by guest', async () => {
    let page = await openClientPage();
    await page.evaluate(async () => {
        await init();
        await gaze.on(() => ["event1"], printToDom);
    });
    await emit("event1", {"name" : "kevin"}, "admin");
    await page.expectIncludesPayload({"name" : "kevin"}, false);
});

test('if admin event is received by admin role', async () => {
    let page = await openClientPage();
    await page.evaluate(async () => {
        await init(["admin"]);
        await gaze.on(() => ["event1"], printToDom);
    });
    await emit("event1", {"name" : "kevin"}, "admin");
    await page.expectIncludesPayload({"name" : "kevin"}, true);
});

test('if payload callback is called once', async () => {
    let page = await openClientPage();
    await page.evaluate(async () => {
        await init();
        await gaze.on(() => ["event1", "event2"], printToDom);
    });
    await emit("event1", {"name" : "kevin"});
    expect(await page.receivedHTML()).toBe(JSON.stringify({"name" : "kevin"}));
});