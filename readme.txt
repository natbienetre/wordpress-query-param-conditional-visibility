=== Query Param Conditional Visibility ===
Contributors: (this should be a list of wordpress.org userid's)
Donate link: https://github.com/sponsors/holyhope
Tags: frontend, block, condition, visibility, hide, show, context, static
Requires at least: 4.5
Tested up to: 6.3
Requires PHP: 5.6
Stable tag: 0.1.0
License: MPL-2.0
License URI: https://www.mozilla.org/en-US/MPL/2.0/

This plugin lets you control when a block should be hidden based on the page context.

== Description ==

Do not hide sensitive information with this.

This plugin filters the content on client side and does not requires any serverside context.
It aims to be used for static pages generation.

== Installation ==

1. Upload the zip file to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress
1. Place `<?php do_action('plugin_name_hook'); ?>` in your templates
