/**
 * siteEditorControls.js
 *
 *
 * License: http://www.siteeditor.org/license
 * Contributing: http://www.siteeditor.org/contributing
 */

/*global diagram:true */                           // , "siteEditor/siteEditorCss"
define("siteEditor/siteEditorControls",
["siteEditor/dom/Sizzle", "siteEditor/sedAppClass" ],
function( $, sedApp ) {
	var api = sedApp.editor;
    var siteEditorCss = new sedApp.css;
    var undoManager = sedApp.undoManager;
    api.currentControl = api.currentControl || "";
    api.frontPageDisplayChange = false;
    api.previewerActive = api.previewerActive || false;
    api.sedPageBaseSettings  = api.sedPageBaseSettings || {};

	/**
api	 * @param options
	 * - previewer - The Previewer instance to sync with.
	 * - transport - The transport to use for previewing. Supports 'refresh' and 'ajax' and 'postMessage'.
	 */
	api.Setting = api.Value.extend({
		initialize: function( id, value, options ) {
			api.Value.prototype.initialize.call( this, value, options );

			this.id = id;
			this.transport = this.transport || 'refresh';
            //this.ajaxParams = this.ajaxParams || false;

			this.bind( this.preview );
		},
		preview: function() {

            this.previewer.trigger( this.id + "_update");

            var transport = api.applyFilters( 'sedPreviewerTransportFilter' , this.transport , this.id );

			switch ( transport ) {
				case 'refresh':
                    api.Events.trigger("beforeRefreshPreviewer");
					return this.previewer.refresh( );
				//case 'ajax':
					//return this.previewer.ajax( this.ajaxParams , [ this.id, this() ]);
				case 'postMessage':
					return this.previewer.send( 'setting', [ this.id, this() ] );
			}

		}
	});

	api.Control = api.Class.extend({
		initialize: function( id, options ) {
			var control = this,
				nodes, radios, settings;

			this.params = {};
			$.extend( this, options || {} );

			this.id = id;
			this.selector = '#sed-app-control-' + id.replace( /\]/g, '' ).replace( /\[/g, '-' );
			this.container = $( this.selector );
            this.container.addClass("sed-container-control-element");

			settings = $.map( this.params.settings, function( value ) {
				return value;
			});

			api.apply( api, settings.concat( function() {
				var key;

				control.settings = {};
				for ( key in control.params.settings ) {
					control.settings[ key ] = api( control.params.settings[ key ] );
				}

				control.setting = control.settings['default'] || null;
				control.ready();
			}) );

		   /* control.elements = [];

            //not support object value
			nodes  = this.container.find('[data-sed-app-setting-link]');
			radios = {};



			nodes.each( function() {
				var node = $(this),
					name;

				if ( node.is(':radio') ) {
					name = node.prop('name');
					if ( radios[ name ] )
						return;

					radios[ name ] = true;
					node = nodes.filter( '[name="' + name + '"]' );
				}

				api( node.data('sedAppSettingLink'), function( setting ) {  ////api.log( node );
					var element = new api.Element( node ); //api.log( element );
					control.elements.push( element );  //api.log( setting() );
				    //element.sync( setting );
				    //element.set( setting );
				});
			}); */
		},
        //for disable or enable controls
		controlMod: function(disabled) {
            var control = this, containerElement = this.container,
                targetElement = this.container.find(".sed-control-element"),
                tarElTag , tarElDisable = containerElement.find(">.sed-control-element-disable");

            disabled = arguments.length == 0 ? 1 : disabled;

            if(targetElement.length == 0)
                return ;
            else
                tarElTag = targetElement[0].nodeName.toLowerCase();

            if(disabled == 1)
                targetElement.addClass("element-disabled");
            else
                targetElement.removeClass("element-disabled");

            switch (tarElTag) {
              case "input":
              case "select":
              case "button":
                if(disabled == 1)
                    targetElement.attr("disabled" , "disabled");
                else
                    targetElement.removeAttr("disabled");
              break;
              case "img":
              //using offsetParent
              break;
              default:
                if(tarElDisable.length == 0)
                    tarElDisable = $('<div class="sed-control-element-disable"></div>').appendTo(containerElement);
                if(disabled == 1)
                    tarElDisable.show();
                else
                    tarElDisable.hide();
            }

		},

		ready: function() {},

        update: function() {},

		dropdownInit: function() {
			var control      = this,
				statuses     = this.container.find('.dropdown-status'),
				params       = this.params,
				toggleFreeze = false,
				update       = function( to ) {
					if ( typeof to === 'string' && params.statuses && params.statuses[ to ] )
						statuses.html( params.statuses[ to ] ).show();
					else
						statuses.hide();
				};

			// Support the .dropdown class to open/close complex elements
			this.container.on( 'click keydown', '.dropdown', function( event ) {
				if ( event.type === 'keydown' &&  13 !== event.which ) // enter
					return;

				event.preventDefault();

				if (!toggleFreeze)
					control.container.toggleClass('open');

				if ( control.container.hasClass('open') )
					control.container.parent().parent().find('li.library-selected').focus();

				// Don't want to fire focus and click at same time
				toggleFreeze = true;
				setTimeout(function () {
					toggleFreeze = false;
				}, 400);
			});

			this.setting.bind( update );
			update( this.setting() );
		}
	});


    api.UploadControl = api.Control.extend({
        ready: function() {
			var control = this,
				uploader = this.container.find('.sed-uploader'),
                targetElement = uploader.attr("sed-style-element"),
                uploaderId = uploader.attr("id"), oldValue,
                $thisValue = control.setting() , extensions , Mtitle ;
                //mediaGroup = uploader.attr("sed-media-group")

            Mtitle = control.mediaSettings.types["image"].caption;

            this.uploader = this.uploader || {};
			if ( control.params.extensions ) {
				this.uploader.filters = {
				  max_file_size : control.mediaSettings.params.max_upload_size + 'mb',
				  mime_types: [{
					title:      Mtitle,
					extensions: control.params.extensions
				  }]
                }
			}else{
                extensions = control.mediaSettings.types["image"].ext;
                extensions = extensions.join(",");

				this.uploader.filters = {
				  max_file_size : control.mediaSettings.params.max_upload_size + 'mb',
				  mime_types: [{
					title:      Mtitle,
					extensions: extensions
				  }]
                }
			}

            if ( control.params.max_upload_size &&  control.params.max_upload_size <= control.mediaSettings.max_upload_size) {
                this.uploader.filters.max_file_size = control.params.max_upload_size + 'mb';
            }

            if ( control.params.media_group ) {
                this.uploader.url = LIBBASE.url + "media/uploader/upload.php?media_group=" + control.params.media_group;
            }else{
                this.uploader.url = LIBBASE.url + "media/uploader/upload.php";
            }

            if ( control.params.multi_selection ) {
                this.uploader.multi_selection = control.params.multi_selection;
            }else{
                this.uploader.multi_selection = false;
            }

            uploader.seduploader( this.uploader );

            uploader.on("UploadComplete",function(up, files){
                var src = $("#" + uploaderId + "-items").find(".img-icon").attr("full-src");
                //oldValue = control.setting();

                undoManager.add({
                    undo: function () {
                        //control.setting.set( oldValue );
                    },
                    redo: function () {
                        //control.setting.set( src );
                    }
                });
                $thisValue[control.targetElement] = src;
                control.currentValue = src;
                control.previewer.currentElement = control.targetElement;
                control.setting.set( $thisValue );

				 if( !_.isUndefined( control.params.shortcode ) && !_.isUndefined( control.params.attr_name ) )
				    api.Events.trigger("moduleControlRefresh" , control.params.shortcode , src);

            });
        },
        update: function( targetElement ){
            var control = this,$thisValue = control.setting();

            if(targetElement)
                control.targetElement = targetElement;

        }
    });

    api.LibraryControl = api.Control.extend({
        ready: function() {
			var control = this,
				library = this.container.find('.sed-library');

            this.imgLoaded = false;

            library.on("click" , function(e){
                var $this = $(this);


                if(control.imgLoaded === false){
                    yepnope({
                      load: LIBBASE.url + "lazyload/js/jquery.bttrlazyloading.min.js",
                      callback: function (url, result, key) {
                          // whenever this runs, your script has just executed.
                          $this.next().find(".library-bg-img").bttrlazyloading({
                            //container: '#library-bg-img',
                            //updatemanually: true,
                            //triggermanually: true,
                            width: 27,
                            height: 27
                          });
                      }
                    });
                    control.imgLoaded = true;
                }

            });


            this.getValue = function(element){
                if(element.hasClass("no-image"))
                    return "";
                else
                    return element.find("img").attr("full-src");
            }
            this.sedDropdownInit();

        },
        update: function( targetElement ){
            var control = this,$thisValue = control.setting();

            if(targetElement)
                control.targetElement = targetElement;

            control.dropdownUpdate();
        }
    });

    api.ShowOnFrontControl = api.Control.extend({

        ready: function() {
  	      var control = this,$thisValue = control.setting(),
  		     element = this.container.find('.sed-element-control');

            this.element = element;

            if(element.length == 0)
                return ;

            this.update();

            element.on("change", function(e,ui){

                var type = $(this).val() , _refresh = false;
                if(type == "posts"){
                    if( ( parseInt( api("page_on_front")() ) > 0 && api.isHome === true ) || ( parseInt( api("page_for_posts")() ) > 0 && api.isIndexBlog === true )
                        || ( parseInt( api("page_for_posts")() ) > 0 && api.isHome === true && parseInt( api("page_on_front")() ) == 0 )  )
                        _refresh = true;

                    api("page_on_front").set( 0 );
                    api("page_for_posts").set( 0 );
                    var controlPage = api.control.instance( "page_on_front" );
                    controlPage.update( 0 );
                    var controlPosts = api.control.instance( "page_for_posts" );
                    controlPosts.update( 0 );

                    $("#sed-app-control-page_for_posts").find(".sed-element-control > option").show();
                    $("#sed-app-control-page_on_front").find(".sed-element-control > option").show();

                }else if(type == "page"){
                    if( ( parseInt( api("page_on_front")() ) > 0 && api.isHome === true ) || ( parseInt( api("page_for_posts")() ) > 0 && api.isIndexBlog === true ) )
                        _refresh = true;
                }


                control.setting.set( type );

                if(_refresh === true){
                    api.frontPageDisplayChange = true;
                    api.previewer.refresh();
                }

            });
        },

        update: function( newVal ){
            var control = this,$thisValue = control.setting();

            if( !_.isUndefined( newVal )  ){
                attrValue = newVal;
            }else{
                attrValue = $thisValue;
            }

        	  this.element.filter( function() {
        		  return this.value === attrValue;
        	  }).prop( 'checked', true );

        }

    });


    api.FrontPagePostsControl = api.Control.extend({

        ready: function() {
  	      var control = this,$thisValue = control.setting(),
  		     element = this.container.find('.sed-element-control');

            this.element = element;

            if(element.length == 0)
                return ;

            this.update();

            element.on("change", function(e,ui){

                var page = $(this).val() , _refresh = false;
                control.setting.set( page );

                if( ( control.id == "page_on_front" && parseInt( api("page_on_front")() ) > 0 && api.isHome === true ) || ( control.id == "page_for_posts" && parseInt( api("page_for_posts")() ) > 0 && api.isIndexBlog === true )
                    || ( parseInt( api("page_for_posts")() ) > 0 && api.isHome === true && parseInt( api("page_on_front")() ) == 0 ) )
                    _refresh = true;

                //not allow using equal value for front page and posts page(index blog page)
                $("#sed-app-control-page_for_posts").find(".sed-element-control > option").show();
                $("#sed-app-control-page_on_front").find(".sed-element-control > option").show();

                if( control.id == "page_on_front" ){
                    $("#sed-app-control-page_for_posts").find(".sed-element-control > option").show();
                    if( page > 0 )
                        $("#sed-app-control-page_for_posts").find(".sed-element-control > option[value='" + page + "']").hide();
                }

                if( control.id == "page_for_posts" ){
                    $("#sed-app-control-page_on_front").find(".sed-element-control > option").show();
                    if(page > 0)
                        $("#sed-app-control-page_on_front").find(".sed-element-control > option[value='" + page + "']").hide();
                }

                //if both front page and post page not value switch show on front , page to posts
                if( parseInt( api("page_on_front")() ) == 0  && parseInt( api("page_for_posts")() ) == 0  ){
                    api("show_on_front").set( "posts" );
                    var controlFront = api.control.instance( "show_on_front" );
                    controlFront.update( "posts" );
                    $('.sed-app-control-dropdown-pages').hide();
                }

                if(_refresh === true){
                    //api.previewPageId = currModel.id;
                    //api.previewPageType = "post";
                    //api.previewer.trigger( 'url', currModel.link );
                    api.frontPageDisplayChange = true;
                    api.previewer.refresh();
                }

            });
        },

        update: function( newVal ){
            var control = this,$thisValue = control.setting();

            if( !_.isUndefined( newVal )  ){
                attrValue = newVal;
            }else{
                attrValue = $thisValue;
            }

        	this.element.val( attrValue )

        }

    });




	// Change objects contained within the main customize object to Settings.
	api.defaultConstructor = api.Setting;

	// Create the collection of Control objects.
	api.control = new api.Values({ defaultConstructor: api.Control });

	api.PreviewFrame = api.Messenger.extend({
		sensitivity: 2000,

		initialize: function( params, options ) {
			var deferred = $.Deferred();

			// This is the promise object.
			deferred.promise( this );

			this.container = params.container;
			this.signature = params.signature;

			$.extend( params, { channel: api.PreviewFrame.uuid() });

			api.Messenger.prototype.initialize.call( this, params, options );

			this.add( 'previewUrl', params.previewUrl );

			this.query = $.extend( params.query || {}, { customize_messenger_channel: this.channel() });

			this.run( deferred );
		},

		run: function( deferred ) {   //alert("run");
			var self   = this,
				loaded = false,
				ready  = false;

			if ( this._ready )
				this.unbind( 'ready', this._ready );

			this._ready = function() {
				ready = true;

				if ( loaded )
					deferred.resolveWith( self );
			};

			this.bind( 'ready', this._ready );

			this.request = $.ajax( this.previewUrl(), {
				type: 'POST',
				data: this.query,
				xhrFields: {
					withCredentials: true
				}
			});
                 // //api.log(this.query);
			this.request.fail( function() {
				deferred.rejectWith( self, [ 'request failure' ] );
			});

			this.request.done( function( response ) {

				var location = self.request.getResponseHeader('Location'),
					signature = self.signature,
            		index;

                api.currentPreviewUrl = self.previewUrl();

				// Check if the location response header differs from the current URL.
				// If so, the request was redirected; try loading the requested page.
				if ( location && location != self.previewUrl() ) {
				    //api.currentPreviewUrl = location;
					deferred.rejectWith( self, [ 'redirect', location ] );
					return;
				}
                                         //alert( response );
				// Check if the user is not logged in.
				if ( '0' === response ) {
					self.login( deferred );
					return;
				}

				// Check for cheaters.
				if ( '-1' === response ) {
					deferred.rejectWith( self, [ 'cheatin' ] );
					return;
				}

				// Check for a signature in the request.
				index = response.lastIndexOf( signature );
				if ( -1 === index || index < response.lastIndexOf('</html>') ) {
					deferred.rejectWith( self, [ 'unsigned' ] );
					return;
				}

				// Strip the signature from the request.
				response = response.slice( 0, index ) + response.slice( index + signature.length );

				// Create the iframe and inject the html content.
				self.iframe = $('<iframe />').appendTo( self.container );
                if( !api.settings.browser.mobileVersion ){
                    self.iframe.css({"width" : "100%" , "height" : "100%"});
                }else{
                    self.iframe.css({"width" : "767px" , "height" : "100%"});
                }
                self.iframe.attr("id" , "website");

				// Bind load event after the iframe has been added to the page;
				// otherwise it will fire when injected into the DOM.
				self.iframe.one( 'load', function() {
					loaded = true;

					if ( ready ) {
						deferred.resolveWith( self );
					} else {
						setTimeout( function() {
							deferred.rejectWith( self, [ 'ready timeout' ] );
						}, self.sensitivity );
					}
				});

				self.targetWindow( self.iframe[0].contentWindow );

				self.targetWindow().document.open();
				self.targetWindow().document.write( response );
				self.targetWindow().document.close();
			});
		},

		login: function( deferred ) {
			var self = this,
				reject;

			reject = function() {
				deferred.rejectWith( self, [ 'logged out' ] );
			};

			if ( this.triedLogin )
				return reject();

			// Check if we have an admin cookie.
			$.get( api.settings.url.ajax, {
				action: 'logged-in'
			}).fail( reject ).done( function( response ) {
				var iframe;

				if ( '1' !== response )
					reject();

				iframe = $('<iframe src="' + self.previewUrl() + '" />').hide();
				iframe.appendTo( self.container );

				iframe.load( function() {
					self.triedLogin = true;

					iframe.remove();
					self.run( deferred );
				});
			});
		},

		destroy: function() {
			api.Messenger.prototype.destroy.call( this );
			this.request.abort();

			if ( this.iframe )
				this.iframe.remove();

			delete this.request;
			delete this.iframe;
			delete this.targetWindow;
		}
	});

	(function(){
		var uuid = 0;
		api.PreviewFrame.uuid = function() {
			return 'preview-' + uuid++;
		};
	}());

	api.Previewer = api.Messenger.extend({
		refreshBuffer: 250,

		/**
		 * Requires params:
		 *  - container  - a selector or jQuery element
		 *  - previewUrl - the URL of preview frame
		 */
		initialize: function( params, options ) {
			var self = this,
				rscheme = /^https?/;

			$.extend( this, options || {} );

			/*
			 * Wrap this.refresh to prevent it from hammering the servers:
			 *
			 * If refresh is called once and no other refresh requests are
			 * loading, trigger the request immediately.
			 *
			 * If refresh is called while another refresh request is loading,
			 * debounce the refresh requests:
			 * 1. Stop the loading request (as it is instantly outdated).
			 * 2. Trigger the new request once refresh hasn't been called for
			 *    self.refreshBuffer milliseconds.
			 */
			this.refresh = (function( self ) {
				var refresh  = self.refresh,
					callback = function() {
						timeout = null;
						refresh.call( self );
					},
					timeout;

				return function() {
					if ( typeof timeout !== 'number' ) {
						if ( self.loading ) {
							self.abort();
						} else {
							return callback();
						}
					}

					clearTimeout( timeout );
					timeout = setTimeout( callback, self.refreshBuffer );
				};
			})( this );

			this.container   = api.ensure( params.container );
			this.allowedUrls = params.allowedUrls;
			this.signature   = params.signature;

			params.url = window.location.href;

			api.Messenger.prototype.initialize.call( this, params );

			this.add( 'scheme', this.origin() ).link( this.origin ).setter( function( to ) {
				var match = to.match( rscheme );
				return match ? match[0] : '';
			});

			// Limit the URL to internal, front-end links.
			//
			// If the frontend and the admin are served from the same domain, load the
			// preview over ssl if the customizer is being loaded over ssl. This avoids
			// insecure content warnings. This is not attempted if the admin and frontend
			// are on different domains to avoid the case where the frontend doesn't have
			// ssl certs.

			this.add( 'previewUrl', params.previewUrl ).setter( function( to ) {
				var result;

				// Check for URLs that include "/wp-admin/" or end in "/wp-admin".
				// Strip hashes and query strings before testing.
				if ( /\/wp-admin(\/|$)/.test( to.replace( /[#?].*$/, '' ) ) )
					return null;

				// Attempt to match the URL to the control frame's scheme
				// and check if it's allowed. If not, try the original URL.
				$.each([ to.replace( rscheme, self.scheme() ), to ], function( i, url ) {
					$.each( self.allowedUrls, function( i, allowed ) {
						var path;

						allowed = allowed.replace( /\/+$/, '' );
						path = url.replace( allowed, '' );

						if ( 0 === url.indexOf( allowed ) && /^([/#?]|$)/.test( path ) ) {
							result = url;
							return false;
						}
					});
					if ( result )
						return false;
				});

				// If we found a matching result, return it. If not, bail.
				return result ? result : null;
			});

			// Refresh the preview when the URL is changed (but not yet).
			this.previewUrl.bind( this.refresh );

			this.scroll = 0;
			this.bind( 'scroll', function( distance ) {
				this.scroll = distance;
                //alert("scroll");
			});

			// Update the URL when the iframe sends a URL message.
			this.bind( 'url', this.previewUrl );
		},

		query: function() {},

		abort: function() {
			if ( this.loading ) {
				this.loading.destroy();
				delete this.loading;
			}
		},

		refresh: function( ) {
			var self = this;

			this.abort();

            $("#sed_full_editor_loading").show();

            //for sub_theme module-----
            api.Events.trigger("beforeRefresh");

			this.loading = new api.PreviewFrame({
				url:        this.url(),
				previewUrl: this.previewUrl(),
				query:      this.query() || {},
				container:  this.container,
				signature:  this.signature
			});


			this.loading.done( function() {
                $("#sed_full_editor_loading").hide();
				// 'this' is the loading frame
				this.bind( 'synced', function() {
					if ( self.preview )
						self.preview.destroy();
					self.preview = this;
					delete self.loading;

					self.targetWindow( this.targetWindow() );
					self.channel( this.channel() );

                    api.frontPageDisplayChange = false;
                    if( !_.isUndefined( api.currentPreviewType ) && api.currentPreviewType == "new" ){
                        self.send("changePreviewType");
                    }

					self.send( 'active' );
                    api.previewer.trigger( 'previewerActive'  );
                    api.previewerActive = true;
				});

				this.send( 'sync', {
					scroll:   self.scroll,
					settings: api.get()
				});

			});

			this.loading.fail( function( reason, location ) {
			    $("#sed_full_editor_loading").hide();
				if ( 'redirect' === reason && location )
					self.previewUrl( location );

				if ( 'logged out' === reason ) {
					if ( self.preview ) {
						self.preview.destroy();
						delete self.preview;
					}

					self.login().done( self.refresh );
				}

				if ( 'cheatin' === reason )
					self.cheatin();
			});
		},

		login: function() {
			var previewer = this,
				deferred, messenger, iframe;

			if ( this._login )
				return this._login;

			deferred = $.Deferred();
			this._login = deferred.promise();

			messenger = new api.Messenger({
				channel: 'login',
				url:     api.settings.url.login
			});

			iframe = $('<iframe src="' + api.settings.url.login + '" />').appendTo( this.container );

			messenger.targetWindow( iframe[0].contentWindow );

			messenger.bind( 'login', function() {
				iframe.remove();
				messenger.destroy();
				delete previewer._login;
				deferred.resolve();
			});

			return this._login;
		},

		cheatin: function() {
			$( document.body ).empty().addClass('cheatin').append( '<p>' + api.l10n.cheatin + '</p>' );
		}
	});

	/* =====================================================================
	 * Ready.
	 * ===================================================================== */

	api.controlConstructor = {
        upload              : api.UploadControl,
        library             : api.LibraryControl,
        show_on_front       : api.ShowOnFrontControl ,
        front_page_posts    : api.FrontPagePostsControl
	};

  $( function() {
		api.settings            = window._sedAppEditorSettings;
        api.settingsPanels      = window._sedAppSettingsPanels ;
		api.l10n                = window._sedAppEditorControlsL10n;
        //api.paramsSettingsValid = window._paramsSettingsValid;
        api.mediaSettings       = window._sedAppEditorMediaSettings;
        api.I18n                = window._sedAppEditorI18n;
        api.addOnSettings       = window._sedAppEditorAddOnSettings;
		// Check if we can run the customizer.
		if ( ! api.settings )
			return;


		// Redirect to the fallback preview if any incompatibilities are found.
		if ( ! $.support.postMessage || (  api.settings.isCrossDomain ) )  //! $.support.cors &&
			return window.location = api.settings.url.fallback;

		var parent, topFocus,
			body = $( document.body );

		// Prevent the form from saving when enter is pressed on an input or select element.
		$('#sed-app-controls').on( 'keydown', function( e ) {
			var isEnter = ( 13 === e.which ),
				$el = $( e.target );

			if ( isEnter && ( $el.is( 'input:not([type=button])' ) || $el.is( 'select' ) ) ) {
				e.preventDefault();
			}
		});

		// Initialize Previewer
		api.previewer = new api.Previewer({
			container:   '#sed-site-preview',
			//form:        '#sed-app-controls',
			previewUrl:  api.settings.url.preview,
			allowedUrls: api.settings.url.allowed,
			signature:   'SED_APP_SIGNATURE'
		}, {

			nonce: api.settings.nonce,

            currentElement: 'body',

			query: function() {

                var query = {} ,
                    pUrl = this.previewUrl() ,
                    primaryQuery ;

                if( (_.isUndefined( api.currentPreviewUrl ) || api.currentPreviewUrl === pUrl ) && api.frontPageDisplayChange === false  ){
                    query.preview_type = "refresh";
                    api.currentPreviewType = "refresh";
                }else{
                    query.preview_type = "new";
                    api.currentPreviewType = "new";
                }

                var customized = api.get(),
                    mainCustomizedSettings = {};

                if( _.isUndefined( api.sedPageBaseSettings[api.settings.page.id] ) )
                    api.sedPageBaseSettings[api.settings.page.id] = {};

                $.each( api.settings.settings, function( id, options ) {

                    if( _.isUndefined( options.option_type ) || ( options.option_type == "base" ) ){
                        api.sedPageBaseSettings[api.settings.page.id][id] = ( _.isObject( customized[id] ) ) ? $.extend( true, {} , customized[id] ) : customized[id];
                    }else{
                        mainCustomizedSettings = ( _.isObject( customized[id] ) ) ? $.extend( true, {} , customized[id] ) : customized[id];
                    }

                });

                _.extend( query, {
                    //sed_page_id             : api.settings.page.id ,
                    //sed_page_type           : api.settings.page.type ,
					sed_app_editor          : 'on',   //wp_customize
					theme                   : api.settings.theme.stylesheet,
					sed_page_customized     : JSON.stringify( mainCustomizedSettings ),  //customized
                    sed_page_base_settings  : JSON.stringify( api.sedPageBaseSettings ),
					nonce                   : this.nonce.preview
                });

                if( _.isUndefined( api.previewerQueries ) )
                    api.previewerQueries = {};

                var appPostsContent = {} ;

                $.each( api.previewerQueries , function( page_id , oQuery ){

                    $.each( oQuery.sed_posts_content , function( post_id , models ){
                        appPostsContent[post_id] = models;
                    });

                });

                if( !_.isUndefined( api.postsContent ) ) {
                    $.each(api.postsContent, function (post_id, models) {
                        appPostsContent[post_id] = models;
                    });
                }

                console.log( "-------------query.sed_posts_content-------------------" , appPostsContent );

                query.sed_posts_content = JSON.stringify( appPostsContent );

                primaryQuery = {
                    sed_posts_content       : api.postsContent || {} ,
                    sed_page_id             : api.settings.page.id ,
                    sed_page_type           : api.settings.page.type ,
                    theme                   : api.settings.theme.stylesheet,
                };

                if( !_.isUndefined( api.currentPreviewUrl ) ){
                    api.previewerQueries[ api.settings.page.id ] = primaryQuery;
                }

				return query;
			}
		});

		// Refresh the nonces if the preview sends updated nonces over.
		api.previewer.bind( 'nonce', function( nonce ) {
			$.extend( this.nonce, nonce );
		});

        //for api.Ajax check user is logged out
        api.previewer.bind( "check_user_logged_out" , function(){
            api.previewer.preview.iframe.hide();
            api.previewer.login().done( function() {
                api.previewer.send("user_login_done");
                api.previewer.preview.iframe.show();
            });
        });

        //for api.Ajax check cheaters
        api.previewer.bind( "check_cheaters" , function(){
            api.previewer.cheatin();
        });


        api.previewer.bind( "sed_ajax_refresh" , function( id ){

            if( !_.isUndefined( api.previewer.AjaxRefreshRequests ) && !_.isUndefined( api.previewer.AjaxRefreshRequests[id] ) ){
                if( api.previewer.AjaxRefreshRequests[id].processing === true ){
                    api.previewer.AjaxRefreshRequests[id].request.abort();
                }
            }

            api.Events.trigger("beforeAjaxRefresh");

            var query = {} ,
                primaryQuery ;

            query.preview_type = "refresh";
            //api.currentPreviewType = "refresh";

            if( !_.isUndefined( api.postsContent ) )
                query.sed_posts_content = JSON.stringify( api.postsContent );

            var pageCustomizedSettings;
            if( !_.isUndefined( api.pageCustomizedSettings ) )
                pageCustomizedSettings = api.pageCustomizedSettings;
            else
                pageCustomizedSettings = api.get();

            _.extend( query, {
                sed_page_id             : api.settings.page.id ,
                sed_page_type           : api.settings.page.type ,
            	sed_app_editor          : 'on',   //wp_customize
            	theme                   : api.settings.theme.stylesheet,
            	sed_page_customized     : JSON.stringify( pageCustomizedSettings ),  //customized
            	nonce                   : this.nonce.preview
            });

            primaryQuery = {
                sed_posts_content       : api.postsContent || {} ,
                sed_page_id             : api.settings.page.id ,
                sed_page_type           : api.settings.page.type ,
            	sed_app_editor          : 'on',   //wp_customize
            	theme                   : api.settings.theme.stylesheet,
            	sed_page_customized     : pageCustomizedSettings ,  //customized
                            //sed_query_url           : api.currentPreviewUrl
            };

            if( _.isUndefined( api.previewerQueries ) )
                api.previewerQueries = {};

            if( !_.isUndefined( api.currentPreviewUrl ) ){
                //api.log( "primaryQuery ------- : " , primaryQuery );
                api.previewerQueries[ api.settings.page.id ] = primaryQuery;
            }

            var request = $.ajax({
                type: "POST",
                url: api.previewer.previewUrl() ,
                data: query,/*{
                    page_options            : JSON.stringify( api.get() ) ,
                    sed_posts_content       : JSON.stringify( api.postsContent ) ,
                    sed_ajax_refresh        : true
                },*/
                beforeSend: function()
                {

                    //loadingContainer.addClass("loading");
                },

                success: function( data )
                {
                    //loadingContainer.removeClass("loading");
                    api.previewer.AjaxRefreshRequests[id].processing = false;
                    if( $( data ).find('#' + id ).length > 0 ){
                        var htm = $( data ).find('#' + id )[0].outerHTML;
                        api.previewer.send( "ajax_refresh_data" , {
                            id : id ,
                            html : htm ,
                        } );
                    }else{   alert("Error");
                        //Error
                    }

                },
                error: function(xhr, status, error) {
                     api.previewer.AjaxRefreshRequests[id].processing = false;
                     //alert( error );
                     //loadingContainer.removeClass("loading");
                    //console.log(xhr);
                    //console.log(status);
                    //console.log(error);
                }
            });

            request.fail(function(){
                api.previewer.AjaxRefreshRequests[id].processing = false;
            });

            if( _.isUndefined( api.previewer.AjaxRefreshRequests ) )
                api.previewer.AjaxRefreshRequests = {};

            api.previewer.AjaxRefreshRequests[id] = {
                processing  :  true  ,
                request     :  request
            };

            api.trigger( 'AjaxRefreshRequest', request );

        });



  });


});
