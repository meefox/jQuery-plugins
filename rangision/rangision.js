/**
 * @license Copyright (c) 2013. All rights reserved.
 * @author Yuriy Sinyaev, meefox@gmail.com
 * @name Rangision
 * @version 0.9
 * @todo Auto-update, Sidebar click
 * @description Two thumbs sidebar for custom data ranges
 **/

;(function($, window, document, undefined){
    function Rangision(elem, settings){
        var that = this,
            defaults = {
                sliderElem: elem,
                sendURL: null,
                sliderSize: {start:0, end:0, width:0},
                positions: {from:0, to:0},
                values: {from:null, to:null, start:0, end:0, range:0},
                thumbElem: {from:null, to:null},
                inputElem: {from:$('.price-from', elem), to:$('.price-to', elem)},
                thumbSize:{ width:0, half:0},
                highlightElem: null,
                space: 2,
            };
        that.options = $.extend({}, defaults, settings);
        that.init();
    }
    Rangision.prototype = {
        init: function(){
            var that = this,
                o = this.options,
                view = '\
                        <div class="slider" onselectstart="return false;">\
                            <div class="slider-thumb thumb-l"></div>\
                            <div class="slider-thumb thumb-r"></div>\
                            <div class="slider-highlight"></div>\
                        </div>';

            //Render
            o.sliderElem
                .prepend(view)
                    .children(".slider")
                    .on('click', function(){ that.sliderClickHandler(event); });

            $(window).on('resize.Gelerision', function(){
                that.refresh();
            });

            //Set properties
            o.highlightElem = o.sliderElem.find('.slider-highlight');
            o.thumbElem.from = o.sliderElem.find('.thumb-l');
            o.thumbElem.to = o.sliderElem.find('.thumb-r');
            o.thumbSize.width = o.thumbElem.from.width();
            o.thumbSize.half = o.thumbSize.width / 2;
            o.sliderSize.width = o.sliderElem.find('.slider').width();
            o.sliderSize.end = o.sliderSize.width - o.thumbSize.width;

            o.values.from = o.values.from === undefined ? o.values.start : o.values.from;
            o.values.to = o.values.to === undefined ? o.values.end : o.values.end;
            o.values.range = o.values.end - o.values.start;

            o.positions.from = 0;
            o.positions.to = o.sliderSize.end;


            //Add events
            o.thumbElem.from.on('mousedown.Rangision touchstart.Rangision', function(event){
                event.preventDefault();
                that.thumbDownHandler(event, $(this));
            });
            o.thumbElem.to.on('mousedown.Rangision touchstart.Rangision', function(event){
                event.preventDefault();
                that.thumbDownHandler(event, $(this));
            });
            o.inputElem.from.on('keyup.Rangision', function(event){
                event.preventDefault();
                that.keyUpHandler(event);
            });
            o.inputElem.to.on('keyup.Rangision', function(event){
                event.preventDefault();
                that.keyUpHandler(event);
            });

            //Update UI
            that.updateThumbs();
            that.updateInputs();
            that.updateHighlight();
        },
        thumbDownHandler: function(event, elem){
            var that = this;
            $('body')
                .addClass('dragging')
                .attr('onselectstart','return false;')
                .on('mousemove.Rangision touchmove.Rangision', function(event){
                    that.thumbMoveHandler(event, elem );
                })
                .on('mouseup.Rangision mouseleave.Rangision touchend.Rangision touchleave.Rangision', function(event){
                    that.thumbUpHandler(event, elem );
                });
            $('input').attr('onselectstart','return false;').addClass('dragging');
        },
        thumbMoveHandler: function(event, elem){
            var that = this,
                o = this.options,
                limit,
                percent,
                value,
                position;

            if(event.type == 'mousemove'){
                position = (event.pageX - o.sliderElem.offset().left) - o.thumbSize.half;

            } else {
                // touchmove
                position = (event.originalEvent.targetTouches[0].pageX - o.sliderElem.offset().left) - o.thumbSize.half;
            }

            //Limit movement inside a slider
            if(position > o.sliderSize.end)
                position = o.sliderSize.end;
            if(position < 0)
                position = 0;

            //Move left or right thumbs
            if(elem.hasClass('thumb-l')){
                //Left thumb limit
                limit = o.positions.to - o.thumbSize.width - o.space;

                if(position > limit)
                    position = limit;

                percent = position / (limit / 100);
                value = Math.round( ( ((o.values.to - o.values.start) * 0.01) * percent ) + o.values.start);

                o.positions.from = position;
                o.inputElem.from.val(value);
                o.values.from = value;

            } else {
                //Right thumb limt
                limit = o.positions.from + o.thumbSize.width + o.space;

                if(position < limit)
                    position = limit;

                percent = (position - limit) / ((o.sliderSize.end - limit) * 0.01);
                value = Math.round( (((o.values.end - o.values.from) / 100) * percent) + o.values.from );

                o.positions.to = position;
                o.inputElem.to.val(value);
                o.values.to = value;
            }
            elem.css({ 'left': position });
            that.updateHighlight();
        },
        thumbUpHandler: function(event, elem){
            var that = this;
            $('body')
                .off('mouseup.Rangision mouseleave.Rangision touchend.Rangision touchleave.Rangision')
                .off('mousemove.Rangision touchmove.Rangision')
                .removeClass('dragging')
                .removeAttr('onselectstart');
            $('input').removeAttr('onselectstart').removeClass('dragging');

            that.sendData();
        },
        sliderClickHandler: function(event){
            var that = this,
                o = this.options;
            //TODO: finish slide thumb method
        },
        keyUpHandler: function(event){
            var that = this;

            setTimeout(function(){
                var elem = $(event.target);
                that.changeInput(elem, elem.val());
            }, 300);
        },
        changeInput: function(elem, val){
            //Init
            var that = this,
                o = this.options,
                value = val,
                percent,
                limit;

            // Remove any non-digit characters
            value = value.replace(/\D/g, '');

            percent = (value - o.values.start) / (o.values.range * 0.01);

            //If percent out off limit
            if(percent < 0){
                percent = 0;
            } else if(percent > 100){
                percent = 100;
            }

            //Move thumb
            if(elem.hasClass('price-from')){
                o.positions.from = Math.round((o.sliderSize.end * 0.01) * percent);

                if(o.positions.from >= o.positions.to){
                    limit = o.positions.to - o.thumbSize.width - o.space;

                    //TODO: move min with max
                    if(o.positions.from > limit){

                        o.positions.from = limit;
                    } else {
                        o.positions.from = limit;
                    }
                }
                //Value not more than max limit
                if(value > o.values.to){
                    value = o.values.to;
                    //elem.val(value);
                }
                o.values.from = parseInt(value, 10);
            } else {
                o.positions.to = Math.round( (o.sliderSize.end * 0.01) * percent);

                if(o.positions.to <= o.positions.from){
                    limit = o.positions.from + o.thumbSize.width + o.space;

                    //TODO: move max with min
                    if(o.positions.to < limit){

                        o.positions.to = limit;
                    } else {
                        o.positions.to = limit;
                    }
                }

                //Value not more than max limit
                if(value < o.values.from){
                    value = o.values.from;
                }
                o.values.to = parseInt(value, 10);
            }

            that.updateThumbs();
            that.updateHighlight();
        },
        updateThumbs: function(){
            var o = this.options;
            o.thumbElem.from.css({'left': o.positions.from});
            o.thumbElem.to.css({'left': o.positions.to});
        },
        updateHighlight: function(){
            var o = this.options;
            o.highlightElem.css({
                'left': o.positions.from + o.thumbSize.half,
                'width': (o.sliderSize.width - o.positions.from) - (o.sliderSize.width - o.positions.to)
            });
        },
        updateInputs:function(){
            var o = this.options;
            console.log(o.values.from);
            o.inputElem.from.val(o.values.from);
            o.inputElem.to.val(o.values.to);
        },
        sendData:function(){
            //Send data to server
            //console.log('send: ',this.options.values);
        },
        refresh: function(settings){
            //TODO: finish refresh method, save position durring resizing
            var that = this,
                o = this.options;


            //Update UI
            that.updateThumbs();
            that.updateHighlight();
            that.updateInputs();
        }
    };

    $.fn.Rangision = function(method, options){
        return this.each(function () {
            var key = 'rangision',
                elem = $(this),
                instance;

            //Create or update
            if ( (typeof method === 'string' || typeof method === 'object') && typeof elem.data(key) === 'object'){
                instance = elem.data(key);
                //Autoupdate
                if ( typeof method === 'object' ) {
                    instance['refresh'](method);
                //Call method
                } else if ( typeof instance[method] === 'function' ){
                    instance[method](options);
                }
            //Create object
            } else if ( typeof method === 'object') {
                options = method;
                if( typeof elem.data(key) !== 'object' ) {
                    instance = new Rangision(elem, options);
                    elem.data(key, instance);
                }
            }
        });
    };
})(jQuery, window, document);