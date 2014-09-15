/**
 * @license Copyright (c) 2013. All rights reserved.
 * @author Yuriy Sinyaev, meefox@gmail.com
 * @name Gelerision
 * @version 0.9
 * @todo Mouse-zoomer, static to settings
 * @description Gallery with zooming and panning
 **/

;(function($, window, document, undefined) {
    function Gelerision(elem, settings) {
        var that = this,
            defaults = {
                elem: $(elem),
                screenElem: null,
                images:[],
                curImage: 0,
                mode: 'gallery-compact',
                timer: null,
                thumbWidth: 0,
                windowWidth: 0,
                stripWidth: 0,
            };
        that.options = $.extend({}, defaults, settings);
        that.init();
    }

    Gelerision.prototype = {
        init: function() {
            var that = this,
                o = that.options;

            //Calculation
            $.each( $('.img-m', '#galleryThumbs'), function(index, value){
                var $value = $(value);
                o.images.push({
                    s: $value.attr('src'),
                    m: $value.attr('data-medium'),
                    l: $value.attr('data-big')
                });
            });
            o.thumbWidth = $('.thumb-item').width() + 4;
            o.stripWidth = o.images.length * o.thumbWidth - 4;

            //Init events
            $(window).on('resize.Gelerision', function(){
                that.updateWidth();
            });
            $(document).on('keyup.Gelerision', function(e){
                switch (e.keyCode){
                    //Left arrow
                    case 37:
                        e.preventDefault();
                        that.prevImage();
                    break;

                    //Right arrow
                    case 39:
                        e.preventDefault();
                        that.nextImage();
                    break;

                    //Escape
                    case 27:
                        if(o.mode == 'gallery-full') {
                            e.preventDefault();
                            that.toggleMode();
                            that.switchImage(o.curImage);
                        }
                    break;
                }
            });
            $('#gallery').on('mousemove.Gelerision', function(){
                that.wakeUp();
            });
            $('.thumb-item', '#galleryThumbs').on('click', function(e){
                e.preventDefault();
                var imgIndex = $(this).attr('data-index');
                that.switchImage(imgIndex);
            });
            $('#prevImageButton', o.elem).on('click.Gelerision', function(){
                that.prevImage();
            });
            $('#nextImageButton', o.elem).on('click.Gelerision', function(){
                that.nextImage();
            });
            $('#galleryScreen', o.elem).on('click.Gelerision', function(e){
                if(e.target.nodeName.toUpperCase() == 'IMG')
                    that.toggleMode();
            });

            /*
            // Zoomer draft
            $('#imageMedium')
                .on('mousemove', function(event){
                    that.mouseZoomer(event);
                })
                .on('mouseover', function(event){
                    $('#imageFull').show();
                })
                .on('mouseout', function(event){
                    $('#imageFull').hide();
                });
            */

            //Update UI
            $('body').addClass(o.mode);
            $('#thumbsList').css({ width: o.stripWidth });

            that.updateWidth();
            that.switchImage(o.curImage);

        },
        update: function(settings) {
            var that = this,
                o = this.options;
            o = $.extend({}, o, settings);
        },
        updateWidth: function(){
            var that = this, o = this.options;
            o.windowWidth = $('#galleryThumbs').width();
        },
        prevImage: function(imgIndex){
            var that = this,
                o = this.options;

            imgIndex = o.curImage;
            imgIndex --;

            if(imgIndex < 0)
                imgIndex = o.images.length - 1;

            that.switchImage(imgIndex);
        },
        nextImage: function(imgIndex){
            var that = this,
                o = this.options;

            imgIndex = o.curImage;
            imgIndex ++;

            if(imgIndex > o.images.length - 1)
                imgIndex = 0;

            that.switchImage(imgIndex);
        },
        switchImage: function(imgIndex){
            var that = this,
                o = this.options,
                imagePath,
                $imageMedium = $('#imageMedium', '#galleryScreen');

            var bigImage = new Image();

            //Remove old image
            $('#thumb-'+o.curImage, '#galleryThumbs').removeClass('selected');

            //Set a new image
            o.curImage = imgIndex;
            $('#thumb-'+o.curImage).addClass('selected');

            if(o.mode == 'gallery-compact' && o.images[o.curImage].l){
                imagePath = o.images[o.curImage].m;
            } else {
                imagePath = o.images[o.curImage].l;
            }

            $imageMedium.attr('src', imagePath);

            bigImage.src = imagePath;
            bigImage.onload = function() {
                var height = bigImage.height;
                var width = bigImage.width;

                if(width > height) {
                    $imageMedium.width('100%');
                    $imageMedium.height('auto');
                } else {
                    $imageMedium.width('auto');
                    $imageMedium.height('100%');
                }
            };

            //Scroll move
            var scrollMove = (o.thumbWidth * o.curImage) - (o.windowWidth / 2) + (o.thumbWidth / 2);
            $('#galleryThumbs').scrollLeft(scrollMove);
        },
        toggleMode: function(){
            var that = this, o = this.options;

            $('body').removeClass(o.mode);

            if(o.mode == 'gallery-compact'){
                o.mode = 'gallery-full';

            } else {
                //Default mode
                o.mode = 'gallery-compact';
            }

            $('body').addClass(o.mode);

            that.updateWidth();
            that.switchImage(o.curImage);
        },
        wakeUp: function(){
            var that = this, o = this.options;
            var $gallery = $('#gallery');

            $gallery
                .removeClass('idle')
                .off('mousemove.Gelerision');

            clearTimeout(o.timer);
            o.timer = setTimeout(function(){
                $gallery
                    .addClass('idle')
                    .on('mousemove.Gelerision', function(){
                        that.wakeUp();
                    });

            }, 10000);
        }
        /*
        // Zoomer draft
        ,
        mouseZoomer: function(e){
            var that = this, o = this.options;

            //clearTimeout(o.timer);
            //o.timer = setTimeout( function(){
                var elemPrev = $('#imageMedium');
                var prevW = elemPrev.width();
                var prevH = elemPrev.height();

                var elemBig = $('#imageFull');
                var bigW = elemBig.width();
                var bigH = elemBig.height();

                var percentX = Math.ceil((e.pageX - elemPrev.offset().left) / prevW * 100);
                var percentY = Math.ceil((e.pageY - elemPrev.offset().top) / prevH * 100);

                var posX = (bigW - prevW) / 100 * percentX;
                var posY = (bigH - prevH) / 100 * percentY;

                //show window
                //$('#imageFull').stop(true, false).animate({'left': -posX, 'top': -posY});
                $('#imageFull').css({'left': -posX, 'top': -posY});
                //console.log('->', -posX, percentX+"% :", -posY, percentY+"%");
            //}, 300);
        }
        */
    };

    $.fn.Gelerision = function(options){

        return this.each(function () {
            var key = 'Gelerision',
                elem = $(this),
                instance = elem.data(key);

            //Create or update
            if( typeof elem.data(key) !== 'object' ) {
                instance = new Gelerision(elem, options);
                elem.data(key, instance);

            } else if(options){
                instance['update'](options);
            }
        });
    };
})(jQuery, window, document);