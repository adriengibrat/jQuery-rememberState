var o             = {
    storageName: 'remember_state_test_data'
  }
  ,  setup        = function() {
    return $( '#qunit-fixture form' ).rememberState( o );
  }
  , triggerUnload = function () {
    $( window ).trigger( 'unload' );
  }
  , ls            = window.localStorage
  , getObject     = function ( key ) {
    var value = ls.getItem( key );
    return value && JSON.parse( value );
  }
  , setObject     = function ( key, value ) {
    value && ls.setItem( key, JSON.stringify( value ) );
  }
  , removeObject  = function ( key ) {
    ls.removeItem( key );
  };

test( 'Requirements', 3, function () {
  ok( $, '$' );
  ok( $.fn.rememberState, '$.fn.rememberState' );
  ok( ls && (typeof ls.setItem === 'function'), 'localStorage supported' );
} );

module( 'rememberState', {
  setup: function() {
    delete removeObject( o.objName );
  }
} );

test( 'It should have no data in localStorage', function () {
  ok( ! getObject( o.objName ) );
} );

test( 'Value in text field should save state', function () {
  var $form = setup();
  $form.find( '#first_name' ).val( 'Shane' );
  triggerUnload();
  ok( /Shane/.test( getObject(o.objName).first_name.value ), 'First name saved' );
  $form.find( '#last_name' ).val( 'Riley' );
  ok( ! /Riley/.test( getObject(o.objName).last_name.value ), 'Last name not saved');
} );

test( 'Value in radio should save state', function () {
  var $form = setup();
  $form.find( '#gender_male' ).prop( 'checked', true );
  triggerUnload();
  ok( /Male/.test( getObject( o.objName ).gender.value ), 'Gender saved' );
  $form.find('#gender_female').prop('checked', true );
  ok( ! /Female/.test( getObject( o.objName ).gender.value ), 'Gender not saved' );
} );

test( 'Value in select box should save state', function () {
  var $form = setup();
  $form.find( '#marital_status option:contains(Married)' ).prop( 'selected', true );
  triggerUnload();
  ok( /Married/.test( ls.getItem( o.objName ) ), 'Marital status saved');
  $form.find( '#marital_status option:contains(Single)' ).prop( 'selected', true );
  ok( ! /Single/.test( ls.getItem( o.objName ) ), 'Marital status not saved');
} );

test( 'Value in checkbox should save state', function () {
  var $form = setup();
  $form.find( '[name=video_games]' ).prop( 'checked', true );
  triggerUnload();
  ok( /Video/.test( ls.getItem( o.objName ) ), 'Video games saved' );
  $form.find( '[name=dendrophilia]' ).prop( 'checked', true );
  ok( ! /Dendro/.test( ls.getItem( o.objName ) ), 'Dendrophilia not saved' );
} );

test( 'Multiselects restore state', function () {
  var $form = setup(),
      $opts = $form.find( '[multiple] option' );
  $opts.eq( 0 ).prop( 'selected', true );
  $opts.eq( $opts.length - 1 ).prop( 'selected', true );
  triggerUnload();
  ok( /m_w/.test( ls.getItem( o.objName ) ), 'Multiple selected options saved' );
  ok( ! /m_m/.test( ls.getItem( o.objName ) ), 'Not selected option not saved' );
} );

test( 'Value in datetime should save state', function () {
  var $form = setup();
  $form.find( '#datetime' ).val( '1901-01-01T06:00:00' );
  triggerUnload();
  ok( /1901-01-01T06:00:00/.test( ls.getItem( o.objName ) ), 'Datetime saved' );
} );

test( 'Value in datetime-local should save state', function () {
  var $form = setup();
  $form.find( '#datetime-local' ).val( '1901-01-01T06:00:00-06:00' );
  triggerUnload();
  ok( /1901-01-01T06:00:00-06:00/.test( ls.getItem( o.objName ) ), 'Datetime-local saved' );
} );