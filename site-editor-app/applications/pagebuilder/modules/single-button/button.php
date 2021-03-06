<?php
/*
* Module Name: Button
* Module URI: http://www.siteeditor.org/modules/button
* Description: Button Module For Site Editor Application
* Author: Site Editor Team
* Author URI: http://www.siteeditor.org
* Version: 1.0.0
* @package SiteEditor
* @category Core
* @author siteeditor
*/

if( !is_pb_module_active( "icons" ) || !is_pb_module_active( "title" )){
    sed_admin_notice( __("<b>Button Module</b> needs <b>Icons module</b> , <b>Title module</b><br /> please install and activate it first.") );
    return ;
}

class PBButtonShortcode extends PBShortcodeClass{

	/**
	 * Register module with siteeditor.
	 */
	function __construct() {
		parent::__construct( array(
                  "name"        => "sed_button",                     //*require
                  "title"       => __("Button","site-editor"),       //*require for toolbar
                  "description" => __(""),
                  "icon"        => "icon-buttons",                    //*require for icon toolbar
                  "module"      =>  "button"                         //*require
            ) // Args
		);
	}

  function get_atts(){
      $atts = array(
          /* 'title'          => __('My Button', 'site-editor'), */
          'link'              => '',
          'link_target'       => '_self',
          'size'           => '',
          'type'           => 'btn-main',
          'default_width'  => "126px" ,
          'default_height' => "44px",
          "icon"                => "fa fa-flag" ,
      );

      return $atts;
  }

  function add_shortcode( $atts , $content = null ){
      extract($atts);

  }

  function less(){
      return array(
          array('main-button')
      );
  }

  function shortcode_settings(){

        $this->add_panel( 'button_settings_panel' , array(
            'title'         =>  __('Button Settings',"site-editor")  ,
            'capability'    => 'edit_theme_options' ,
            'type'          => 'fieldset' ,
            'description'   => '' ,
            'priority'      => 9 ,
        ) );

        $params = array(
          	 /*  	'title' => array(
          			'type'      => 'text',
        			'label'     => __('Title', 'site-editor'),
          			'desc'      => __('Set a title attribute for the link the button consists of', 'site-editor'),
                    "panel"     => "button_settings_panel",
          	   	),       */
            'size' => array(
          			'type' => 'select',
          			'label' => __('Button Size', 'site-editor'),
          			'desc' => __("This option allows you to set some predefined sizes for your buttons. The available options are extra-large, large, normal, small and extra small. It should be said that the size of the buttons are flexible and can change in the following situations:
                              <br /> Change the button text with the inline text editor. Your button width will adjust to the text size and if you create new lines, the height of your button will also change.
                              <br /> You can change the width and height of your modules by using the padding settings in the design editor.", "site-editor"),
                      'options' =>array(
                          ''       => __('Normal', 'site-editor'),
                          'btn-xs' => __('Extra small', 'site-editor'),
                          'btn-sm' => __('Small', 'site-editor'),
                          'btn-lg' => __('Large', 'site-editor'),
                          'btn-xl' => __('Extra Large', 'site-editor'),
                      ),
                    "panel"     => "button_settings_panel",
          	),
            'type' => array(
        			  'type' => 'select',
        			  'label' => __('Button Type', 'site-editor'),
        			  'desc' => __("This option allows you to set the current button type. The options to select from are info, success, purple, default, none, flat, danger, warning and primary.
                            <br />It should be mentioned that this option is not for setting color for your buttons. It helps you to create commonly used buttons. You can use the design editor to easily change the color of your buttons.", "site-editor"),
                'options' =>array(
                        'btn-main'        => __('Primary', 'site-editor'),
                        'btn-default'     => __('Default', 'site-editor'),
                        'btn-purple'      => __('Purple', 'site-editor'),
                        'btn-success'     => __('Success', 'site-editor'),
                        'btn-info'        => __('Info', 'site-editor'),
                        'btn-warning'     => __('Warning', 'site-editor'),
                        'btn-danger'      => __('Danger', 'site-editor'),
                        'btn-flat'        => __('Flat', 'site-editor'),
                        'btn-none'        => __('None', 'site-editor'),
                    ),
                "panel"     => "button_settings_panel",
        		),
            'icon' => array(
                "type"          => "icon" ,
                "label"         => __("Icon Field", "site-editor"),
                "desc"          => __("This option allows you to set a icon for your module.", "site-editor"),
            ),
            "skin"  =>  array(
                "type"          => "skin" ,
                "label"         => __("Change skin", "site-editor"),
            ),
            'link'          =>  'link_to' ,
            'link_target'   =>  'link_target' ,
            'spacing' => array(
                "type"          => "spacing" ,
                "label"         => __("Spacing", "site-editor"),
                "value"         => "10 10 10 10" ,
            ),
            "align"  =>  array(
                "type"          => "align" ,
                "label"         => __("Align", "site-editor"),
                "value"         => "center"
            ),
            "animation"  =>  array(
                "type"          => "animation" ,
                "label"         => __("Animation Settings", "site-editor"),
            ),
        );

      return $params;

    }

      function custom_style_settings(){
          return array(

              /*array(
              'module-button' , 'sed_current' ,
              array( 'background','gradient','border','border_radius' ,'padding','margin','position','trancparency','shadow' ) , __("Button Module Container" , "site-editor") ) ,
              */
              array(
              'button-container' , '.btn' ,
              array( 'background','gradient','border','border_radius' ,'padding','shadow' ,'text_shadow' , 'font' ,'line_height','text_align' ) , __("Button Container" , "site-editor") ) ,

              array(
              'button-hover' , '.btn:hover' ,
              array( 'background','gradient','border','shadow' ,'text_shadow' , 'font' ) , __("Button Hover" , "site-editor") ) ,

              array(
              'button-active' , '.btn:active' ,
              array( 'background','gradient','border','shadow' ,'text_shadow' , 'font' ) , __("Button Active" , "site-editor") ) ,

              array(
              'module-icons' , '.module-icons' ,
              array( 'background','gradient','border','border_radius' ,'padding' ,'text_shadow' , 'font' ,'line_height' ) , __("Icons Container" , "site-editor") ) ,

              array(
              'arrow' , '.sed-button-item .icon-button-df:after' ,
              array( 'background','gradient','border','border_radius' ,'padding','margin' ) , __("Arrow" , "site-editor") ) ,

              array(
              'item-skin6' , '.sed-button-item-skin6 .hi-icon' ,
              array( 'background','gradient','border','border_radius','margin','shadow' ) , __("Icons" , "site-editor") ) ,

          );
      }

    function contextmenu( $context_menu ){
    $button_menu = $context_menu->create_menu( "button" , __("Button","site-editor") , 'button' , 'class' , 'element' , '' , "sed_button" , array(
            "link_to"      => true ,
            "seperator"    => array(45 , 75)
        ) );
    }

}

new PBButtonShortcode();
global $sed_pb_app;

$sed_pb_app->register_module(array(
    "group"       => "basic" ,
    "name"        => "button",
    "title"       => __("Button","site-editor"),
    "description" => __("","site-editor"),
    "icon"        => "icon-buttons",
    "shortcode"   => "sed_button",
    "sub_modules"   => array('title', 'icons'),
    //"js_plugin"   => '',
    //"js_module"   => '',
));



