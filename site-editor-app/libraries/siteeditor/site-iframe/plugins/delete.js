(function( exports, $ ) {

    var api = sedApp.editor ;

    api.DeletePlugin = api.Class.extend({

        initialize: function( params , options ){
            var self = this;

            $.extend( this, options || {} );

            this.ready();

            this.elementId;
        },

        ready : function(){
            this.removeAlert();
        },

        remove : function( elementId , callback ){
            this.elementId = elementId;

            api.Events.trigger( "sedBeforeRemove" , elementId );
            api.Events.trigger( "before-remove-" + elementId );


            this.removeFromShortcodes();
            this.removeFromUsingModules();
            this.removeFromStyleEditor();
            this.removeFromDom();


            api.Events.trigger( "sedAfterRemove" , elementId );
            api.Events.trigger( "after-remove-" + elementId );

            if(callback)
                callback();

        },

        removeAlert : function( ){
             var self = this;

            $('.sed-handle-sort-row .remove_pb_btn').livequery( function(){
                $(this).not('.disabled').popover({
                    html : true ,
                    content :  function(){
                        return $("#sed-remove-alert-tmpl").html();
                    } ,
                    placement : "auto top" ,
                    container: 'body'
                });
            });

            $(".close-popover").livequery( function(){
                $(this).click(function(){
                    var id = $(this).parents(".popover:first").attr("id");
                    $('[aria-describedby="' + id + '"]').popover('hide');
                });
            });

            $(".sed-module-remove-btn").livequery( function(){
                $(this).click(function(){
                    var id = $(this).parents(".popover:first").attr("id");
                    var moduleId = $('[aria-describedby="' + id + '"]').data( "moduleRelId" ) ,
                        dropArea = $("#" + moduleId).parents(".bp-component:first");
                    $('[aria-describedby="' + id + '"]').popover('hide');
                    self.remove( moduleId );

                    api.pageBuilder.addRemoveSortableClass( dropArea );
                    //$("")
                });
            });

            $('body').on('click', function (e) {
                $('.sed-handle-sort-row .remove_pb_btn').each(function () {

                    if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0 ) {
                        $(this).popover('hide');
                        //$(this).next('.popover').hide();
                    }
                });

            });

        },

        removeFromDom : function( ){
            $( "#" + this.elementId ).detach();
        },

        removeFromShortcodes : function( ){
            var postId = api.pageBuilder.getPostId( $("#" + this.elementId) );
            api.contentBuilder.deleteModule( this.elementId , postId);
        },

        removeFromUsingModules : function(){
            var self = this;
            api.pageModulesUsing = _.filter( api.pageModulesUsing , function( module ){
                return module.id != self.elementId;
            });
        },

        removeFromStyleEditor : function( ){

        },

    });


    $( function() {

        api.removePlugin = new api.DeletePlugin();

        api.remove = function(elementId , callback){
            api.removePlugin.remove(elementId , callback);
        };

    });

}(sedApp, jQuery));