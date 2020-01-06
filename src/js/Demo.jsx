/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { CancelSimpleButton } from '@imperva/buttons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { tracker, googleAnalyticsInit } from './components/google-analytics/GoogleAnalytics';
import './Demo.scss';

googleAnalyticsInit( 'UA-17432465-11',
                     'some_tracker',
                     null,
    /.*localhost.*/i,
  {
    userId: 'myUser',
  },
  {
    dimension1: 'value1',
    dimension2: 'value2',
  } );

const Rest = {
  google: 'index.html',
};

const Action = props => ( <React.Fragment key={props.id}>
  <td>
    <div className={'first-col'}>
      <CancelSimpleButton
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
                  .replace( /__WEBPACK_.*tracker.*\./gi,
                           'tracker.' )}</SyntaxHighlighter>
  </td>
</React.Fragment> );

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
            id={'Report something'}
            onClick={() => {}}
          />
        </tr>
        <tr>
          <Action
            id={'Send REST call and check console print'}
            onClick={() => {
              fetch( Rest.google )
                            .then( ( response ) => {
                              console.log( `response from google was received: ${response}` );
                            } )
                            .catch( error => console.error( error ) );
            }}
          />
        </tr>
      </tbody>
    </table>


  </div>
);

export default Demo;

