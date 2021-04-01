const { emit, pageTest } = require("./utils/helpers")
const { startTests } = require("./runner")

startTests(['chromium', 'firefox', 'webkit'], [

    pageTest("if client receives payload", async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["event1"], printToDom)
        })
        await emit("event1", {"id" : 1})
        await page.assertSee({"id" : 1})
    }),

    pageTest("if client updates subscription", async page => {
        await page.evaluate(async () => {
            window.topics = ["event1"]
            window.sub1 = await gaze.on(() => window.topics, printToDom)
            window.topics = ["event2"]
            await window.sub1.update()
        })

        await emit("event1", {"name" : "kevin"})
        await emit("event2", {"name" : "patrik"})

        await page.assertDontSee({"name" : "kevin"})
        await page.assertSee({"name" : "patrik"})
    }),

    pageTest('if client updates after on had empty array', async page => {
        await page.evaluate(async () => {
            window.topics = []
            window.sub1 = await gaze.on(() => window.topics, printToDom)
            window.topics = ["event2"]
            await window.sub1.update()
        })

        await emit("event1", {"name" : "kevin"})
        await emit("event2", {"name" : "patrik"})

        await page.assertDontSee({"name" : "kevin"})
        await page.assertSee({"name" : "patrik"})
    }),

    pageTest('if client does not receive other events', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["event2"], printToDom)
        })
        await emit("event1", {"name" : "kevin"})
        await page.assertDontSee({"name" : "kevin"})
    }),

    pageTest('if public event is received', async page => {
        await page.evaluate(async () => {
            await init(["admin"])
            await gaze.on(() => ["event1"], printToDom)
        })
        await emit("event1", {"name" : "kevin"})
        await page.assertSee({"name" : "kevin"})
    }),

    pageTest('if admin event is not received by guest', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["event1"], printToDom)
        })
        await emit("event1", {"name" : "kevin"}, "admin")
        await page.assertDontSee({"name" : "kevin"})
    }),

    pageTest('if admin event is received by admin role', async page => {
        await page.evaluate(async () => {
            await init(["admin"])
            await gaze.on(() => ["event1"], printToDom)
        })
        await emit("event1", {"name" : "kevin"}, "admin")
        await page.assertSee({"name" : "kevin"})
    }),

    pageTest('if payload callback is called once', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["event1", "event2"], printToDom)
        })
        await emit("event1", {"name" : "kevin"})
        await page.assertSee({"name" : "kevin"})
    }),

    pageTest('if event name is case sensative', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["Event1"], printToDom)
        })
        await emit("event1", {"name" : "kevin"})
        await page.assertDontSee({"name" : "kevin"})
    }),

    pageTest('if subscription is made with empty values', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["", null, undefined], printToDom)
        })

        let subscriptions = await page.evaluate(() => gaze.subscriptions.getAll())

        expect(subscriptions.length).toBe(1)
        expect(subscriptions[0].topics.length).toBe(0)
    }),
    
    pageTest('if subscription is not made if topics are not a list', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => false, printToDom)
            await gaze.on(() => {}, printToDom)
            await gaze.on(() => 100, printToDom)
        })

        let subscriptions = await page.evaluate(() => gaze.subscriptions.getAll())

        expect(subscriptions.length).toBe(3)
        expect(subscriptions[0].topics.length).toBe(0)
        expect(subscriptions[1].topics.length).toBe(0)
        expect(subscriptions[2].topics.length).toBe(0)
    }),

    pageTest('if callback does not break javascript', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["BrokenEventSync"], () => { throw "Error"})
            await gaze.on(() => ["WorkingEvent"], printToDom)
        })

        await emit("BrokenEventSync", {"name" : "kevin"})
        await emit("WorkingEvent", {"name" : "piet"})

        await page.assertSee({"name" : "piet"})
        await page.assertDontSee({"name" : "kevin"})
    }),

    pageTest('if on can accept different topics types', async page => {
        await page.evaluate(async () => {
            await gaze.on(() => ["Type1"], printToDom)
            await gaze.on(["Type2"], printToDom)
            await gaze.on("Type3", printToDom)
        })

        await emit("Type1", {"name" : "Type1"})
        await emit("Type2", {"name" : "Type2"})
        await emit("Type3", {"name" : "Type3"})

        await page.assertSee({"name" : "Type1"})
        await page.assertSee({"name" : "Type2"})
        await page.assertSee({"name" : "Type3"})
    }),

])