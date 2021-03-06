<?php
/**
 * HTML comment list class.
 *
 * @uses Walker
 * @since 2.7.0
 */
class WalkerSEDComments extends Walker {
    /**
     * What the class handles.
     *
     * @see Walker::$tree_type
     *
     * @since 2.7.0
     * @var string
     */
    var $tree_type = 'comment';

    /**
     * DB fields to use.
     *
     * @see Walker::$db_fields
     *
     * @since 2.7.0
     * @var array
     */
    var $db_fields = array ('parent' => 'comment_parent', 'id' => 'comment_ID');

    /**
     * Start the list before the elements are added.
     *
     * @see Walker::start_lvl()
     *
     * @since 2.7.0
     *
     * @param string $output Passed by reference. Used to append additional content.
     * @param int $depth Depth of comment.
     * @param array $args Uses 'style' argument for type of HTML list.
     */
    function start_lvl( &$output, $depth = 0, $args = array() ) {
        $GLOBALS['comment_depth'] = $depth + 1;

        switch ( $args['style'] ) {
            case 'div':
                break;
            case 'ol':
                $output .= '<ol class="children">' . "\n";
                break;
            default:
            case 'ul':
                $output .= '<ul class="children">' . "\n";
                break;
        }
    }

    /**
     * End the list of items after the elements are added.
     *
     * @see Walker::end_lvl()
     *
     * @since 2.7.0
     *
     * @param string $output Passed by reference. Used to append additional content.
     * @param int    $depth  Depth of comment.
     * @param array  $args   Will only append content if style argument value is 'ol' or 'ul'.
     */
    function end_lvl( &$output, $depth = 0, $args = array() ) {
        $GLOBALS['comment_depth'] = $depth + 1;

        switch ( $args['style'] ) {
            case 'div':
                break;
            case 'ol':
                $output .= "</ol><!-- .children -->\n";
                break;
            default:
            case 'ul':
                $output .= "</ul><!-- .children -->\n";
                break;
        }
    }

    /**
     * Traverse elements to create list from elements.
     *
     * This function is designed to enhance Walker::display_element() to
     * display children of higher nesting levels than selected inline on
     * the highest depth level displayed. This prevents them being orphaned
     * at the end of the comment list.
     *
     * Example: max_depth = 2, with 5 levels of nested content.
     * 1
     *  1.1
     *    1.1.1
     *    1.1.1.1
     *    1.1.1.1.1
     *    1.1.2
     *    1.1.2.1
     * 2
     *  2.2
     *
     * @see Walker::display_element()
     * @see wp_list_comments()
     *
     * @since 2.7.0
     *
     * @param object $element           Data object.
     * @param array  $children_elements List of elements to continue traversing.
     * @param int    $max_depth         Max depth to traverse.
     * @param int    $depth             Depth of current element.
     * @param array  $args              An array of arguments.
     * @param string $output            Passed by reference. Used to append additional content.
     * @return null Null on failure with no changes to parameters.
     */
    function display_element( $element, &$children_elements, $max_depth, $depth, $args, &$output ) {

        if ( !$element )
            return;

        $id_field = $this->db_fields['id'];
        $id = $element->$id_field;

        parent::display_element( $element, $children_elements, $max_depth, $depth, $args, $output );

        // If we're at the max depth, and the current element still has children, loop over those and display them at this level
        // This is to prevent them being orphaned to the end of the list.
        if ( $max_depth <= $depth + 1 && isset( $children_elements[$id]) ) {
            foreach ( $children_elements[ $id ] as $child )
                $this->display_element( $child, $children_elements, $max_depth, $depth, $args, $output );

            unset( $children_elements[ $id ] );
        }

    }

