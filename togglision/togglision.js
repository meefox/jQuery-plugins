/**
 * @license Copyright (c) 2012. All rights reserved.
 * @author Yuriy Sinyaev, meefox@gmail.com
 * @name Togglision
 * @version 1.0
 * @todo move static to settings
 * @description add toggler with class swithcing
 **/

;(function($, window, document, undefined) {
    function Togglision(elem, settings) {
        var that = this,
            defaults = {
                elemBase: $(elem),
                states: [],
                actions: [],
                uid: 'Togglision',
                useAsKey: 'a',
                curState: null,
                };
        that.options = $.extend({}, defaults, settings);
        that.init();
    }

    Togglision.prototype = {
        init: function() {
            var that = this,
                o = that.options,
                cookieState;

            $(o.useAsKey, o.elemBase).each(function(index, value){
                var elem = $(value),
                    action = elem.attr('data-action'),
                    state = elem.attr('data-state');

                o.states.push(state);
                o.actions.push(action);

                elem.on('click', function(){
                    that[action](state);
                    o.curState = state;
                    cookieEater.setCookie(o.uid, o.curState, 120);
                });
            });

            cookieState = cookieEater.getCookie(o.uid);

            if(!cookieState) {
                cookieEater.setCookie(o.uid, o.states[0], 120);
                o.curState = o.states[0];

            } else {
                o.curState = cookieState;
            }

            for(var index in o.states){

                if(o.states[index] == o.curState){
                    that[o.actions[index]](o.states[index]);

                    break;
                }
            }

        },
        update: function(settings) {
            var that = this,
                o = this.options;
            o = $.extend({}, o, settings);
        },
        toggleView: function(state){
            var that = this, o = that.options;

            $(".control-group .button[data-state="+o.curState+"]").removeClass("selected");

            switch(state){
                case 'grid':
                    $("#itemsList")
                        .addClass("list-as-tile")
                        .removeClass("list-as-list");
                break;

                case 'list':
                    $("#itemsList")
                        .addClass("list-as-list")
                        .removeClass("list-as-tile");
                break;
            }

            $(".control-group .button[data-state="+state+"]").addClass("selected");
        }
    };

    $.fn.Togglision = function(options){

        return this.each(function () {
            var key = 'Togglision',
                elem = $(this),
                instance = elem.data(key);

            //Create or update
            if( typeof elem.data(key) !== 'object' ) {
                instance = new Togglision(elem, options);
                elem.data(key, instance);

            } else if(options){
                instance['update'](options);
            }
        });
    };
})(jQuery, window, document);