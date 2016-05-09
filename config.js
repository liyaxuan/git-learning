require.config({
    paths: {
        'jquery': 'lib/jquery/jquery',
        'jquery-cookie': 'lib/jquery/jquery.cookie',

        'angular': 'lib/angular/angular',
        'angular-ui-router': 'lib/angular/angular-ui-router',
        'angular-resource': 'lib/angular/angular-resource',

        'simple-module': 'lib/simditor/js/module',
        'simple-uploader': 'lib/simditor/js/uploader',
        'simple-hotkeys': 'lib/simditor/js/hotkeys',
        'simditor': 'lib/simditor/js/simditor',

        'md5': 'lib/md5/md5',
        'plupload': 'lib/plupload/plupload.full.min',

    	'router': 'src/js/router',
        'component': 'src/js/component',
        'provider': 'src/js/provider',
    	'ajax': 'src/js/ajax',
        'login': 'src/js/login',
        'main': 'src/js/main',
        'banner': 'src/js/banner',
        'work': 'src/js/work',
        'article': 'src/js/article',
        'activity': 'src/js/activity',
        'user': 'src/js/user'
    },
    shim: {
        'jquery-cookie': ['jquery'],
        'angular-ui-router': ['angular'],
        'angular-resource': ['angular']
    }
});

require(['router'], function () {});