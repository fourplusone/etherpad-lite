/**
 * This code is mostly from the old Etherpad. Please help us to comment this code. 
 * This helps other people to understand this code better and helps them to improve it.
 * TL;DR COMMENTS ON THIS FILE ARE HIGHLY APPRECIATED
 */

/**
 * Copyright 2009 Google Inc.
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

var padutils = require('/pad_utils').padutils;
var padeditor = require('/pad_editor').padeditor;
var padsavedrevs = require('/pad_savedrevs').padsavedrevs;

var toolbar = require('/toolbar');

function indexOf(array, value) {
  for (var i = 0, ii = array.length; i < ii; i++) {
    if (array[i] == value) {
      return i;
    }
  }
  return -1;
}

var padeditbar = (function()
{
  var syncAnimation = (function()
  {
    var SYNCING = -100;
    var DONE = 100;
    var state = DONE;
    var fps = 25;
    var step = 1 / fps;
    var T_START = -0.5;
    var T_FADE = 1.0;
    var T_GONE = 1.5;
    var animator = padutils.makeAnimationScheduler(function()
    {
      if (state == SYNCING || state == DONE)
      {
        return false;
      }
      else if (state >= T_GONE)
      {
        state = DONE;
        $("#syncstatussyncing").css('display', 'none');
        $("#syncstatusdone").css('display', 'none');
        return false;
      }
      else if (state < 0)
      {
        state += step;
        if (state >= 0)
        {
          $("#syncstatussyncing").css('display', 'none');
          $("#syncstatusdone").css('display', 'block').css('opacity', 1);
        }
        return true;
      }
      else
      {
        state += step;
        if (state >= T_FADE)
        {
          $("#syncstatusdone").css('opacity', (T_GONE - state) / (T_GONE - T_FADE));
        }
        return true;
      }
    }, step * 1000);
    return {
      syncing: function()
      {
        state = SYNCING;
        $("#syncstatussyncing").css('display', 'block');
        $("#syncstatusdone").css('display', 'none');
      },
      done: function()
      {
        state = T_START;
        animator.scheduleAnimation();
      }
    };
  }());

  var defaultButtons = [ 
    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('bold')},
      title: 'Bold (ctrl-B)',
      name: 'bold'
    }),

    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('italic')},
      title: 'Italics (ctrl-I)',
      name: 'italic'
    }),

    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('underline')},
      title: 'Underline (ctrl-U)',
      name: 'underline'
    }),

    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('strikethrough')},
      title: 'Strikethrough',
      name: 'strikethrough'
    }),
  
    new toolbar.SeparatorItem(),
  
    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('insertorderedlist')},
      title: 'Toggle Ordered List',
      name: 'insertorderedlist'
    }),

    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('insertunorderedlist')},
      title: 'Toggle Bullet List',
      name: 'insertunorderedlist'
    }),

    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('indent')},
      title: 'Indent',
      name: 'indent'
    }),

    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('outdent')},
      title: 'Unindent',
      name: 'outdent'
    }),
  
    new toolbar.SeparatorItem(),
  
    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('undo')},
      title: 'Undo (ctrl-Z)',
      name: 'undo'
    }),

    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('redo')},
      title: 'Redo (ctrl-Y)',
      name: 'redo'
    }),
  
    new toolbar.SeparatorItem(),
  
    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('clearauthorship')},
      title: 'Clear Authorship Colors',
      name: 'clearauthorship'
    })
  ];

  var defaultRightButtons = [
    new toolbar.ButtonItem({
      click: function(){ window.pad && pad.editbarClick('settings')},
      title: 'Settings of this pad',
      name: 'settings'
    }),
      
    new toolbar.ButtonItem({
      click: function(){window.pad && pad.editbarClick('import_export');},
      title: 'Import/Export from/to different document formats',
      name: 'import_export'
    }),
  
    new toolbar.ButtonItem({
      click: function(){window.pad && pad.editbarClick('embed');},
      title: 'Share and Embed this pad',
      name: 'embed'
    }),

    new toolbar.SeparatorItem(),

    new toolbar.ButtonItem({
      click: function(){ document.location = document.location.pathname+ '/timeslider'},
      title: 'Show the history of this pad',
      name: 'history'
    }),

    new toolbar.CustomItem(
      $('<li id="usericon" />')
      .append('<a title="Show connected users"><div class="buttonicon buttonicon-showusers" id="usericonback"></div><span id="online_count">1</span></a></li>')
      .click(function(){
        window.pad && pad.editbarClick('showusers')
      }
    ))
    ];

  var mainToolbar = $("#menu_left").epToolbar();
  var rightToolbar = $("#menu_right").epToolbar();
  
  // That would be a good place for HOOK_MAIN_TOOLBAR (toolbar/buttons)
  
  mainToolbar.setButtons(defaultButtons);
  rightToolbar.setButtons(defaultRightButtons);

  var self = {
    init: function()
    {
      $("#editbar .editbarbutton").attr("unselectable", "on"); // for IE
      $("#editbar").removeClass("disabledtoolbar").addClass("enabledtoolbar");
    },
    isEnabled: function()
    {
//      return !$("#editbar").hasClass('disabledtoolbar');
      return true;
    },
    disable: function()
    {
      $("#editbar").addClass('disabledtoolbar').removeClass("enabledtoolbar");
    },
    toolbarClick: function(cmd)
    {  
      if (self.isEnabled())
      {
        if(cmd == "showusers")
        {
          self.toogleDropDown("users");
        }
        else if (cmd == 'settings')
        {
              self.toogleDropDown("settingsmenu");
        }
        else if (cmd == 'embed')
        {
          self.setEmbedLinks();
          $('#linkinput').focus().select();
          self.toogleDropDown("embed");
        }
        else if (cmd == 'import_export')
        {
	      self.toogleDropDown("importexport");
        }
        else if (cmd == 'save')
        {
          padsavedrevs.saveNow();
        }
        else
        {
          padeditor.ace.callWithAce(function(ace)
          {
            if (cmd == 'bold' || cmd == 'italic' || cmd == 'underline' || cmd == 'strikethrough') ace.ace_toggleAttributeOnSelection(cmd);
            else if (cmd == 'undo' || cmd == 'redo') ace.ace_doUndoRedo(cmd);
            else if (cmd == 'insertunorderedlist') ace.ace_doInsertUnorderedList();
            else if (cmd == 'insertorderedlist') ace.ace_doInsertOrderedList();
            else if (cmd == 'indent')
            {
              if (!ace.ace_doIndentOutdent(false))
              {
                ace.ace_doInsertUnorderedList();
              }
            }
            else if (cmd == 'outdent')
            {
              ace.ace_doIndentOutdent(true);
            }
            else if (cmd == 'clearauthorship')
            {
              if ((!(ace.ace_getRep().selStart && ace.ace_getRep().selEnd)) || ace.ace_isCaret())
              {
                if (window.confirm("Clear authorship colors on entire document?"))
                {
                  ace.ace_performDocumentApplyAttributesToCharRange(0, ace.ace_getRep().alltext.length, [
                    ['author', '']
                  ]);
                }
              }
              else
              {
                ace.ace_setAttributeOnSelection('author', '');
              }
            }
          }, cmd, true);
        }
      }
      if(padeditor.ace) padeditor.ace.focus();
    },
    toogleDropDown: function(moduleName)
    {
      var modules = ["settingsmenu", "importexport", "embed", "users"];
      
      //hide all modules
      if(moduleName == "none")
      {
        $("#editbar ul#menu_right > li").removeClass("selected");
        for(var i=0;i<modules.length;i++)
        {
          //skip the userlist
          if(modules[i] == "users")
            continue;
          
          var module = $("#" + modules[i]);
        
          if(module.css('display') != "none")
          {
            module.slideUp("fast");
          }
        }
      }
      else 
      {
        var nth_child = indexOf(modules, moduleName) + 1;
      	if (nth_child > 0 && nth_child <= 3) {
          $("#editbar ul#menu_right li:not(:nth-child(" + nth_child + "))").removeClass("selected");
          $("#editbar ul#menu_right li:nth-child(" + nth_child + ")").toggleClass("selected");
      	}
        //hide all modules that are not selected and show the selected one
        for(var i=0;i<modules.length;i++)
        {
          var module = $("#" + modules[i]);
        
          if(module.css('display') != "none")
          {
            module.slideUp("fast");
          }
          else if(modules[i]==moduleName)
          {
            module.slideDown("fast");
          }
        }
      }
    },
    setSyncStatus: function(status)
    {
      if (status == "syncing")
      {
        syncAnimation.syncing();
      }
      else if (status == "done")
      {
        syncAnimation.done();
      }
    },
    setEmbedLinks: function()
    {
      if ($('#readonlyinput').is(':checked'))
      {
        var basePath = document.location.href.substring(0, document.location.href.indexOf("/p/"));
        var readonlyLink = basePath + "/ro/" + clientVars.readOnlyId;
        $('#embedinput').val("<iframe src='" + readonlyLink + "?showControls=true&showChat=true&showLineNumbers=true&useMonospaceFont=false' width=600 height=400>");
        $('#linkinput').val(readonlyLink);
        $('#embedreadonlyqr').attr("src","https://chart.googleapis.com/chart?chs=200x200&cht=qr&chld=H|0&chl=" + readonlyLink);
      }
      else
      {
        var padurl = window.location.href.split("?")[0];
        $('#embedinput').val("<iframe src='" + padurl + "?showControls=true&showChat=true&showLineNumbers=true&useMonospaceFont=false' width=600 height=400>");
        $('#linkinput').val(padurl);
        $('#embedreadonlyqr').attr("src","https://chart.googleapis.com/chart?chs=200x200&cht=qr&chld=H|0&chl=" + padurl);
      }
    }
  };
  return self;
}());

exports.padeditbar = padeditbar;
