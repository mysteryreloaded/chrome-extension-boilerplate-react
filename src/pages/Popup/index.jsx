import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Popup from './Popup';

const container = document.getElementById('app-container');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
chrome.storage.local.get(null, function (data) {
  root.render(
    <Popup {...data} />,
    document.getElementById('root')
  )
});
