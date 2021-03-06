/**
 * plugin.js
 *
 *
 * License: http://www.siteeditor.org/license
 * Contributing: http://www.siteeditor.org/contributing
 */

/*global siteEditor:true */
siteEditor.PluginManager.add('pagebuilder', function(siteEditor) {

  var api = siteEditor.sedAppClass.editor , $ = siteEditor.dom.Sizzle;
  //previewer = siteEditor.siteEditorControls;
  ////api.log( siteEditor );
  ////api.log( sedApp.editor === api );
  ////api.log( siteEditor.dom.Sizzle === jQuery );
  ////api.log( sedApp );
  ////api.log( jQuery );
  ////api.log( siteEditor );

  $( function() {
      api.settings = window._sedAppEditorSettings;
      api.l10n = window._sedAppEditorControlsL10n;
      api.postsContent = [];
      api.pagesThemeContent = [];
      api.modules = {};
      api.childShortcode = {};
      api.moduleDragSync = false;

      api.shortcodes          = window._sedRegisteredShortcodesSettings ;
      api.shortcodesScripts   = window._sedRegisteredShortcodesScripts;
      api.shortcodesStyles    = window._sedRegisteredShortcodesStyles;
      api.modulesSettings     = window._sedAppEditorPageBuilderModules;
      api.defaultPatterns     = window._sedShortcodesDefaultPatterns ;
      //only javascript files using in editor and not loaded in front end
      api.ModulesEditorJs     = window._sedAppJsModulesForEditor;

      //api.modulesInfo         = window._sedAppPageBuilderModulesInfo;


                                 //api.log( api.settings );
      // Check if we can run the customizer.
      if ( ! api.settings )
      	return;


      // Redirect to the fallback preview if any incompatibilities are found.
      if ( ! $.support.postMessage || (  api.settings.isCrossDomain ) )  //! $.support.cors &&
      	return window.location = api.settings.url.fallback;

        /*
        send  api.shortcodes to iframe
        send  api.shortcodes to iframe
        send  api.shortcodes to iframe
        send  api.shortcodes to iframe
        */
        api.previewer.bind( 'previewerActive', function( ) {

            api.previewer.send( "sed_api_shortcodes" , api.shortcodes );

            api.previewer.send( "sed_api_shortcodes_scripts" , api.shortcodesScripts );

            api.previewer.send( "sed_api_shortcodes_styles" , api.shortcodesStyles );

            api.previewer.send( "sed_api_modules_settings" , api.modulesSettings );

            api.previewer.send( "sed_api_modules_editor_js" , api.ModulesEditorJs );

        });

        api.previewer.bind( 'checkModuleDragSync', function( ) {

            if(api.moduleDragSync === true)
                $.SiteEditorDroppable.destroy('[data-type-row="draggable-element"]' , "website" );

            var _getAttrs = function(element){
                var attrs = {};
                $.each(element.attributes, function() {
                  if(this.specified) {
                    attrs[this.name] = this.value;
                  }
                });
                return attrs;
            };

            $.sedDroppable('[data-type-row="draggable-element"]',{
                iframe : "website",
                dragStart : function(event , element, helper){
                    //parent.jQuery("#iframe_cover").show();
                },
                stop : function(event , element, helper){
                    //parent.jQuery("#iframe_cover").hide();
                },
                drop : function(event, ui){

                    var attrs = _getAttrs( ui.helper[0] );

                    api.previewer.send( 'moduleDragHandler' , {
                        option :  "drop" ,
                        args   :  {
                            //event : event ,
                            ui    : {
                                offset : ui.offset
                            } ,
                            element : {
                                attrs :  attrs ,
                                data  :  ui.helper.data()
                            }
                        } ,
                        mode   : api.moduleDragSync
                    });
                }
            });

            if(api.moduleDragSync === true)
                return ;

            //$( ".sed-module-pb" ).sedDraggable.destroy();

             //draggable modules in modules tab and drop in page content
            $( ".sed-module-pb" ).sedDraggable({
                scrollSensitivity : 30,
                scrollSpeed : 30,
                dropInSortable: ".bp-component",
                items: ".sed-row-pb" ,    //children only
                cancelSortable : '[data-type-row="draggable-element"],[sed-disable-editing="yes"]',
                iframeSortable: "website",
                placeholder:"<div class='sed-state-highlight-row'></div>",
                dragStart : function(event , element, helper){
                    $("#iframe_cover").show();
                    api.previewer.send("moduleDragStart");
                },
                stop : function(event , element, helper){
                    $("#iframe_cover").hide();
                },
                out : function(event, sortableArea , options ) {
                    var rows;

                    if( options.items !== false ){
                        rows = sortableArea.children(options.items).not('[data-type-row="draggable-element"]' );
                    }else{
                        rows = sortableArea.children().not('[data-type-row="draggable-element"]' );
                    }

                    if(rows.length == 0 && !sortableArea.hasClass("sed-pb-empty-sortable-area") ){
                         sortableArea.addClass("sed-pb-empty-sortable-area");
                    }
                },
                over : function(event, sortableArea , options ) {
                    if( sortableArea.hasClass("sed-pb-empty-sortable-area") ){
                        ////api.log("sortableArea");
                        sortableArea.removeClass("sed-pb-empty-sortable-area");
                    }
                },
                sortStop : function(event,ui) {

                    var attrs = _getAttrs( ui.helper[0] );

                    if( !_.isUndefined( ui.sortable.data("parentModule") ) ){
                        var modules = ui.sortable.data("modulesAccepted");
                        modules = modules.split(",");

                        modules = _.map( modules , function( module ){
                            return $.trim(module);
                        });

                        modules = _.filter( modules , function( module ){
                            return module;
                        });

                        if( $.inArray( attrs["sed-module-name"] , modules ) == -1 ){
                            alert( ui.sortable.data("modulesAcceptedError") );
                            api.previewer.send("moduleDragStop");
                            return ;
                        }
                    }

                    api.previewer.send( 'moduleDragHandler' , {
                        option :  "sortStop" ,
                        args   :  {
                            //event : event ,
                            ui    : {
                                direction : ui.direction
                            } ,
                            //item  : ui.item ,
                            element : {
                                attrs :  attrs ,
                                data  :  ui.helper.data()
                            }
                        } ,
                        mode   : api.moduleDragSync
                    });

                    api.previewer.send("moduleDragStop");
                }
            });

            if(api.moduleDragSync === false)
                api.moduleDragSync = true;

        });

       api.previewer.bind("resetSettings" , function( data ){
                       // alert( data.pageId );
           if( _.isUndefined(data.settings) || _.isUndefined(data.pageId) || _.isUndefined(data.pageType)  )
              return ;                                  
                      //api.log( "data.settings --------------------------- : "  , data );
           /*$.each( data.settings, function( id, value ) {
            var setting = api.settings.settings[id];
            if( _.isUndefined( setting.type ) || (setting.type != "style-editor" && setting.type != "module" ) ){
                //api( id ).set( value );
             }

           });

           $.each( api.settings.controls, function( id, data ) {
               if(!data.category || data.category != 'module-settings'){
                   var control = api.control.instance( id );
                   //control.update();
               }
           });*/

           api.settings.page.id = data.pageId;
           api.settings.page.type = data.pageType;

       });

       api.previewer.bind("currentPageInfo" , function( data ){
           api.currentPageInfo = data;

           if( api.currentPageInfo.isHome === true && api.currentPageInfo.isFrontPage === true ){
               $(".home-blog-control").parents("td:first").show();
               api.isHomeBlog = true;
           }else{
               $(".home-blog-control").parents("td:first").hide();
               api.isHomeBlog = false;
           }

           if( api.currentPageInfo.isHome === false && api.currentPageInfo.isFrontPage === true ){
               $(".home-page-control").parents("td:first").show();
               api.isHomePage = true;
           }else{
               $(".home-page-control").parents("td:first").hide();
               api.isHomePage = false;
           }

           if( api.currentPageInfo.isHome === true && api.currentPageInfo.isFrontPage === false ){
               $(".index-blog-control").parents("td:first").show();
               api.isIndexBlog = true;
           }else{
               $(".index-blog-control").parents("td:first").hide();
               api.isIndexBlog = false;
           }

           if( ( api.currentPageInfo.isHome === true && api.currentPageInfo.isFrontPage === true ) || ( api.currentPageInfo.isHome === false && api.currentPageInfo.isFrontPage === true ) ){
               $(".home-control").parents("td:first").show();
               api.isHome = true;
           }else{
               $(".home-control").parents("td:first").hide();
               api.isHome = false;
           }

       });

        api.previewer.bind( 'posts_content_update', function( postsContent ) {
            api.trigger("change");    console.log( 'postsContent ------ : ' , postsContent ); //alert("test");
            api.postsContent = postsContent;

        });

        api.previewer.bind( 'pages_theme_content_update', function( pagesContent ) {
            api.trigger("change");   console.log( 'themeContent ------ : ' , pagesContent );
            api.pagesThemeContent = pagesContent; console.log( api.pagesThemeContent[api.settings.page.id] );

                    _.each( api.pagesThemeContent[api.settings.page.id] , function( shortcode , index ){

                        if( !_.isUndefined( shortcode.theme_id ) && !_.isUndefined( shortcode.is_customize ) ){
                            console.log( "shortcode.is_customize------------," , shortcode );
                        }else if( !_.isUndefined( shortcode.theme_id ) && _.isUndefined( shortcode.is_customize ) ){
                            console.log( "shortcode not customize------------," , shortcode );
                        }
                    });

            api( 'theme_content' ).set( api.pagesThemeContent[api.settings.page.id] );
        });

        api.previewer.bind( 'set_editor_current_page', function( obj ) {

            if( !_.isUndefined( obj.changePage ) && obj.changePage )
                api.trigger("change");

            if( !_.isUndefined( obj.page ) )
                api.settings.page = obj.page;

        });

        api.previewer.bind( 'dataModulesSkinsCache', function( data ) {
            api.dataModulesSkinsCache = data || {};
        });

        api.previewer.bind( 'moduleSkinsTplCache' , function( skinsTpl ) {
            api.moduleSkinsTplCache = $.extend(true , api.moduleSkinsTplCache || {} , skinsTpl || {});
        });

        api.previewer.bind( 'previewerActive', function( ) {
            if( !_.isUndefined( api.dataModulesSkinsCache ) )
                api.previewer.send( "dataModuleSkins" , api.dataModulesSkinsCache );

            if( !_.isUndefined( api.moduleSkinsTplCache ) )
                api.previewer.send( "moduleSkinsTpl" , api.moduleSkinsTplCache );
        });

        api.previewer.bind( 'syncAttachmentsSettings', function( data ) {

            if( _.isUndefined( data ) )
                return ;
                                    //api.log( data );
            api.attachmentsSettings = data;

            /*if( _.isUndefined( api.attachmentsSettings ) )
                api.attachmentsSettings = data;
            else{
                var attachIds = _.pluck( data , 'id');
                api.attachmentsSettings = _.map( api.attachmentsSettings , function( attachment ){
                    var index = $.inArray( attachment.id , attachIds);
                    if( index != -1 ){
                        var newAttachment = _.findWhere(data , {'id' : attachment.id});
                        attachIds.splice( index , 1);
                        return newAttachment;
                    }else
                        return attachment;

                });

            } */

        });


        api.previewer.bind( 'duplicateSettingsSync', function( sync ) {

            var sed_pb_modules = api( 'sed_pb_modules' )() ,
                 sed_pb_modules_ids = _.keys( sed_pb_modules ) ,
                 sed_page_customized = api.get(),
                 settingsIds = _.keys( api.settings.settings ),
                 styleEditorSettings = _.chain( settingsIds )
                .filter(function( id ){
                    if( api.settings.settings[id].type == "style-editor" )
                        return true;
                    else
                        return false;
                })
                .value() ,
                currentModels = ( sync.place == "theme" ) ? api.pagesThemeContent[sync.postId ] : api.postsContent[sync.postId ] ,
                rowShortcodes = {},
                shortcodeIds = _.keys( sync.ids );
                //cssSelectors = {};

            _.each( sed_pb_modules_ids , function( id ){
                if( $.inArray( id , shortcodeIds ) != -1 ){
                    if( _.isUndefined( rowShortcodes['sed_pb_modules'] ) )
                        rowShortcodes['sed_pb_modules'] = {};

                    rowShortcodes['sed_pb_modules'][sync.ids[id]] = $.extend( true, {} , sed_pb_modules[id] );
                }
            });

            /*var reg = "#(" + shortcodeIds.join("|") + ")\s+" ,
                patt = new RegExp( reg , 'i' );
                patt.test( selector ); */

            _.each( styleEditorSettings , function( id ){

                var values = sed_page_customized[id],
                    selectors = _.keys( values );

                _.each( selectors , function( selector ){
                    _.each( shortcodeIds , function( sid ){
                        var str = "#" + sid;
                        if( str == selector || selector.indexOf( str + " " ) > -1 ){
                            if( _.isUndefined( rowShortcodes[id] ) )
                                rowShortcodes[id] = {};

                            var newSelector = selector.replace( sid , sync.ids[sid] );
                            //cssSelectors[selector] = newSelector;

                            if( _.isObject( sed_page_customized[id][selector] ) )
                                rowShortcodes[id][newSelector] = $.extend( true, {} , sed_page_customized[id][selector] );
                            else
                                rowShortcodes[id][newSelector] = sed_page_customized[id][selector];
                        }
                    });
                });

            });

            $.extend(  true, sed_page_customized , rowShortcodes );

            api.previewer.send( "duplicateSettingsSynced" , {
                modelsSettings :  rowShortcodes ,
                //cssSelectors   :  cssSelectors
            });

        });

       $(".site-editor-app-tools-button .sed-module-gideline").click(function(){
          if( $(this).hasClass("modules-guideline-on") ){
              $(this).removeClass("modules-guideline-on");
              api.previewer.send("modulesGuidelineOff");
          }else{
              $(this).addClass("modules-guideline-on");
              api.previewer.send("modulesGuidelineOn");
          }
      });

      api.megamenuDragArea = {};

      api.previewer.bind( "megamenuDragAreaMode" , function( obj ){
          api.megamenuDragArea = obj;

          if( obj.mode == "on" ){
              $("#app-preview-mode-btn").prop("disabled" , true);
          }else if( obj.mode == "off" ){
              $("#app-preview-mode-btn").prop("disabled" , false);
          }
      });

      api.previewer.bind( 'previewerActive', function( ) {
          if( !_.isUndefined( api.megamenuDragArea.mode ) && api.megamenuDragArea.mode == "on" ){ 
              api.previewer.send( "megamenuDragAreaActiveAfterRefresh" , api.megamenuDragArea );
          }
      });

  });

});