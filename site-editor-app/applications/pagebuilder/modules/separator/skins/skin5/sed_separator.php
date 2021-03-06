<div <?php echo $sed_attrs; ?>  class="s-tb-sm module module-separator separator-skin5 <?php echo $class;?>" >
  <div class="separator-inner">
    <div class="spr-container spr-left">
      <div class="<?php echo $border_style;?> spr-horizontal separator"></div>
    </div>
    <?php echo $content;?>
    <div class="spr-container spr-right">
      <div class="<?php echo $border_style;?> spr-horizontal separator"></div>
    </div>
  </div>
</div>
<?php
  global $sed_dynamic_css_string;
  $selector = ( site_editor_app_on() ) ? '[sed_model_id="' . $sed_model_id . '"]' : '.'.$sed_custom_css_class;
  ob_start();
  ?>
      <?php echo $selector; ?>.module-separator {
          max-width: <?php echo $max_width;?>px;
      }
  <?php
  $css = ob_get_clean();
  $sed_dynamic_css_string .= $css;