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

        test('if client updates after on had empty array', async () => {
            await page.evaluate(async () => {
                await init();
                window.topics = [];
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
            await page.expectIncludesPayload({"name" : "kevin"}, true);
        });

        test('if event name is case sensative', async () => {
            await page.evaluate(async () => {
                await init();
                await gaze.on(() => ["Event1"], printToDom);
            });
            await emit("event1", {"name" : "kevin"});
            await page.expectIncludesPayload({"name" : "kevin"}, false);
        });

        test('if subscription is made with empty values', async () => {
            await page.evaluate(async () => {
                await init();
                await gaze.on(() => ["", null, undefined], printToDom);
            });

            let subscriptions = await page.evaluate(() => gaze.subscriptions);

            expect(subscriptions.length).toBe(1)
            expect(subscriptions[0].topics.length).toBe(0)
        });

        test('if subscription is not made if topics are not a list', async () => {
            await page.evaluate(async () => {
                await init();
                await gaze.on(() => "1", printToDom);
                await gaze.on(() => false, printToDom);
                await gaze.on(() => {}, printToDom);
                await gaze.on(() => 100, printToDom);
            });

            let subscriptions = await page.evaluate(() => gaze.subscriptions);

            expect(subscriptions.length).toBe(4)
            expect(subscriptions[0].topics.length).toBe(0)
            expect(subscriptions[1].topics.length).toBe(0)
            expect(subscriptions[2].topics.length).toBe(0)
            expect(subscriptions[3].topics.length).toBe(0)
        });

    })
}