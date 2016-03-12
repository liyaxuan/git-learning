var appModule=angular.module("AppModule",
	["ui.router", "AJAXModule",
	"LoginModule", "MainModule", "BannerModule", 
	"WorkModule", "ArticleModule", "ActivityModule",
	"UserModule"]);

appModule.config(["$urlRouterProvider", "$stateProvider", function ($urlRouterProvider, $stateProvider) {
	$urlRouterProvider.otherwise("/login");
	$stateProvider.state("login", {
		url: "/login",
		templateUrl: "src/page/login.html",
		controller: "LoginController"
	}).state("main", {
		url: "/main",
		templateUrl: "src/page/main.html",
		controller: "MainController"
	}).state("home", {
		parent: "main",
		url: "/home",
		templateUrl: "src/page/home.html"
	}).state("banner", {
		parent: "main",
		url: "/banner",
		templateUrl: "src/page/banner.html",
		controller: "BannerController"
	}).state("vwork-list", {
		parent: "main",
		url: "/vwork-list",
		data: { entity_type: "vwork" },
		templateUrl: "src/page/article-work-list.html",		
		controller: "AWListController"
	}).state("uwork-list", {
		parent: "main",
		url: "/uwork-list",
		data: { entity_type: "uwork" },
		templateUrl: "src/page/article-work-list.html",		
		controller: "AWListController"
	}).state("class", {
		parent: "main",
		url: "/class",
		templateUrl: "src/page/class.html",
		controller: "ClassController"
	}).state("article-list", {
		parent: "main",
		url: "/article-list",
		data: { entity_type: "article" },
		templateUrl: "src/page/article-work-list.html",
		controller: "AWListController"
	}).state("article-edit", {
		parent: "main",
		url: "/article-edit/:id",
		params: {
			id: ""
		},
		templateUrl: "src/page/article-edit.html",
		controller: "ArticleEditController"
	}).state("vwork-edit", {
		parent: "main",
		url: "/vwork-edit/:id",
		params: {
			id: ""
		},
		templateUrl: "src/page/vwork-edit.html",
		controller: "WorkEditController"
	}).state("activity", {
		parent: "main",
		url: "/activity",
		templateUrl: "src/page/activity.html",
		controller: "ActivityController"
	}).state("user", {
		parent: "main",
		url: "/user",
		templateUrl: "src/page/user.html",
		controller: "UserController"
	}).state("message", {
		parent: "main",
		url: "/message",
		templateUrl: "src/page/message.html",
		controller: "MessageController"
	}).state("comment", {
		parent: "main",
		url: "/comment",
		templateUrl: "src/page/comment.html",
		controller: "CommentController"
	});
}]);