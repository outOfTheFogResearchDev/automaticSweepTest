import React from 'react';
import { render } from 'react-dom';
import { get } from 'axios';
import App from './app/index';

window.addEventListener('beforeunload', () => get('/exit'));

render(<App />, document.getElementById('app'));
