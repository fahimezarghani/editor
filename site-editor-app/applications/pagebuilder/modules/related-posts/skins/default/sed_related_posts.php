<?php
global $sed_data;

if( ( $sed_data['single_post_show_related_posts'] && !post_password_required() ) || site_editor_app_on() ) :
    global $post;

    global $current_module;

    if( isset($current_module['custom_related_func']) )
        $related_query = call_user_func_array($current_module['custom_related_func'], array( $post->ID , $number_posts ));
    else
        $related_query = PBRelatedPostsShortcode::get_related_query( $post->ID , $number_posts );

    $class_col     = "sed-column-".$number_columns;
    $type_class = ($type == "carousel") ? "sed-carousel sed-related-posts-carousel" : "sed-related-posts-default";

    if( $related_query != false && $related_query->have_posts() ): ?>
    <div <?php echo $sed_attrs; ?>   class="module item-posts-module related-post related-posts-default <?php echo $class;?> <?php if( !$sed_data['single_post_show_related_posts'] || post_password_required() ) echo "hide";?>">
        <div class="inner-related <?php echo $type_class;?>" <?php echo $item_settings;?>>
            <?php while( $related_query->have_posts() ): $related_query->the_post() ?>
                <div class="related-post-item <?php echo $class_col ?> ">
                   <a href="<?php the_permalink()?>" class="related-item thumb">
                       <div class="continer image image-arrow">
                           <?php the_post_thumbnail( $using_size );?>
                          <div class="hover"></div>
                          <div class="icon-reated" href="#">
                              <div class="plus-reated">
                                  <div class="icon"><i class="fa fa-plus"></i></div>
                                  <div class="readmore"><span>Read More</span></div>
                              </div>
                          </div>
                          <span class="fa fa-picture-o"></span>
                      </div>
                      <h3 class="title"><span><?php $title=get_the_title(); if(empty($title)){ echo "No Title"; }else{ the_title(); } ?></span></h3>
                   </a>
                </div>
            <?php endwhile ?>
        </div>
    </div>
    <?php
    wp_reset_postdata();
    else:
    ?>
    <div class="hide sed-empty-content-related"></div>
    <?php
    endif;
        wp_reset_query();
endif;

if($type == "default"){
?>

<style type="text/css">
[sed_model_id="<?php echo $sed_model_id; ?>"] .sed-related-posts-default .related-post-item:nth-of-type(<?php echo $number_columns; ?>n + 1){
    clear: both;
}
</style>

<?php } ?>