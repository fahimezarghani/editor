<li <?php echo $sed_attrs; ?> class="<?php echo $class;?>  module module-icons " >
	<a class="social-icon" <?php if(!empty($link)){ echo 'href="'.$link.'" target="'.$link_target.'"'; }else{ echo 'href="javascript:void(0);"'; } ?>>
        <span class="hi-icon <?php echo $icon; ?>" sed-icon="<?php echo $icon; ?>" style="font-size:<?php echo $font_size; ?>px;color:<?php echo $color; ?>">
        </span>
	</a>
</li>