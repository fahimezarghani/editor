/**
 * siteEditorCss.js
 *
 *
 * License: http://www.siteeditor.org/license
 * Contributing: http://www.siteeditor.org/contributing
 */

/*global diagram:true */
define("siteEditor/modules/Background",
["siteEditor/siteEditorCss","siteEditor/siteEditorCore"],
function( siteEditorCss , siteEditor ) {
    siteEditorCss = new siteEditorCss();

    function Background( ){
        var self = this;

        self.element = "body";
        self.color = "#FFFFFF";
        self.position = "center center";
        self.image = "none";
        self.attachment = "scroll";
        self.repeat = "no-repeat";
        self.gradient = "none";
        self.size = "none";
    }

    Background.prototype = {

        //constructor: background,

        set: function(){
            var self = this;

            if(self.element){
                var el = jQuery( siteEditor.siteSelector ).contents();

                if(self.image != "none"){
                    el.find( self.element ).css("background-image" , "url(" + self.image + ")");
                    el.find( self.element ).css("background-color" , self.color);
                    el.find( self.element ).css("background-attachment" , self.attachment);
                    el.find( self.element ).css("background-repeat" , self.repeat);
                    el.find( self.element ).css("background-position" , self.position);
                    if(self.size != "none"){
                        var style = el.find( self.element ).attr("style") || "";
                        el.find( self.element ).attr("style" , style + self.size);
                    }

                }else if(self.gradient != "none"){
                    el.find( self.element ).attr("style" , self.gradient);
                }else{
                    el.find( self.element ).css("background-color" , self.color);
                    el.find( self.element ).css("background-image" , "none");
                }

            }
        },

        //update by color pickers
        updateColor: function( color ){
            var self = this;

             self.color = color.toString();
             if(self.gradient != "none"){
                 var css = siteEditorCss.setGradient( self );
                 self.gradient = css;
             }
             self.set();
        }

    };

    return Background;

});