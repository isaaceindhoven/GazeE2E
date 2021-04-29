/**
  *   Do not remove or alter the notices in this preamble.
  *   This software code regards ISAAC Standard Software.
  *   Copyright © 2021 ISAAC and/or its affiliates.
  *   www.isaac.nl All rights reserved. License grant and user rights and obligations
  *   according to applicable license agreement. Please contact sales@isaac.nl for
  *   questions regarding license and user rights.
  */

const fetch = require('node-fetch');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function emit(event, payload, role = ''){
    await fetch(`http://localhost:8001/emit.php?event=${event}&payload=${JSON.stringify(payload)}&role=${role}`);
    await sleep(100);
}

async function openClientPage(browser){
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/');

    page.see = async (content) => {
        let bodyHTML = await page.evaluate(() => document.body.innerHTML);
        return bodyHTML.includes(JSON.stringify(content));
    }

    page.assertSee = async (content) => expect(await page.see(content)).toBe(true);
    page.assertDontSee = async (content) => expect(await page.see(content)).toBe(false);

    return page;
}

function pageTest(name, handler){
    return {name, handler}
}


module.exports = { sleep, emit, openClientPage, pageTest }
