<?php if(empty($link)) $link = "javascript: void(0);" ?> 
<div <?php echo $sed_attrs; ?> class="sed-button module module-button button-skin4 <?php echo $class;?>"  >
	<a  href="<?php echo $link; ?>" target="<?php echo $link_target;?>" class="sed-button btn <?php echo $type;?>  <?php echo $size; ?> " title="<?php echo $title; ?>">
        <div class="button-icon icon-button-df"><i class="<?php echo $icon; ?>"></i></div>  		
		<?php echo $content ?>
	</a>
</div>
