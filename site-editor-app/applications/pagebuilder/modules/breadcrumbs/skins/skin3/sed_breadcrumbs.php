<?php
$counter = 0;

if($length == "boxed")
    $length_class = "sed-row-boxed";
else
    $length_class = "sed-row-wide";

?>
<nav <?php echo $sed_attrs; ?> class="<?php echo $class ?> module module-breadcrumbs breadcrumbs-skin3 <?php echo $length_class;?> "  length_element>
    <ul>
        <?php foreach ( $breadcrumbs as $index => $item ): ?>
            <li <?php if ( empty( $item['href'] ) ): ?> class="current" <?php endif;?>>
            <?php if ( !empty( $item['href'] ) ): ?>
                <a href="<?php echo $item['href'] ?>" class="<?php if( isset( $item["type"] ) && $item["type"] == 'home' ) echo 'home-breadcrumb'; ?>">
                    <?php if( isset( $item["type"] ) && $item["type"] == 'home' ){ ?>
                        <i class="fa fa-home" ></i>
                    <?php }else{ echo $item['text'];}  ?>
                </a>
            <?php else: ?>
                <span class="<?php if( isset( $item["type"] ) && $item["type"] == 'home' ) echo 'home-breadcrumb'; ?>">
                    <?php if( isset( $item["type"] ) && $item["type"] == 'home' ){ ?>
                        <i class="fa fa-home" ></i>
                    <?php }else{ echo $item['text'];}  ?>
                </span>
            <?php endif;?>
            </li>
        <?php endforeach; ?>
    </ul>
</nav>