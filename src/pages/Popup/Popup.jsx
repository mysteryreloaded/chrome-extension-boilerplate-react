import logo from "../../assets/img/logo.png"
import React from "react"
import OpenAI from "openai"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function Popup(props) {
  console.log('PROPS:', props)
  const [key, setKey] = React.useState("")
  const [isKeyValid, setIsKeyValid] = React.useState(false)
  chrome.storage.local.get("access").then(r => {
    console.log('SHOULD BE RAN ON EVERY COMPONENT RENDER EVENT', r.access)
    setIsKeyValid(r.access)
  })
  function notify(message) {
    toast(message, {theme: 'colored'})
  }
  function checkKey() {
    const openai = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true
    })

    openai.chat.completions.create({
      messages: [{ role: 'user', content: 'Say this is a test' }],
      model: 'gpt-4o-mini'
    }).then((res) => {
      console.log(res)
      setIsKeyValid(true)
      chrome.storage.local.set({abc: key, access: true}).then(r => console.log("SET abc and access in storage: ", r)).catch((err) => {console.log(err)})
      chrome.runtime.sendMessage({
        action: 'create'
      })
    }).catch((err) => {
      if (err.code === 'invalid_api_key')
        notify("API key is not correct.")
      else
        notify("Something went wrong...")
    })
  }

  function resetKey() {
    setKey("")
    setIsKeyValid(false)
    chrome.storage.local.set({abc: "", access: false}).then(r => console.log("RESET abc and access in storage: ", r)).catch((err) => {console.log(err)})
    chrome.runtime.sendMessage({
      action: 'destroy'
    })
  }

  return (
    <div className={'p-3'}>
      <div>
        <img src={logo} className="logo" alt="AI Gmail Responder Extension Logo" />
      </div>
      { !isKeyValid && <div className="form-group text-center">
        <label htmlFor={'api-key'} className={'fw-bold'}>Open AI API KEY</label>
        <input className={'form-control my-3'} id={'api-key'} value={key} onChange={(e) => setKey(e.target.value)} />
        <button className={'btn btn-dark w-100'} onClick={() => checkKey()}>Save</button>
        <ToastContainer/>
      </div> }
      { isKeyValid && <div className="form-group text-center mt-3">
        <label className={'fw-bold mb-2'}>API Key connected successfully!</label>
        <p className={'mb-3'}>If AI button is not visible please refresh your gmail page.</p>
        <button id={'change-key'} className={'btn btn-dark w-100'} onClick={() => resetKey()}>Change API key</button>
      </div> }
    </div>
  )
}


export default Popup