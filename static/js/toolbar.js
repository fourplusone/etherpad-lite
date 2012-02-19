/*
 * 2012 Matthias Bartelmeß
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
 
//  Simple Button
// Options
// click: function to be called on click
// title: Title of the button
// cssClass: css base class
// name: cssClass extension. will be appended to cssClass

function ButtonItem(options){
  var defaults = {
    click: $.noop,
    title: '',
    cssClass: 'buttonicon',
    name: undefined
  };
  
  var options = $.extend({}, defaults, options);
  
  var cssSubClass = (options.name !== undefined) ? ' ' + options.cssClass + '-' + options.name : '';
  
  this.element = $('<li />')
    .click(options.click)
    .append($('<a>').attr('title', options.title))
    .append($('<div>').addClass(options.cssClass).addClass(cssSubClass));
}


// Custom <li> item
function CustomItem(element){
  this.element = element;
}

// Separator item
function SeparatorItem(){
  this.element = $('<li>').addClass('separator');
}



function Toolbar(el, buttons_){
  var element = $("<ul>");
  el.append(element);
  
  var buttons = [];
  this.setButtons = function(buttons_){
    buttons = buttons_;
    $("*", element).remove();
    $.each(buttons, function(i,o){
      element.append(o.element);
    })
  }
  
  this.getButtons = function(){
    return buttons;
  }
  
  if (buttons_ != undefined) {
    this.setButtons(buttons_)
  }
}

// jQuery shortcut for Toolbar
// usage: $("#toolbarDiv").epToolbar([buttons])

$.fn.epToolbar = function(buttons){
  var el = $(this).get(0);
  var toolbar = el.data('epToolbar')
  
  if(toolbar){
    toolbar.setButtons(buttons);
  } else {
    toolbar = new Toolbar(el, buttons);
    el.data('toolbar', toolbar);
  }
  
  return toolbar;
  
}

exports.ButtonItem = ButtonItem;
exports.Toolbar = Toolbar;
exports.SeparatorItem = SeparatorItem
exports.CustomItem = CustomItem;