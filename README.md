# jQuery form remember state plugin

## Version: 1.5 (aka 1.1 modified by Adrien Gibrat)

When called on a form element, localStorage is used to remember the values that have been input up to the point of either saving or unloading. (closing window, navigating away, etc.)
If localStorage / JSON isn't available, nothing is bound or stored.

By default, the plugin appends an element with a class of remember_state within the form to show a note indicating there is stored data that can be repopulated by clicking on the anchor within the remember_state container. You can customize the container in the options object you pass to the plugin.

### Options
```javascript
  clearOnSubmit : true // Removes localStorage object when form submitted. Default is true
  noticeDialog  : $( '<div />' ).html( '<a href="#">Restore</a>' ) // An HTML element to represent the notice box prepended to the form. Must include an anchor for the user to choose to restore state. You can pass an element already in the DOM: $( 'div.myWarning' )
  storageName   : 'unique_storage_name' // Specify a name for the localStorage object. If none is supplied, the form's ID will be used or if no ID is available, the plugin will generate an hash build from form action attribute and it's index in the jQuery selection.
```
### Usage

  $( 'form' ).rememberState();

  $( 'form' ).rememberState( 'my_unique_storage_name' );

  $( '#unique_storage_name' ).rememberState( {
	  clearOnSubmit  : false
	  , noticeDialog : $( 'div.myWarning' )
  } );

### Notes

To trigger the deletion of a form's localStorage object from outside the plugin, trigger the reset_state event on the form element by using $( 'form' ).trigger( 'reset_state' );