import React from 'react';
import ReactDOM from 'react-dom';
import Demo from './Demo.jsx';

const wrapper = document.getElementById('react-root');
if (wrapper) {
    ReactDOM.render(<Demo />, wrapper);
}
