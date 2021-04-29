/**
  *   Do not remove or alter the notices in this preamble.
  *   This software code regards ISAAC Standard Software.
  *   Copyright © 2021 ISAAC and/or its affiliates.
  *   www.isaac.nl All rights reserved. License grant and user rights and obligations
  *   according to applicable license agreement. Please contact sales@isaac.nl for
  *   questions regarding license and user rights.
  */

const { openClientPage } = require('./utils/helpers')
const playwright = require('playwright')
const { dockerUp, dockerKill } = require('./utils/DockerCompose')(process.cwd())

function startTests(browsers, tests){

    if (browsers.some(b => b.includes('only:'))){
        browsers = browsers.filter(b => b.includes('only:')).map(b => b.replace('only:', ''))
    }

    jest.setTimeout(30 * 1000)

    beforeAll(async () => {
        await dockerUp('Server running on')
    }, 45 * 1000)

    afterAll(async () => {
        await dockerKill()
    }, 45 * 1000)

    for(let browserType of browsers){
        describe(`Testing with browser ${browserType}`, () => {
    
            let browser = null
            let page = null
    
            beforeAll(async () => {
                browser = await playwright[browserType].launch({'headless' : true})
            }, 45 * 1000)
    
            beforeEach(async () => {
                page = await openClientPage(browser)
                await page.evaluate(async () => await init())
            })
    
            afterEach(async () => {
                for(let c of browser.contexts()){ 
                    await c.close() 
                }
            })
    
            afterAll(async () => { 
                await browser.close() 
            })

            if (tests.some(t => t.name.includes('only:'))){
                tests = tests.filter(t => t.name.includes('only:'))
            }

            tests.forEach(t => {
                test(t.name, async () => await t.handler(page))
            })
    
        })
    }

}

module.exports = { startTests }
