<?php if(empty($link)) $link = "javascript: void(0);" ?>
<div <?php echo $sed_attrs; ?> class="sed-button module module-button skin-default <?php echo $class;?>"   >
	<a  href="<?php echo $link; ?>" target="<?php echo $link_target;?>" class=" btn <?php echo $size; ?> <?php echo $type; ?> " title="<?php echo $title; ?>">
		<?php echo $content ?>
	</a>
</div>
