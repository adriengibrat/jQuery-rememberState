var storageId     = 'remember_state_test_data'
  , triggerUnload = function () {
    $( window ).trigger( 'unload' );
  }
  , testData      = function ( regExp ) {
    return regExp.test( localStorage.getItem( storageId ) );
  };

$( '#qunit-fixture form' ).rememberState( storageId );

test( 'Requirements', 3, function () {
  ok( $, '$' );
  ok( $.fn.rememberState, '$.fn.rememberState' );
  ok( window.localStorage && typeof localStorage.setItem === 'function', 'localStorage supported' );
} );

module( 'rememberState', {
  setup: function() {
    localStorage.removeItem( storageId );
  }
} );

test( 'It should have no data in localStorage', function () {
  ok( ! localStorage.getItem( storageId ) );
} );

test( 'Value in text field should save state', function () {
  var $form = $( '#qunit-fixture form' );
  $form.find( '#first_name' ).val( 'Shane' );
  triggerUnload();
  ok( testData( /Shane/ ), 'First name saved' );
  $form.find( '#last_name' ).val( 'Riley' );
  ok( ! testData( /Riley/ ), 'Last name not saved');
} );

test( 'Value in radio should save state', function () {
  var $form = $( '#qunit-fixture form' );
  $form.find( '#gender_male' ).prop( 'checked', true );
  var data = triggerUnload();
  ok( testData( /Male/ ), 'Gender saved' );
  $form.find('#gender_female').prop('checked', true );
  ok( ! testData( /Female/ ), 'Gender not saved' );
} );

test( 'Value in select box should save state', function () {
  var $form = $( '#qunit-fixture form' );
  $form.find( '#marital_status option:contains(Married)' ).prop( 'selected', true );
  triggerUnload();
  ok( testData( /Married/ ), 'Marital status saved');
  $form.find( '#marital_status option:contains(Single)' ).prop( 'selected', true );
  ok( ! testData( /Single/ ), 'Marital status not saved');
} );

test( 'Value in checkbox should save state', function () {
  var $form = $( '#qunit-fixture form' );
  $form.find( '[name=video_games]' ).prop( 'checked', true );
  triggerUnload();
  ok( testData( /Video/ ), 'Video games saved' );
  $form.find( '[name=dendrophilia]' ).prop( 'checked', true );
  ok( ! testData( /Dendro/ ), 'Dendrophilia not saved' );
} );

test( 'Multiselects restore state', function () {
  var $form = $( '#qunit-fixture form' ),
      $opts = $form.find( '[multiple] option' );
  $opts.eq( 0 ).prop( 'selected', true );
  $opts.eq( $opts.length - 1 ).prop( 'selected', true );
  triggerUnload();
  ok( testData( /m_w/ ), 'Multiple selected options saved' );
  ok( ! testData( /m_m/ ), 'Not selected option not saved' );
} );

test( 'Value in datetime should save state', function () {
  var $form = $( '#qunit-fixture form' );
  $form.find( '#datetime' ).val( '1901-01-01T06:00:00' );
  triggerUnload();
  ok( testData( /1901-01-01T06:00:00/ ), 'Datetime saved' );
} );

test( 'Value in datetime-local should save state', function () {
  var $form = $( '#qunit-fixture form' );
  $form.find( '#datetime-local' ).val( '1901-01-01T06:00:00-06:00' );
  triggerUnload();
  ok( testData( /1901-01-01T06:00:00-06:00/ ), 'Datetime-local saved' );
} );