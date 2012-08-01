( function ( $, w ) {
	// Minification & plugin renaming
	var namespace   = 'rememberState'
		, ls        = w.localStorage;
	// Fix for old jQuery
	if ( ! $.fn.prop )
		$.fn.prop = $.fn.attr;
	// Port of Java hashCode simple hash algorithm
	$.hashCode = function ( string ) {
		var hash = 0, length = string.length;
		if ( ! length )
			return hash;
		for ( var index = 0; index < length; index++ ) {
			hash = ( ( hash << 5 ) - hash ) + string.charCodeAt( index );
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	};
	// Filter helpers to save specific inputs
	var filters = $.expr[ ':' ];
	$.extend( filters, {
		// selector of elements having a value (test it against given value when regexp is given between parenthesis i.e. ":val(regexp)")
		val        : function ( elem, i, attr ) {
			return ( attr && attr[ 3 ] ) ? new RegExp( attr[ 3 ] ).test( elem.value ) : !! elem.value;
		}
		// selector of elements having a answer (value for text input & textarea, checked for radio & checkbox, selected for select)
		, answered : function ( elem ) {
			if ( filters.text( elem ) || ( elem.nodeName.toLowerCase() === 'textarea' ) )
				return filters.val( elem );
			return filters.checked( elem ) || filters.selected( elem );
		}
	} );
	// Bogus function if localStorage or JSON not supported
	if ( ! ls || ! w.JSON )
		return $.fn[ namespace ] = function () {
			return this;
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
			if ( ls.getItem( options.storageName ) && options.noticeDialog instanceof $ )
				options.noticeDialog.closest( 'body' ).length ?
					options.noticeDialog.show() :
					options.noticeDialog.prependTo( $form );
			// Set form methods
			$form
				.bind( 'save_state.' + namespace, function ( event, values ) {
					if ( ! values ) {
						var $inputs  = $form.find( options.inputSelector )
							, values = $inputs.serializeArray();
						// jQuery doesn't currently support datetime-local inputs despite a comment by dmethvin stating the contrary:
						// http://bugs.jquery.com/ticket/5667
						// Manually storing input type until jQuery is patched
						$inputs.filter( '[type="datetime-local"]' ).each( function () {
							var $input = $( this );
							values.push( { name: $input.attr( 'name' ), value: $input.val() } );
						} );
					}
					values.length && ls.setItem( options.storageName, JSON.stringify( values ) );
				} )
				.bind( 'restore_state.' + namespace, function () {
					var data = ls.getItem( options.storageName );
					if ( data )
						$.each( JSON.parse( data ), function () {
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
					ls.removeItem( options.storageName );
				} )
				.bind( 'remove_state.' + namespace, function () {
					$form.trigger( 'reset_state.' + namespace )
						.add( $form.find( ':reset' ) )
						.add( w )
						.unbind( '.' + namespace );
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