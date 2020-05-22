/* eslint-disable no-console */
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Prism from 'prismjs';
import randomName from 'random-name';
import {createHashHistory} from 'history';
import {tracker, googleAnalyticsInit} from './components/google-analytics/GoogleAnalytics';
import 'prismjs/themes/prism.css';
import './Demo.scss';


/*replace this with your google analytics account */
const GOOGLE_ANALYTICS_ACCOUNT = 'UA-17432465-17';
const CATEGORY = 'IMPERVAOS-GA-SPA-DEV-DEMO';
const TRACKER_NAME = 'mytracker';
const TRACKED_USERID = 'user@user.com';

/*run this function as soon as possible in your application, but after the google-analytics.js script was run*/
googleAnalyticsInit(GOOGLE_ANALYTICS_ACCOUNT,
    TRACKER_NAME,
    createHashHistory(),
    {
        include: /.*reqres.in.*/i,
        initiatorTypes: null,
        category: entry => {
            return (new URL(entry.name)).pathname.replace('/', '_').toUpperCase();
        }
    },
    {
        userId: TRACKED_USERID,
    },
    {
        dimension1: 'mydim1',
        dimension2: 'mydim2',
    }
);


const Action = (props) => {
    useEffect(() => Prism.highlightAll(), []);

    return (
        <div className="action" key={props.id}>
            <div className={'code_description'}>
                <h3 className={'action-text'}>{props.text}</h3>
            </div>
            <div style={{display: 'flex'}}>
                <pre style={{position: 'relative'}}>
                    <code className={'language-js'}>{props.code}</code>
                    <button onClick={props.onClick} className={'inline-button'}>
                        {props.buttonText}
                    </button>
                </pre>
            </div>
        </div>);
};


Action.propTypes = {
    id: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    text: PropTypes.string,
    actionText: PropTypes.string,
    code: PropTypes.string,
    buttonText: PropTypes.string,
};
Action.defaultProps = {
    buttonText: 'RUN'
};

