// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

define(['jquery'], function($) {
    "use strict";

    function getSides($elem, $slider) {
        var left = -2;
        var right = $elem.outerWidth() - $slider.outerWidth() + 2;
        var center = right / 2 + left;
        return {left: left, right: right, center: center};
    }

    var methods = {
        init: function() {
            return this.each(function() {
                var $elem = $(this);
                var $slider = $('<span>', {'class': 'slider not-dragging'});
                $slider.append($('<span>', {'class': 'handle'}));
                var data = $elem.data('switch');
                if (!data) {
                    data = {};
                    data.activated = undefined;
                    data.customized = null;
                    $elem.data('switch', data);
                }

                function mouseup(e) {
                    $slider.addClass('not-dragging');
                    $(document).off('mousemove.slider').off('mouseup.slider');
                    var s = getSides($elem, $slider);
                    var x = e.pageX - data.initialPageX + data.initialLeft;
                    var newActivated = x >= s.center;
                    methods.activate.call($elem, newActivated);
                    return false;
                }

                function mousemove(e) {
                    var s = getSides($elem, $slider);
                    var x = e.pageX - data.initialPageX + data.initialLeft;
                    if (x < s.left)  x = s.left;
                    if (x > s.right) x = s.right;

                    $slider.css('left', x);
                    return false;
                }

                var contents = $elem.text();
                $elem.text('');

                var classNames = $elem.attr('class');
                var activated = $elem.hasClass('activated');

                $elem
                    .removeClass()
                    .addClass('_gnome-switch')
                    .append($('<span>', {'class': 'on'}).text("ON"))
                    .append($('<span>', {'class': 'off'}).text("OFF"))
                    .append($('<span>', {'class': 'custom-content'}))
                    .append($slider)

                // Disable selection.
                    .css({'cursor': 'default',
                          '-moz-user-select': 'none'})
                    .attr('unselectable', 'on')
                    .on('selectstart', function() { return false; });

                if (contents)
                    methods.customize.call($elem, contents, classNames);
                methods.activate.call($elem, activated);

                $slider.on('mousedown', function(e) {
                    data.initialActivated = data.activated;
                    data.initialPageX = e.pageX;
                    var left = $slider.position().left;
                    data.initialLeft = left;
                    $slider.css({'position': 'absolute', 'left': left});
                    $slider.removeClass('not-dragging');
                    $(document).on({
                        'mousemove.slider': mousemove,
                        'mouseup.slider': mouseup
                    });
                    return false;
                });

                $elem.on('click', function(e) {
                    var doToggle;
                    var isActivated = !!data.activated;

                    if (data.customized !== null)
                        return true;

                    if (data.initialPageX === undefined) {
                        doToggle = true;
                    } else {
                        // Make sure we didn't drag before toggling.
                        var travelDistance = Math.abs(e.pageX - data.initialPageX);
                        doToggle = travelDistance < 4 && isActivated === data.initialActivated;

                        delete data.initialActivated;
                        delete data.initialPageX;
                        delete data.initialLeft;
                    }

                    if (doToggle)
                        methods.activate.call($elem, !isActivated);

                    e.stopImmediatePropagation();
                    return false;
                });
            });
        },

        activate: function(value) {
            return this.each(function() {
                var $elem = $(this);

                var data = $elem.data('switch');

                var $slider = $elem.find('span.slider');
                var s = getSides($elem, $slider);
                $slider.css('left', value ? s.right : s.left);

                if (data.activated === value)
                    return;

                data.activated = value;

                $elem.trigger('changed', value);
                $elem.toggleClass('activated', value);
            });
        },

        customize: function(label, styleClass) {
            return this.each(function() {
                var $elem = $(this);
                var $customContent = $elem.find('.custom-content');

                var data = $elem.data('switch');
                var customized = !!label || !!styleClass;

                if (data.customized) {
                    $customContent.text('').removeClass(data.customized.styleClass);
                    $elem.removeClass('customized').removeClass(data.customized.styleClass);
                    data.customized = null;
                }

                if (customized) {
                    $customContent.text(label).addClass(styleClass);
                    $elem.addClass('customized').addClass(styleClass);
                    data.customized = { label: label, styleClass: styleClass };
                }
            });
        }
    };

    $.fn.switchify = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.switchify');
        }    
    };

});