    /**
     * Start the element output.
     *
     * @since 2.7.0
     *
     * @see Walker::start_el()
     * @see wp_list_comments()
     *
     * @param string $output  Passed by reference. Used to append additional content.
     * @param object $comment Comment data object.
     * @param int    $depth   Depth of comment in reference to parents.
     * @param array  $args    An array of arguments.
     */
    function start_el( &$output, $comment, $depth = 0, $args = array(), $id = 0 ) {
        $depth++;
        $GLOBALS['comment_depth'] = $depth;
        $GLOBALS['comment'] = $comment;

        if ( !empty( $args['callback'] ) ) {
            ob_start();
            call_user_func( $args['callback'], $comment, $args, $depth );
            $output .= ob_get_clean();
            return;
        }

        if ( ( 'pingback' == $comment->comment_type || 'trackback' == $comment->comment_type ) && $args['short_ping'] ) {
            ob_start();
            $this->ping( $comment, $depth, $args );
            $output .= ob_get_clean();
        } elseif ( 'html5' === $args['format'] ) {
            ob_start();
            $this->html5_comment( $comment, $depth, $args );
            $output .= ob_get_clean();
        } else {
            ob_start();
            $this->comment( $comment, $depth, $args );
            $output .= ob_get_clean();
        }
    }

    /**
     * Ends the element output, if needed.
     *
     * @since 2.7.0
     *
     * @see Walker::end_el()
     * @see wp_list_comments()
     *
     * @param string $output  Passed by reference. Used to append additional content.
     * @param object $comment The comment object. Default current comment.
     * @param int    $depth   Depth of comment.
     * @param array  $args    An array of arguments.
     */
    function end_el( &$output, $comment, $depth = 0, $args = array() ) {
        if ( !empty( $args['end-callback'] ) ) {
            ob_start();
            call_user_func( $args['end-callback'], $comment, $args, $depth );
            $output .= ob_get_clean();
            return;
        }
        if ( 'div' == $args['style'] )
            $output .= "</div><!-- #comment-## -->\n";
        else
            $output .= "</li><!-- #comment-## -->\n";
    }

    /**
     * Output a pingback comment.
     *
     * @access protected
     * @since 3.6.0
     *
     * @see wp_list_comments()
     *
     * @param object $comment The comment object.
     * @param int    $depth   Depth of comment.
     * @param array  $args    An array of arguments.
     */
    protected function ping( $comment, $depth, $args ) {
        global $current_module;

        $tag = ( 'div' == $args['style'] ) ? 'div' : 'li';

        $template_file = dirname( $current_module['comments-template'] ) . DS . 'comments-template' . DS . 'ping.php';
        if( is_file( $template_file ) ):
            include $template_file;
        else:
?>
        <<?php echo $tag; ?> id="comment-<?php comment_ID(); ?>" <?php comment_class(); ?>>
            <div class="comment-body">
                <?php _e( 'Pingback:' ); ?> <?php comment_author_link(); ?> <?php edit_comment_link( __( 'Edit' ), '<span class="edit-link">', '</span>' ); ?>
            </div>
<?php
        endif;//include template file
    }

