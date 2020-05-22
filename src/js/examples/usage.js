import { tracker } from '@impervaos/google-analytics-spa';

function myComplicatedAction() {
    try {
        performSomeComplicatedAction();
    } catch(e) {
        //in case of an error we report it to google analytics
        tracker().reportException(e.message, false);
        return;
    }

    tracker().reportEvent( 'MY_CATEGORY', 'MY_ACTION_PERFORMED', 'my_label_text', 0 );
}

//manual page view reporting (i.e. reporting that navigation was done to page http://page.com/first)
tracker().reportPage( 'my site title', 'http://page.com/first' );

//navigating to another page in the application
// @impervaos/google-analytics-spa will report navigation to page called '/virtual/path' automatically instead of reporting navigation to '/test/path'
history.push( '/test/path', gaBuildPageViewState( 'TITLE', '/virtual/path', true ) );