const Demo = () => {
    const [hash, setHash] = useState('#first');
    return (
        <div className="demo">
            <h1>@impervaos/google-analytics-spa demo</h1>
            <h3>This page demonstrates the usage of the component</h3>
            <p style={{backgroundColor: 'yellow', border: 'solid 1px', padding: '5px'}}>
                {'Open DevTools (F12) > Network > Other. ' +
                 'Requests labeled \'collect\' are the ones sent to google analytics'}
            </p>
            <h2 style={{fontWeight: 'bold'}}>Install</h2>
            <pre>
                <code className={'language-bash'}>{'$ npm i @impervaos/google-analytics-spa'}</code>
            </pre>
            <h2 style={{fontWeight: 'bold'}}>Setup</h2>
            <pre style={{display: 'inline'}}>
                <code className={'language-js'}>
                    {'import {tracker, googleAnalyticsInit} from \'@impervaos/google-analytics-spa\';\n' +
                     'import { createBrowserHistory } from \'history\';\n\n' +
                     '/**\n' +
                     ' * @param {string} trackerId - Id of your app defined in Google analytics account, usually starts with UA-\n' +
                     ' * @param {string} trackerName - a name to represent a GA tracker.\n' +
                     '                                   Useful if you want to have 2 separate GA trackers\n' +
                     ' * @param {Object} history - history object. we are using https://www.npmjs.com/package/history\n' +
                     ' * @param {string} performanceInclude - used for REST performance logging purposes.\n' +
                     '                                          Only requests who\'s url matches the regex will be reported.\n' +
                     ' *                                        if set to null will not report anything, \n' +
                     '                                          will report everything if set to .* \n' +
                     ' * @param {Object} gaProperties - list of google analytics field properties\n' +
                     ' * @param {Object} gaDimensions - list of custom dimensions\n' +
                     ' * @return {GaTracker} - the singleton object through which reporting is made\n' +
                     ' */\n' +
                     'googleAnalyticsInit("UA-XXXXXXXX-XX",\n' +
                     '    "myTraker",\n' +
                     '    createBrowserHistory(),\n' +
                     '    /.*/,\n' +
                     '    { userId: this.loggedInUsername },\n' +
                     '    {\n' +
                     '        dimension1: this.sessionId,\n' +
                     '        dimension2: this.userIp,\n' +
                     '    });'}</code>
            </pre>
            <h2 style={{fontWeight: 'bold'}}>Basic Usage</h2>
            <Action
                actionText={'Report event'}
                text={'Report that something happened in the application'}
                id="report_action_1"
                onClick={() => tracker().reportEvent(CATEGORY, 'BUTTON_WAS_CLICKED', 'DEVELOPMENT', 1)}
                code={'    /**\n' +
                      '   * Reporting an event in the system\n' +
                      '   * @param {string} category - action category\n' +
                      '   * @param {Object} action - action itself\n' +
                      '   * @param {string} label - label of an action\n' +
                      '   * @param {number} value - numeric value of the action\n' +
                      '   */\n' +
                      `tracker().reportEvent(${CATEGORY}, 'BUTTON_WAS_CLICKED', 'DEVELOPMENT', 1)`}
            />
            <Action
                actionText={'Report page view'}
                text={'Report navigation to another page'}
                id="report_page1"
                onClick={() => tracker().reportPage('MyPersonalPage', 'personal_page.html')}
                code={'    /**\n' +
                      '   * Reports page view\n' +
                      '   * If you run createBrowserHistory() from the "history" component, there\'s no need to report pages manually, \n' +
                      '   * google-analytics-spa will bind to your browsers history and will report navigation changes automatically \n' +
                      '   * @param {string} title - reported page title\n' +
                      '   * @param {string} page - page url\n' +
                      '   */\n' +
                      'tracker().reportPage(\'MyPersonalPage\', \'personal_page.html\')'}
            />
            <div className="action">
                <div style={{display: 'flex'}}>
                    <h3 className={'action-text'} style={{marginRight: '15px'}}>{'Automatic navigation report'}</h3>
                    <a onClick={() => setHash(`#${randomName.first()}`)} href={hash}>{'Click me to change page url'}</a>
                </div>
                <pre>
                    <code className={'language-js'}>{
                        '/*\n' +
                        'If you run createBrowserHistory() from the "history" component,\n' +
                        'there\'s no need to report pages manually. \n' +
                        'google-analytics-spa will listen to your browsers history\n' +
                        'and will report navigation changes automatically\n' +
                        '/*'
                    }</code>
                </pre>
            </div>

            <Action
                text={'Automatic web request report'}
                id="report_req"
                buttonText={'FETCH USERS LIST'}
                onClick={() => fetch('https://reqres.in/api/users?page=2')}
                code={'    /**\n' +
                      '   * \n' +
                      '   * When you are sending REST calls (or any other web requests) in your application\n' +
                      '   * google-analytics-spa will track them and will report their performance to GA automatically\n' +
                      '   * The following is reported:\n' +
                      '   * Download time - time it took to download the resource\n' +
                      '   * Server waiting time - time it took to the server to process the request + turnaround time\n' +
                      '   * Duration time - time from request dispatch until the complete response was received\n' +
                      '   * \n' +
                      '   * By default any request sent by the application will be tracked\n' +
                      '   * In order to include only some requests: \n' +
                      '   * specify proper regex in \'performanceInclude\' argument of \'googleAnalyticsInit\' function\n'}
            />


            <Action
                actionText={'Report an exception manually'}
                text={'Report exception'}
                id="report_exception"
                onClick={() => tracker().reportException('Error occurred while loading...', true)}
                code={'    /**\n' +
                      '   * Reporting an execution exception to GA\n' +
                      '   * @param {string} exDescription\n' +
                      '   * @param {boolean} isFatal\n' +
                      '   */\n' +
                      'tracker().reportException(\'Error occurred while loading...\', true)'}
            />
        </div>
    );
};

export default Demo;
