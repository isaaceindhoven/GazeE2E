const { emit, openClientPage } = require("./utils/helpers");
const playwright = require('playwright');
const { dockerUp, dockerKill } = require("./utils/DockerCompose")(process.cwd());

jest.setTimeout(30 * 1000);

beforeAll(async () => {
    await dockerUp("Server running on");
}, 45 * 1000);

afterAll(async () => {
    await dockerKill();
}, 45 * 1000);

for(let browserType of ['chromium', 'firefox', 'webkit']){
    describe(`Testing with browser ${browserType}`, () => {

        let browser = null;
        let page = null;

        beforeAll(async () => {
            browser = await playwright[browserType].launch({'headless' : true});
        }, 45 * 1000);

        beforeEach(async () => {
            page = await openClientPage(browser);
        })

        afterEach(async () => {
            for(let c of browser.contexts()){ 
                await c.close() 
            }
        });

        afterAll(async () => { 
            await browser.close() 
        })

        test('if client receives payload', async () => {
            await page.evaluate(async () => {
                await init();
                await gaze.on(() => ["event1"], printToDom)
            });
            await emit("event1", {"id" : 1});
            await page.expectIncludesPayload({"id" : 1}, true);
        });

        test('if client updates subscription', async () => {
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

        test('if client updates subscription', async () => {
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
            await page.evaluate(async () => {
                await init();
                await gaze.on(() => ["event2"], printToDom);
            });
            await emit("event1", {"name" : "kevin"});
            await page.expectIncludesPayload({"name" : "kevin"}, false);
        });

        test('if public event is received', async () => {
            await page.evaluate(async () => {
                await init(["admin"]);
                await gaze.on(() => ["event1"], printToDom);
            });
            await emit("event1", {"name" : "kevin"});
            await page.expectIncludesPayload({"name" : "kevin"}, true);
        });

        test('if admin event is not received by guest', async () => {
            await page.evaluate(async () => {
                await init();
                await gaze.on(() => ["event1"], printToDom);
            });
            await emit("event1", {"name" : "kevin"}, "admin");
            await page.expectIncludesPayload({"name" : "kevin"}, false);
        });

        test('if admin event is received by admin role', async () => {
            await page.evaluate(async () => {
                await init(["admin"]);
                await gaze.on(() => ["event1"], printToDom);
            });
            await emit("event1", {"name" : "kevin"}, "admin");
            await page.expectIncludesPayload({"name" : "kevin"}, true);
        });

        test('if payload callback is called once', async () => {
            await page.evaluate(async () => {
                await init();
                await gaze.on(() => ["event1", "event2"], printToDom);
            });
            await emit("event1", {"name" : "kevin"});
            expect(await page.receivedHTML()).toBe(JSON.stringify({"name" : "kevin"}));
        });

    })
}