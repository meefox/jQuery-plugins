/**
 * @license Copyright (c) 2012. All rights reserved.
 * @author Yuriy Sinyaev, meefox@gmail.com
 * @name SidebarToggable
 * @version 0.9
 * @todo Auto-resizer
 * @description advanced sidebar
 **/

 ;(function($, window, document, undefined) {
    function SidebarToggable(elem, settings) {
        var that = this,
        defaults = {
            elem: $(elem),
            state: 'on',
            uid: 'uiSBProd',
            buttonDesign: ''+
            '<a href="javascript:void(0);" id="toggleSidebarButton" class="btn-toggle-sidebar">'+
            '<i class="icon-m"></i>'+
            '</a>',
            timer: null,
        };
        that.options = $.extend({}, defaults, settings);
        that.init();
    }

    SidebarToggable.prototype = {
        init: function() {
            var that = this,
                o = that.options,
                cookieState;

            $('body')
                .append(o.buttonDesign)
                .find('#toggleSidebarButton')
                .on('click.SidebarToggable', function(){
                    that.toggleSidebar();
                });

            cookieState = cookieEater.getCookie(o.uid);

            if(!cookieState){
                cookieEater.setCookie(o.uid, o.state, 120);
            } else {
                o.state = cookieState;
            }

            if(o.state == 'on'){
                that.showSidebar();
            } else {
                that.hideSidebar();
            }

            // Auto resizer
            // o.timer = setTimeout(function(){
            //     that.toggleSidebar();
            // }, 3000);

},
update: function(settings) {
    var that = this,
        o = this.options;

    o = $.extend({}, o, settings);
},
toggleSidebar: function() {
    var that = this, o = that.options;

    if(o.state == 'on'){
        that.hideSidebar();

    } else {
        that.showSidebar();
    }

    cookieEater.setCookie(o.uid, o.state, 120);
},
showSidebar: function(){
    var that = this,
        o = that.options;

    o.state = 'on';

    $('#toggleSidebarButton i')
        .addClass('ico-sidebar-off')
        .removeClass('ico-sidebar-on');
    $('body').removeClass('sidebar-disabled');
},
hideSidebar: function(){
    var that = this,
        o = that.options;

    o.state = 'off';

    $('#toggleSidebarButton i')
        .addClass('ico-sidebar-on')
        .removeClass('ico-sidebar-off');
    $('body').addClass('sidebar-disabled');
}
};

$.fn.SidebarToggable = function(options){

    return this.each(function () {
        var key = 'SidebarToggable',
            elem = $(this),
            instance = elem.data(key);

            //Create or update
            if( typeof elem.data(key) !== 'object' ) {
                instance = new SidebarToggable(elem, options);
                elem.data(key, instance);

            } else if(options){
                instance['update'](options);
            }
        });
};
})(jQuery, window, document);