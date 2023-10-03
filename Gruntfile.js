const { basename } = require('path');

module.exports = function( grunt ) {

	'use strict';

	const fs = require('fs');

	// Project configuration
	grunt.initConfig( {

		pkg: grunt.file.readJSON( 'package.json' ),

		addtextdomain: {
			options: {
				textdomain: 'query-params-conditional-visibility',
			},
			update_all_domains: {
				options: {
					updateDomains: true
				},
				src: [ '*.php', '**/*.php', '!\.git/**/*', '!bin/**/*', '!node_modules/**/*', '!tests/**/*' ]
			}
		},

		wp_readme_to_markdown: {
			your_target: {
				files: {
					'README.md': 'readme.txt'
				}
			},
		},

		makepot: {
			target: {
				options: {
					domainPath: '/languages',
					exclude: [ '\.git/*', 'bin/*', 'node_modules/*', 'tests/*' ],
					mainFile: 'query-params-conditional-visibility.php',
					potFilename: 'query-params-conditional-visibility.pot',
					potHeaders: {
						poedit: true,
						'x-poedit-keywordslist': true
					},
					type: 'wp-plugin',
					updateTimestamp: true,
					updatePoFiles: true,
				}
			}
		},

		po2mo: Object.fromEntries(fs
			.readdirSync( 'languages' )
			.filter( function( item ) {
				return item.match( /\.po$/ );
			})
			.map( function( item ) {
				const base = basename(item, '.po');
				return [base, {
					src: `languages/${item}`,
					dest: `languages/${base}.mo`,
				}];
			})
		),
	} );

	grunt.loadNpmTasks( 'grunt-wp-i18n' );
	grunt.loadNpmTasks( 'grunt-wp-readme-to-markdown' );
	grunt.loadNpmTasks( '@floatwork/grunt-po2mo' );

	grunt.registerTask( 'default', [ 'i18n','readme' ] );
	grunt.registerTask( 'i18n', ['addtextdomain', 'makepot'] );
	grunt.registerTask( 'readme', ['wp_readme_to_markdown'] );

	grunt.util.linefeed = '\n';

};
