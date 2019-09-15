/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { TransparentButton } from '@imperva/buttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { tracker, googleAnalyticsInit } from './components/google-analytics/GoogleAnalytics';
import './Demo.scss';

googleAnalyticsInit( 'UA-17432465-11', 'some_tracker' );

const Action = props => (
  <React.Fragment key={props.id}>
    <td>
      <div className={'first-col'}>
        <TransparentButton
          icon={<FontAwesomeIcon icon={faPaperPlane} size="2x" style={{ color: 'green' }} />}
          onClick={() => {
            console.log( props.id );
            props.onClick();
          }}
        />
        <p style={{ marginLeft: '15px' }}>{props.id}</p>
      </div>
    </td>
    <td>
      <SyntaxHighlighter language="javascript">
        {props.onClick.toString()
                      .replace( '__WEBPACK_IMPORTED_MODULE_8__components_google_analytics_GoogleAnalytics__["b" /* tracker */]',
                               'tracker' )}</SyntaxHighlighter>
    </td>
  </React.Fragment>

);

Action.propTypes = {
  id:      PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const Demo = () => (
  <div className="demo">
    <table>
      <thead>
        <tr>
          <th>Action</th>
          <th>Code</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <Action
            id={'report_action_1'}
            onClick={() => tracker.reportAction( 'GA-DEMO', 'ACTION-1', 'DEVELOPMENT', 1 )}
          />
        </tr>
        <tr>
          <Action
            id={'Report page load time'}
            onClick={() => tracker.reportPageLoadTime( 'GA-DEMO' )}
          />
        </tr>
      </tbody>
    </table>


  </div>
);

export default Demo;

