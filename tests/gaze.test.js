const { emit, pageTest } = require("./utils/helpers");
const { startTests } = require("./runner");

startTests(['chromium', 'firefox', 'webkit'], [

    pageTest("if client receives payload", async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["event1"], printToDom)
        });
        await emit("event1", {"id" : 1});
        await page.expectIncludesPayload({"id" : 1}, true);
    }),

    pageTest("if client updates subscription", async page => {
        await page.evaluate(async () => {
            window.topics = ["event1"];
            window.sub1 = await gaze.on(() => window.topics, printToDom);
            window.topics = ["event2"];
            await window.sub1.update()
        });

        await emit("event1", {"name" : "kevin"});
        await emit("event2", {"name" : "patrik"});

        await page.expectIncludesPayload({"name" : "kevin"}, false);
        await page.expectIncludesPayload({"name" : "patrik"}, true);
    }),

    pageTest('if client updates after on had empty array', async page => {
        await page.evaluate(async () => {
            window.topics = [];
            window.sub1 = await gaze.on(() => window.topics, printToDom);
            window.topics = ["event2"];
            await window.sub1.update()
        });

        await emit("event1", {"name" : "kevin"});
        await emit("event2", {"name" : "patrik"});

        await page.expectIncludesPayload({"name" : "kevin"}, false);
        await page.expectIncludesPayload({"name" : "patrik"}, true);
    }),

    pageTest('if client does not receive other events', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["event2"], printToDom);
        });
        await emit("event1", {"name" : "kevin"});
        await page.expectIncludesPayload({"name" : "kevin"}, false);
    }),

    pageTest('if public event is received', async page => {
        await page.evaluate(async () => {
            await init(["admin"]);
            await gaze.on(() => ["event1"], printToDom);
        });
        await emit("event1", {"name" : "kevin"});
        await page.expectIncludesPayload({"name" : "kevin"}, true);
    }),

    pageTest('if admin event is not received by guest', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["event1"], printToDom);
        });
        await emit("event1", {"name" : "kevin"}, "admin");
        await page.expectIncludesPayload({"name" : "kevin"}, false);
    }),

    pageTest('if admin event is received by admin role', async page => {
        await page.evaluate(async () => {
            await init(["admin"]);
            await gaze.on(() => ["event1"], printToDom);
        });
        await emit("event1", {"name" : "kevin"}, "admin");
        await page.expectIncludesPayload({"name" : "kevin"}, true);
    }),

    pageTest('if payload callback is called once', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["event1", "event2"], printToDom);
        });
        await emit("event1", {"name" : "kevin"});
        await page.expectIncludesPayload({"name" : "kevin"}, true);
    }),

    pageTest('if event name is case sensative', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["Event1"], printToDom);
        });
        await emit("event1", {"name" : "kevin"});
        await page.expectIncludesPayload({"name" : "kevin"}, false);
    }),

    pageTest('if subscription is made with empty values', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["", null, undefined], printToDom);
        });

        let subscriptions = await page.evaluate(() => gaze.subscriptions);

        expect(subscriptions.length).toBe(1)
        expect(subscriptions[0].topics.length).toBe(0)
    }),

    pageTest('if subscription is not made if topics are not a list', async page => {
        await page.evaluate(async () => {
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
    }),

]);