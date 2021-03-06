<?php
/*
Module Name: Header
Module URI: http://www.siteeditor.org/modules/header
Description: Module Header For Page Builder Application
Author: Site Editor Team
Author URI: http://www.siteeditor.org
Version: 1.0.0
*/
//'menu', 'image' 'icons', 'title', 'social-bar'
/*if( !is_pb_module_active( "menu" ) || !is_pb_module_active( "image" ) || !is_pb_module_active( "icons" ) || !is_pb_module_active( "title" ) || !is_pb_module_active( "social-bar" ) ){
    sed_admin_notice( __("<b>Alert Module</b> needed to <b>Menu Module</b>
                                                        <b>Image Module</b>
                                                        <b>Icons Module</b>
                                                        <b>Titles Module</b>
                                                        <b>Social Bar Module</b><br /> please first install and activate its ") );
    return ;
}
*/
class PBheaderShortcode extends PBShortcodeClass{

	/**
	 * Register module with siteeditor.
	 */
	function __construct() {
		parent::__construct( array(
                "name"        => "sed_header",                          //*require
                "title"       => __("Header","site-editor"),            //*require for toolbar
                "description" => __("","site-editor"),
                "icon"        => "icon-header",                         //*require for icon toolbar
                "module"      =>  "header"                              //*require
            ) // Args
		);
	}

    function get_atts(){
        $atts = array(
            'sticky'    => false,

        );

        return $atts;
    }

    function add_shortcode( $atts , $content = null ){

        extract($atts);
    }

    /*function scripts(){
		return array(
            array( 'waypoints' ) ,
			array('sticky-header' , SED_PB_MODULES_URL . "header/js/sticky-header.min.js",array( 'jquery' , 'waypoints' ),'1.0.0',true) ,
            array('header-scrolling' , SED_PB_MODULES_URL . "header/js/header-scrolling.min.js",array( 'jquery' ),'1.0.0',true )
		);
    }*/

	function less(){
		return array(
			array('header-main-less')
		);
	}

    function shortcode_settings(){

        $params = array(
            /*'sticky' => array(
                'type'      => 'checkbox',
                'label'     => __('Enable Sticky Header', 'site-editor'),
                'desc'      => '',//__('Enable Sticky Header', 'site-editor'),
                'panel'     => 'general_settings_panel',
            ),*/
            'spacing' => array(
                "type"          => "spacing" ,
                "label"         => __("Spacing", "site-editor"),
                "value"         => "10 0 10 0" ,
            ), 
            "skin"  =>  array(
                "type"          => "skin" ,
                "label"         => __("Change skin", "site-editor"),
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

            array(
            'header' , 'sed_current' ,
            array( 'background','gradient','border','border_radius' ,'padding','margin','position','trancparency','shadow' ) , __("Header Module Container" , "site-editor") ) ,

            array(
            'sed-navbar-header' , '> .sed-navbar-header' ,
            array( 'background','gradient','border','border_radius' ,'padding','margin','shadow','text_align' ) , __("Navbar Header Container" , "site-editor") ) ,

            array(
            'header-icon-bar' , '> .sed-navbar-header .icon-bar' ,
            array( 'background','gradient','border','border_radius' ,'padding','margin','shadow','text_align' ) , __("Navbar Header Icon" , "site-editor") ) ,

            array(
            'menu-item-icon' , '.menu-item-icon' ,
            array( 'text_shadow' , 'font' ,'line_height','text_align' ) , __("Nav Icon" , "site-editor") ) ,

            array(
            'shopping-cart-count' , '.shopping-cart-count' ,
            array( 'background' , 'font' ) , __("Shopping Cart Count" , "site-editor") ) ,
  
            /*
            array(
            'header_social' , '.header_social ul span' ,
            array( 'background','gradient','border','border_radius' ,'padding','margin','shadow' , 'font' ) , __("Social Icon" , "site-editor") ) ,

            array(
            'header_social_hover' , '.header_social ul span:hover' ,
            array( 'background','gradient','border','border_radius' ,'padding','margin','shadow' , 'font' ) , __("Social Icon Hover" , "site-editor") ) ,

            array(
            'contact_details_item' , '.contact_details_item span' ,
            array( 'text_shadow' , 'font' ,'line_height','text_align' ) , __("Contact Details" , "site-editor") ) ,

            array(
            'contact_details_item_hover' , '.contact_details_item span:hover' ,
            array( 'text_shadow' , 'font' ,'line_height','text_align' ) , __("Contact Details Hover" , "site-editor") ) ,

            array(
            'brand-header' , '.brand-header .navbar-brand' ,
            array( 'background','gradient','border','border_radius' ,'padding','margin','shadow' ) , __("Logo" , "site-editor") ) , */


        );
    }
    function contextmenu( $context_menu ){
        $header_menu = $context_menu->create_menu( "header" , __("Header","site-editor") , 'header' , 'class' , 'element' , ''  , "sed_header" , array(
            "duplicate"    => false
        ));
    }

}

new PBheaderShortcode();
include SED_PB_MODULES_PATH . '/header/sub-shortcode/sub-shortcode.php';

global $sed_pb_app;

$sed_pb_app->register_module(array(
    "group"       => "theme" ,
    "name"        => "header",
    "title"       => __("Header","site-editor"),
    "description" => __("","site-editor"),
    "icon"        => "icon-header",
    "shortcode"   => "sed_header",
    "tpl_type"    => "underscore" ,
    "is_special"  => true ,
    "has_extra_spacing"   =>  true ,
    "sub_modules"   => array(),
    //"js_module"   => array( 'sed_header_module_script', 'header/js/header-module.min.js', array('site-iframe') )
));



