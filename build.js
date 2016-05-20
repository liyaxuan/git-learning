({ 
    appDir: './',
    baseUrl: './',
    dir: '../dist',
    modules: [
        { name: 'router' }
    ],
    
    fileExclusionRegExp: /^.|node_modules|(r|build|gulpfile)\.js|*\.less|(koala-config|package)\.json$/,
    optimizeCss: 'standard',
    removeCombined: true,
    skipModuleInsertion: true
})