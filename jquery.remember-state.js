(function($) {
    if ( ! window.localStorage || ! window.JSON )
      return $.fn.rememberState = function () { return this; }
  var getObject  = function(key) {
    var value = localStorage.getItem( key );
      return value && JSON.parse( value );
  }
  , setObject    = function( key, value ) {
      value && localStorage.setItem( key, JSON.stringify( value ) );
  }
  , removeObject = function( key ) {
      localStorage.removeItem( key );
  };
  $.fn.rememberState = function( defaults ) {
    var opts = $.extend({
          clearOnSubmit: true,
          inputSelector: ':input',
          noticeDialog: (function() {
            var $e = $("<p />", {id: "remember_state"})
                     .html('Do you want to <a href="#">restore your previously entered info</a>?');
            return $e;
          })(),
          objName: false }, defaults);
    var use_ids = !(!!opts.objName);
    if (!("prop" in $.fn)) { $.fn.prop = $.fn.attr; }
    if (opts.noticeDialog.length && typeof opts.noticeDialog === "object") {
      opts.noticeDialog.find("a").bind("click.remember_state", function(e) {
        var data = getObject(opts.objName),
            $f = $(this).closest("form"),
            $e;
        for (var i in data) {
          $e = $f.find(":input[name=\"" + data[i].name + "\"]");
          if ($e.is(":radio, :checkbox")) {
            $e.filter("[value=" + data[i].value + "]").prop("checked", true);
          }
          else if ($e.is("select")) {
            $e.find("[value=" + data[i].value + "]").prop("selected", true);
          }
          else {
            $e.val(data[i].value);
          }
          $.uniform && $.uniform.update && $.uniform.update( $e );
          $e.change();
        }
        opts.noticeDialog.remove();
        e.preventDefault();
      });
    }
    if (this.length > 1) {
      if (console.log) {
        console.log("WARNING: Cannot process more than one form with the same" +
          " object. Attempting to use form IDs instead.");
      }
      use_ids = true;
    }
    return this.each(function() {
      var $form = $(this);
      if (use_ids) {
        if ($form.attr("id")) {
          opts.objName = $form.attr("id");
        }
        else {
          if (console.log) {
            console.log("ERROR: No form ID or object name. Add an ID or pass" +
              " in an object name");
            return this;
          }
        }
      }
      if (getObject(opts.objName)) {
        (opts.noticeDialog.length && typeof opts.noticeDialog === "object") ?
          opts.noticeDialog.prependTo($form) :
          opts.noticeDialog.show();
      }
      $form.bind("reset_state", function() {
        removeObject(opts.objName);
      });
      if (opts.clearOnSubmit) {
        $form.bind("submit.remember_state", function() {
          $(window).unbind( 'unload.remember_state' );
          $(this).trigger("reset_state");
        });
      }
      $(window).bind("unload.remember_state", function() {
        var values = $form.find(opts.inputSelector).serializeArray();
        // jQuery doesn't currently support datetime-local inputs despite a
        // comment by dmethvin stating the contrary:
        // http://bugs.jquery.com/ticket/5667
        // Manually storing input type until jQuery is patched
        $form.find(opts.inputSelector + "[type='datetime-local']").each(function() {
          var $i = $(this);
          values.push({ name: $i.attr("name"), value: $i.val() });
        });
        if ( values.length )
          setObject(opts.objName, values);
      });
      $form.find(":reset").bind("click.remember_state", function() {
        $(this).closest("form").trigger("reset_state");
      });
    });
  };
})(jQuery);