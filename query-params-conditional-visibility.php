<?php
/**
 * Plugin Name:     Query Params Conditional Visibility
 * Plugin URI:      https://github.com/natbienetre/wordpress-query-param-conditional-visibility
 * Description:     A WordPress plugin to conditionally show or hide blocks based on query params.
 * Author:          Pierre PERONNET
 * Author URI:      https://github.com/holyhope
 * Funding URI:     https://github.com/sponsors/holyhope
 * Text Domain:     query-params-conditional-visibility
 * Domain Path:     /languages
 * Version:         0.1.0
 *
 * @package         Query_Params_Conditional_Visibility
 */

/**
 * Load plugin textdomain.
 */
function qpcv_load_textdomain() {
    load_plugin_textdomain( 'query-params-conditional-visibility', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'init', 'qpcv_load_textdomain' );

function qpcv_enqueue_blocks_script() {
    $metadata = include path_join( __DIR__, 'build/editor.asset.php' );

    wp_enqueue_script(
        'qpcv-editor',
        plugins_url( 'build/editor.js', __FILE__ ),
        $metadata['dependencies'],
        $metadata['version'],
    );
}
add_action( 'enqueue_block_editor_assets', 'qpcv_enqueue_blocks_script' );

function qpcv_register_script() {
    $metadata = include path_join( __DIR__, 'build/front.asset.php' );

    wp_enqueue_script(
        'qpcv-front',
        plugins_url( 'build/front.js', __FILE__ ),
        $metadata['dependencies'],
        $metadata['version'],
        array(
            'defer'     => true,
            'in_footer' => true,
        )
    );
    $metadata = include path_join( __DIR__, 'build/front.asset.php' );

    wp_enqueue_style( 'qpcv-front', plugins_url( 'build/front.css', __FILE__ ) );
}
add_action( 'wp_enqueue_scripts', 'qpcv_register_script' );