    /**
     * Output a single comment.
     *
     * @access protected
     * @since 3.6.0
     *
     * @see wp_list_comments()
     *
     * @param object $comment Comment to display.
     * @param int    $depth   Depth of comment.
     * @param array  $args    An array of arguments.
     */
    protected function comment( $comment, $depth, $args ) {
        global $current_module;

        if ( 'div' == $args['style'] ) {
            $tag = 'div';
            $add_below = 'comment';
        } else {
            $tag = 'li';
            $add_below = 'div-comment';
        }
        $template_file = dirname( $current_module['comments-template'] ) . DS . 'comments-template' . DS . 'comment.php';
        if( is_file( $template_file ) ):
            include $template_file;
        else:
        ?>
            <<?php echo $tag; ?> <?php comment_class( empty( $args['has_children'] ) ? '' : 'parent' ); ?> id="comment-<?php comment_ID(); ?>">
            <?php if ( 'div' != $args['style'] ) : ?>
            <div id="div-comment-<?php comment_ID(); ?>" class="comment-body">
            <?php endif; ?>
            <div class="comment-author vcard">
                <?php if ( 0 != $args['avatar_size'] ) echo get_avatar( $comment, $args['avatar_size'] ); ?>
                <?php printf( __( '<cite class="fn">%s</cite> <span class="says">says:</span>' ), get_comment_author_link() ); ?>
            </div>
            <?php if ( '0' == $comment->comment_approved ) : ?>
            <em class="comment-awaiting-moderation"><?php _e( 'Your comment is awaiting moderation.' ) ?></em>
            <br />
            <?php endif; ?>

            <div class="comment-meta commentmetadata"><a href="<?php echo esc_url( get_comment_link( $comment->comment_ID, $args ) ); ?>">
                <?php
                    /* translators: 1: date, 2: time */
                    printf( __( '%1$s at %2$s' ), get_comment_date(),  get_comment_time() ); ?></a><?php edit_comment_link( __( '(Edit)' ), '&nbsp;&nbsp;', '' );
                ?>
            </div>

            <?php comment_text( get_comment_id(), array_merge( $args, array( 'add_below' => $add_below, 'depth' => $depth, 'max_depth' => $args['max_depth'] ) ) ); ?>

            <div class="reply">
                <?php comment_reply_link( array_merge( $args, array( 'add_below' => $add_below, 'depth' => $depth, 'max_depth' => $args['max_depth'] ) ) ); ?>
            </div>
            <?php if ( 'div' != $args['style'] ) : ?>
            </div>
            <?php endif; ?>
        <?php endif;//template file ?>
<?php
    }

    /**
     * Output a comment in the HTML5 format.
     *
     * @access protected
     * @since 3.6.0
     *
     * @see wp_list_comments()
     *
     * @param object $comment Comment to display.
     * @param int    $depth   Depth of comment.
     * @param array  $args    An array of arguments.
     */
    protected function html5_comment( $comment, $depth, $args ) {
        global $current_module;

        $tag = ( 'div' === $args['style'] ) ? 'div' : 'li';

        $template_file = dirname( $current_module['comments-template'] ) . DS . 'comments-template' . DS . 'html5_comment.php';
        if( is_file( $template_file ) ):
            include $template_file;
        else:
?>
        <<?php echo $tag; ?> id="comment-<?php comment_ID(); ?>" <?php comment_class( empty( $args['has_children'] ) ? '' : 'parent' ); ?>>
            <article id="div-comment-<?php comment_ID(); ?>" class="comment-body">
                <footer class="comment-meta">
                    <div class="comment-author vcard">
                        <?php if ( 0 != $args['avatar_size'] ) echo get_avatar( $comment, $args['avatar_size'] ); ?>
                        <?php printf( __( '%s <span class="says">says:</span>' ), sprintf( '<b class="fn">%s</b>', get_comment_author_link() ) ); ?>
                    </div><!-- .comment-author -->

                    <div class="comment-metadata">
                        <a href="<?php echo esc_url( get_comment_link( $comment->comment_ID, $args ) ); ?>">
                            <time datetime="<?php comment_time( 'c' ); ?>">
                                <?php printf( _x( '%1$s at %2$s', '1: date, 2: time' ), get_comment_date(), get_comment_time() ); ?>
                            </time>
                        </a>
                        <?php edit_comment_link( __( 'Edit' ), '<span class="edit-link">', '</span>' ); ?>
                    </div><!-- .comment-metadata -->

                    <?php if ( '0' == $comment->comment_approved ) : ?>
                    <p class="comment-awaiting-moderation"><?php _e( 'Your comment is awaiting moderation.' ); ?></p>
                    <?php endif; ?>
                </footer><!-- .comment-meta -->

                <div class="comment-content">
                    <?php comment_text(); ?>
                </div><!-- .comment-content -->

                <div class="reply">
                    <?php comment_reply_link( array_merge( $args, array( 'add_below' => 'div-comment', 'depth' => $depth, 'max_depth' => $args['max_depth'] ) ) ); ?>
                </div><!-- .reply -->
            </article><!-- .comment-body -->
        <?php endif; //include template file?>

<?php
    }
}