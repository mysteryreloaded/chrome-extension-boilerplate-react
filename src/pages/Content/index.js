import React from 'react'
import ReactDOM from 'react-dom'
import Dropdown from './components/Dropdown'
import options from './components/data.json'
import OpenAI from 'openai'

setInterval(() => {
    if (document.querySelector('.Am.aiL') !== null && document.getElementById('ai-responder-tool') === null) {
        waitForElm('.aYL').then((elm) => {
            waitToAddButton(elm)
        })
    } else if (document.querySelectorAll('#ai-responder-tool').length > 1) {
        for (let i = 0; i < document.querySelectorAll('#ai-responder-tool').length - 1; i++) {
            document.getElementById('ai-responder-tool').remove()
        }
    }
}, 1000)


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'destroy' && document.getElementById('ai-responder-tool') !== null) {
        document.getElementById('ai-responder-tool').remove()
    } else if (
      request.action === 'create' &&
      document.getElementById('ai-responder-tool') === null &&
      document.querySelector('.aoP.HM') !== null
    ) {
        waitForElm('.aYL').then((elm) => {
            waitToAddButton(elm)
        })
    }
})

function waitToAddButton(elm) {
    let elmExists = document.getElementById('ai-responder-tool') !== null
    if (elm !== null && elmExists) {
        return
    }

    if (elm !== null && !elmExists) {
        chrome.storage.local.get("access").then(r => {
            let myDiv = document.createElement('div')
            myDiv.id = 'ai-responder-tool'
            if (r.access) {
                elm.append(myDiv)
                ReactDOM.render(<Dropdown
                  id='responder'
                  title='Respond with AI'
                  data={options}
                  hasImage
                  onSelect={handleSelect}
                />, myDiv)
                document.querySelectorAll('.adf.ads').forEach((item) => {item.click()})
                document.getElementById('ai-responder-tool').childNodes[0].style.height = 'unset'
                document.getElementById('ai-responder-tool').childNodes[0].style.marginTop = 'unset'
            }
        })
    }
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

function generateResponse(id, message = '') {
    let totalTextPrompt = ''
    document.querySelectorAll('.adn.ads').forEach((message) => {totalTextPrompt = totalTextPrompt.concat(formatMessage(message).concat('\n\n'))})
    let senderData = document.querySelectorAll('.adn.ads')[document.querySelectorAll('.adn.ads').length - 1]?.innerText
    let senderName = senderData.substring(0, senderData.indexOf(' <'))
    let myData = document.querySelector('.gb_A.gb_Xa.gb_Z')?.getAttribute('aria-label')
    myData = myData.substring(myData.indexOf(':'), myData.length).replace('\n', '')
    let myName = myData.substring(2, myData.indexOf(' ('))
    let promptCondition = 'a'

    console.log(totalTextPrompt)
    switch(id) {
        case "2":
            if (message === '') {
                chrome.runtime.sendMessage({
                    action: 'iframe',
                    left: window.screenLeft + window.outerWidth,
                    top: window.screenTop
                }).then(r => {
                    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                        if (request.action === 'transcribe' && request.message !== '') {
                            generateResponse(id, request.message)
                        }
                    })
                })
            }
            break
        case "3":
            promptCondition = 'negative'
            break
        case "4":
            promptCondition = 'positive'
            break
        default:
            break
    }
    let systemContent = `Give ${promptCondition} reply on this email, but do it in a kind way. Don't include subject. Use same language provided by the user. My name is: ${myName} and senders name is: ${senderName}`
    if (message !== '') {
        systemContent = `Help me reply to an email. My name is: ${myName} and senders name is: ${senderName}. Don't include subject. Use same language provided by the user. Form your reply based on the following instructions: ${message}`
    } else if (id === "2") {
        return
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