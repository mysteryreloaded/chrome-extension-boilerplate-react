import React from 'react'
import ReactDOM from 'react-dom'
import Dropdown from './components/Dropdown'
import data from './components/data.json'
import OpenAI from 'openai'

waitForElm('.aYL').then((elm) => {
    waitToAddButton(elm)
})

function waitToAddButton(elm) {
    let refreshIntervalId = setInterval(() => {
        let elmExists = document.getElementById('ai-responder-tool') !== null
        let replyBoxExists = document.querySelector('.aoP.HM') !== null
        if (elm !== null && elmExists) {
            return
        }
        if (!replyBoxExists) {
            console.log('EXIT INTERVAL')
            return
        }
        let myDiv = document.createElement('div')
        myDiv.id = 'ai-responder-tool'
        if (elm !== null) {
            if (!elmExists) {
                waitForElm('.aYL').then((elem) => {
                    waitToAddButton(elem)
                })
                elm.append(myDiv)
                ReactDOM.render(<Dropdown
                  id='responder'
                  title='Respond with AI'
                  data={data}
                  hasImage
                  onSelect={handleSelect}
                />, myDiv)
                document.querySelectorAll('.adf.ads').forEach((item) => {item.click()})
                clearInterval(refreshIntervalId)
            }
        }
    }, 500)
}

const handleSelect = (id) => {
    generateResponse(id)
}

function formatMessage(message) {
    let result = ''
    result = result.concat(message?.innerText.replaceAll('\n', '\n'))
    result = result.replaceAll('\t', '\t')
    return result.substring(result.indexOf('to me'), result.length).substring(6)
}

function generateResponse(id) {
    let totalTextPrompt = ''
    document.querySelectorAll('.adn.ads').forEach((message) => {totalTextPrompt = totalTextPrompt.concat(formatMessage(message).concat('\n\n'))})
    let senderData = document.querySelectorAll('.adn.ads')[document.querySelectorAll('.adn.ads').length - 1]?.innerText
    let senderName = senderData.substring(0, senderData.indexOf(' <'))
    let myData = document.querySelector('.gb_A.gb_Xa.gb_Z')?.getAttribute('aria-label')
    myData = myData.substring(myData.indexOf(':'), myData.length).replace('\n', '')
    let myName = myData.substring(2, myData.indexOf(' ('))
    let promptCondition = 'a'
    let systemContent = `Give ${promptCondition} reply on this email, but do it in a kind way. Don't include subject. Use same language provided by the user. My name is: ${myName} and senders name is: ${senderName}`
    console.log(senderName)
    console.log(myName)
    console.log(totalTextPrompt)
    switch(id) {
        case "2":
            console.log('Generate response with prompt selected.')
            break
        case "3":
            promptCondition = 'negative'
            console.log('Say NO selected.')
            break
        case "4":
            promptCondition = 'positive'
            console.log('Say YES selected.')
            break
        default:
            console.log('Generate response selected.')
            break
    }
    console.log(systemContent)
    chrome.storage.local.get(['abc', 'access'], async (data) => {
        if (totalTextPrompt && data.access) {
            const openai = new OpenAI({
                apiKey: data.abc,
                dangerouslyAllowBrowser: true
            })
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemContent },
                    {
                        role: "user",
                        content: totalTextPrompt,
                    },
                ],
            })
            console.log(completion)
            document.querySelector('.Am.aiL[aria-label="Message Body"]').innerText = completion.choices[0].message.content
        }
    })
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector))
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect()
                resolve(document.querySelector(selector))
            }
        })

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.body, {
            childList: true,
            subtree: true
        })
    })
}
// import { printLine } from './modules/print'
//
// let isContentLoaded = false
// setInterval(() => {
//     if (!isContentLoaded) {
//         startContentScript()
//     }
// }, 1000)
// function startContentScript() {
//   let lastButton = document.querySelector('.aYL')
//   let buttonExists = lastButton !== null && lastButton !== undefined
//   if (window.location.href.includes('://mail.google.com/') && buttonExists) {
//     lastButton.after("<p>Test</p>")
//     console.log('Content script works!')
//     console.log('Must reload extension for modifications to take effect.')
//
//     printLine("Using the 'printLine' function from the Print Module")
//     if (document.getElementById('custom_ai_id') !== null) {
//         isContentLoaded = true
//     }
//   }
// }
