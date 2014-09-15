/**
 * @license Copyright (c) 2012. All rights reserved.
 * @author Yuriy Sinyaev, meefox@gmail.com
 * @name Slidision
 * @version 1.0
 * @todo move static to settings
 * @description slides player
 **/

;(function($, window, document, undefined) {
    function Slidision(elem, settings) {
        var that = this,
            defaults = {
                elemBase: $(elem),
                menus: [],
                slides: [],
                curSlide: 0,
                totalSlides: null,
                showTime: 10000,
                timer: null,
                };
        that.options = $.extend({}, defaults, settings);
        that.init();
    }

    Slidision.prototype = {
        init: function() {
            var that = this,
                o = that.options;

            o.elemBase
                .on('mouseover', function(){
                    that.pause();
                })
                .on('mouseout', function(){
                    that.play();
                });

            $('.sln-image', o.elemBase).each(function(index, value){
                o.slides.push( $(value) );
            });

            $('.sln-switcher a', o.elemBase).each(function(index, value){
                o.menus.push( $(value) );
            });

            $('a', '.sln-switcher').on('click', function(event){
                event.preventDefault();
                that.changeImage( parseInt($(this).attr('data-image'),10));
            });

            o.totalSlides = o.slides.length;

            that.play();
        },
        update: function(settings) {
            var that = this, o = this.options;
            o = $.extend({}, o, settings);
        },
        changeImage: function(image){
            var that = this, o = this.options;

            o.menus[o.curSlide].removeClass('selected');
            o.slides[o.curSlide].removeClass('selected');

            o.curSlide = image;

            o.menus[o.curSlide].addClass('selected');
            o.slides[o.curSlide].addClass('selected');
        },
        pause: function(){
            var that = this, o = this.options;
            clearInterval(o.timer);
        },
        play: function(){
            var that = this, o = this.options,
                newSlide;

            o.timer = setInterval(function(){
                newSlide = (o.curSlide < o.totalSlides - 1) ? o.curSlide + 1 : 0;
                that.changeImage(parseInt(newSlide, 10));
            }, o.showTime);
        }
    };

    $.fn.Slidision = function(options){
        return this.each(function () {
            var key = 'Slidision',
                elem = $(this),
                instance = elem.data(key);

            //Create or update
            if( typeof elem.data(key) !== 'object' ) {
                instance = new Slidision(elem, options);
                elem.data(key, instance);

            } else if(options){
                instance['update'](options);
            }
        });
    };
})(jQuery, window, document);