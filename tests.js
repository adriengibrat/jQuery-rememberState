$( function () {

	var storageId       = 'remember_state_test_data'
		, form          = $( '#qunit-fixture form' )
		, triggerUnload = function () {
			$( window ).trigger( 'unload' );
		}
		, testData      = function ( regExp ) {
			return regExp.test( localStorage.getItem( storageId ) );
		};

	test( 'Requirements', 5, function () {
		ok( $, 'jQuery as $' );
		ok( $.fn.rememberState, 'jQuery rememberState' );
		ok( window.localStorage, 'localStorage supported' );
		ok( window.JSON, 'JSON supported' );
		localStorage.removeItem( storageId );
		ok( ! localStorage.getItem( storageId ), 'No data in localStorage' );
	} );

	module( 'RememberState (saving values)', {
		setup: function() {
			form.rememberState( storageId );
		},
		teardown: function() {
			form.trigger( 'remove_state' );
		}
	} );

	test( 'Value in text field should save state', function () {
		form.find( '#first_name' ).val( 'Shane' );
		triggerUnload();
		ok( testData( /Shane/ ), 'First name saved' );
		form.find( '#last_name' ).val( 'Riley' );
		ok( ! testData( /Riley/ ), 'Last name not saved');
	} );

	test( 'Value in radio should save state', function () {
		form.find( '#gender_male' ).prop( 'checked', true );
		triggerUnload();
		ok( testData( /Male/ ), 'Gender saved' );
		form.find('#gender_female').prop('checked', true );
		ok( ! testData( /Female/ ), 'Gender not saved' );
	} );

	test( 'Value in select box should save state', function () {
		form.find( '#marital_status option:contains(Married)' ).prop( 'selected', true );
		triggerUnload();
		ok( testData( /Married/ ), 'Marital status saved');
		form.find( '#marital_status option:contains(Single)' ).prop( 'selected', true );
		ok( ! testData( /Single/ ), 'Marital status not saved');
	} );

	test( 'Value in checkbox should save state', function () {
		form.find( '[name=video_games]' ).prop( 'checked', true );
		triggerUnload();
		ok( testData( /Video/ ), 'Video games saved' );
		form.find( '[name=dendrophilia]' ).prop( 'checked', true );
		ok( ! testData( /Dendro/ ), 'Dendrophilia not saved' );
	} );

	test( 'Multiselects restore state', function () {
		var opts = form.find( '[multiple] option' );
		opts.eq( 0 ).prop( 'selected', true );
		opts.eq( opts.length - 1 ).prop( 'selected', true );
		triggerUnload();
		ok( testData( /m_w/ ), 'Multiple selected options saved' );
		ok( ! testData( /m_m/ ), 'Not selected option not saved' );
	} );

	test( 'Value in datetime should save state', function () {
		form.find( '#datetime' ).val( '1901-01-01T06:00:00' );
		triggerUnload();
		ok( testData( /1901-01-01T06:00:00/ ), 'Datetime saved' );
	} );

	test( 'Value in datetime-local should save state', function () {
		form.find( '#datetime-local' ).val( '1901-01-01T06:00:00-06:00' );
		triggerUnload();
		ok( testData( /1901-01-01T06:00:00-06:00/ ), 'Datetime-local saved' );
	} );

} );
