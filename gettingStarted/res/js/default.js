(function ( window, document, $, undefined ) {
	hljs.initHighlightingOnLoad();

	var $menu = $( ".menu" );

	$( ".header>button" ).on( "click", function () {
		$menu.slideToggle(200);
	});

	$( ".container" ).on( "click", function () {
		$menu.slideUp(200);
	});

	$menu.on( "click", function ( e ) {
		e.stopPropagation();
		$menu.slideUp(200);
	});

})( window, document, jQuery );