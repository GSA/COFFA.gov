// Add your custom javascript here
//console.log("Hi from Federalist");
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// jQuery( document ).ready(function($) );
jQuery(document).ready(function ($) {
    $(function () {
        $("#tabs").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
        $("#tabs li").removeClass("ui-corner-top").addClass("ui-corner-left");
    })
});

window.addEventListener('pageshow', function(event) {
    var currentURL = window.location.href;
    var urlsToCheck = [
        '/federal-financial-assistance',
        '/federal-financial-reporting',
        '/workforce-modernization',
        '/major-legislation',
        '/uniform-guidance-coffa',
        '/training-coffa/'
    ];

    var shouldReload = urlsToCheck.some(function(url) {
        return currentURL.includes(url);
    });

    if (event.persisted && shouldReload) {
        window.location.reload();
    }
});

$('#return-top').on('click', function (e) {
    e.preventDefault();
    $([document.documentElement, document.body]).animate({
        scrollTop: 0
    }, 200, function() {
        document.body.setAttribute('tabindex', '-1');
        document.body.focus();
    });
    return false;
});
