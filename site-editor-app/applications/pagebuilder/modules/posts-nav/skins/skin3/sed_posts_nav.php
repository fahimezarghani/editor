<?php
$next_post = get_next_post();
$prev_post = get_previous_post();

global $sed_data;

   if( ( $sed_data['single_post_show_post_nav'] && !post_password_required() ) || site_editor_app_on() ) :
    if( ( empty( $prev_post ) || !$prev_post ) && ( empty( $next_post ) || !$next_post ) ):
    ?>
    <div class="hide sed-empty-content-nav"></div>
    <?php
    else:
    ?>
    <div <?php echo $sed_attrs; ?>  class="module posts-nav posts-nav-skin3 <?php echo $class;?>   <?php if(!$sed_data['single_post_show_post_nav'] || post_password_required() ) echo "hide";?>">
        <div class="post-nav-container">
            <?php if ( !empty( $prev_post ) ): ?>
                   <div class="sed-post-nav post-nav-prev">
                       <a href="<?php echo get_permalink( $prev_post->ID ); ?>" title="<?php echo $prev_post->post_title; ?>" rel="next">
                           <div class="post-nav-content">
                             <div class="thumb">
                               <div class="continer">
                                    <?php echo get_the_post_thumbnail($prev_post->ID , $using_size); ?>
                                    <div class="post-nav-title">
                                        <span><?php $title=$prev_post->post_title; if(empty($title)){ echo "No Title"; }else{ echo $title; } ?></span>
                                    </div>
                                    <span class="fa fa-picture-o"></span>
                               </div>
                             </div>
                           </div>
                           <div class="post-nav-arrow"><span><i class="fa  fa-chevron-circle-left"></i></span></div>
                       </a>
                  </div>
            <?php endif ?>
            <?php if ( !empty( $next_post ) ): ?>
                   <div class="sed-post-nav post-nav-next">
                       <a href="<?php echo get_permalink( $next_post->ID ); ?>" title="<?php echo $next_post->post_title; ?>" rel="next" >
                         <div class="post-nav-arrow"><span><i class="fa  fa-chevron-circle-right"></i></span></div>
                           <div class="post-nav-content">
                             <div class="thumb">
                               <div class="continer">
                                    <?php echo get_the_post_thumbnail($next_post->ID , $using_size);?>
                                    <div class="post-nav-title">
                                        <span><?php $title=$next_post->post_title; if(empty($title)){ echo "No Title"; }else{ echo $title; } ?></span>
                                    </div>
                                    <span class="fa fa-picture-o"></span>
                               </div>
                             </div>
                           </div>
                       </a>
                    </div>
            <?php endif ?>
        </div>
    </div>
    <?php endif ?>
<?php endif ?>