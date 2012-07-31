( function ( $, w ) {
	// Minification & plugin renaming
	var namespace = 'rememberState';
	// Bogus function if not supported
	if ( ! w.localStorage || ! w.JSON )
		return $.fn[ namespace ] = function () {
			return this;
		};
	// localStorage helpers
	var ls = w.localStorage
	, getObject    = function ( key ) {
		var value = ls.getItem( key );
		return value && JSON.parse( value );
	}
	, setObject    = function ( key, value ) {
		value && ls.setItem( key, JSON.stringify( value ) );
	}
	, removeObject = function ( key ) {
		ls.removeItem( key );
	};
	// Fix for old jQuery
	if ( ! 'prop' in $.fn )
		$.fn.prop = $.fn.attr;
	// Port of Java hashCode simple hash algorithm
	$.hashCode = function ( string ) {
		var hash = 0;
		if ( ! string.length )
			return hash;
		for ( var length = string.length, index = 0; index < length; index++ ) {
			hash = ( ( hash << 5 ) - hash ) + string.charCodeAt( index );
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	};
	// Remember state plugin
	$.fn[ namespace ] = function( settings ) {
		// Set options
		var options  = $.extend( {
					clearOnSubmit   : true
					, inputSelector : ':input'
					, noticeDialog  : ( function () {
						return $( '<p/>', { className: namespace } ).html( 'Do you want to <a href="#">restore your previously entered info</a>?' );
					} )()
					, storageName   : false
				}, $.type( settings ) == 'string' ? { storageName : settings } : settings )
			, autoName = this.length > 1 ? true : ! options.storageName
			, self     = this;
		// Prepare notice dialog
		if ( options.noticeDialog instanceof $ )
			options.noticeDialog
				.find( 'a' )
				.bind( 'click.' + namespace, function ( event ) {
					$( this ).closest( 'form' ).trigger( 'restore_state' );
					options.noticeDialog.remove();
					event.preventDefault();
				} );
		// Iterate selection
		return self.each( function () {
			var $form = $( this );
			// Only forms
			if ( ! $form.is( 'form' ) )
				return;
			// Fix storage name
			if ( autoName )
				options.storageName = $form.attr( 'id' ) || $.hashCode( [ $form.attr( 'action' ), self.index( this ) ].join( '|' ) );
			// Show notice
			if ( getObject( options.storageName ) && options.noticeDialog instanceof $ )
				options.noticeDialog.closest( 'body' ).length ?
					options.noticeDialog.show() :
					options.noticeDialog.prependTo( $form );
			// Set form methods
			$form
				.bind( 'save_state.' + namespace, function ( event, values ) {
					if ( ! values ) {
						var $inputs = $form.find( options.inputSelector )
							, values  = $inputs.serializeArray();
						// jQuery doesn't currently support datetime-local inputs despite a comment by dmethvin stating the contrary:
						// http://bugs.jquery.com/ticket/5667
						// Manually storing input type until jQuery is patched
						$inputs.filter( '[type="datetime-local"]' ).each( function () {
							var $input = $( this );
							values.push( { name: $input.attr( 'name' ), value: $input.val() } );
						} );
					}
					values.length && setObject( options.storageName, values );
				} )
				.bind( 'restore_state.' + namespace, function () {
					$.each( getObject( options.storageName ), function () {
						var $element = $form.find( ':input[name="' + this.name + '"]' );
						if ( $element.is( ':radio, :checkbox' ) )
							$element.filter( '[value="' + this.value + '"]' ).prop( 'checked', true );
						else if ( $element.is( 'select' ) )
							$element.find( '[value="' + this.value + '"]' ).prop( 'selected', true );
						else
							$element.val( this.value );
						$element.change();
					} );
				} )
				.bind( 'reset_state.' + namespace, function () {
					removeObject( options.storageName );
				} )
				.bind( 'submit.' + namespace, options.clearOnSubmit ? function () {
					$( w ).unbind( 'unload.' + namespace );
					$form.trigger( 'reset_state.' + namespace );
				} : null );
			// Save form method
			$ ( w ).bind( 'unload.' + namespace, function () {
				$form.trigger( 'save_state.' + namespace );
			} );
			// Reset form buttons
			$form.find( ':reset' ).bind( 'click.' + namespace, function () {
				$form.trigger( 'reset_state.' + namespace );
			} );
		} );
	};
} )( jQuery, window );