import React from 'react';
import Enzyme, {shallow, render, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createMemoryHistory } from 'history';
import PerformanceObserver from './src/js/components/google-analytics/__mocks__/PerformanceObserver';
import {googleAnalyticsInit} from './src/js/components/google-analytics/GoogleAnalytics';

// React 16 Enzyme adapter
Enzyme.configure({adapter: new Adapter()});
// Make Enzyme functions available in all test files without importing
global.shallow = shallow;
global.render = render;
global.mount = mount;
global.React = React;

global.ga = function ga(...args) {
    console.log(`Sent ga(). [${args.join(', ')}]`);
};
global.testHistory = createMemoryHistory();
global.PerformanceObserver = PerformanceObserver;
googleAnalyticsInit('123', 'tracker', global.testHistory, /.*/);
