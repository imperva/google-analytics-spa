import React from 'react';
import { SimpleButton } from '@imperva/buttons';
import { tracker, init as gaInit } from './components/GoogleAnalytics/GoogleAnalytics';

gaInit( 'UA-17432465-11', '0' );

const Demo = () => (
  <div className="demo">
    <SimpleButton type="primary alternative" title="Report ACTION-1" onClick={tracker.gaReportAction( 'GA-DEMO', 'ACTION-1', 'DEVELOPMENT', 1 )} />

  </div>
);


export default Demo;

