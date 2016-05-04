define(['angular', 'angular-ui-router', 'ajax', 'login', 'main', 'banner', 'work', 'article', 'activity', 'user'], function () {
	var router = angular.module("routerModu", ["ui.router", "ajaxModu", "loginModu", "mainModu", "bannerModu", "workModu", "articleModu", "activityModu","userModu"]);

	router.config(["$urlRouterProvider", "$stateProvider", function ($urlRouterProvider, $stateProvider) {
		$urlRouterProvider.otherwise("/login");

		$stateProvider.state("login", {
			url: "/login",
			templateUrl: "src/view/login.html",
			controller: "loginCtrl"
		}).state("main", {
			url: "/main",
			templateUrl: "src/view/main.html",
			controller: "mainCtrl"
		}).state("home", {
			parent: "main",
			url: "/home",
			templateUrl: "src/view/home.html"
		}).state("banner", {
			parent: "main",
			url: "/banner",
			templateUrl: "src/view/banner.html",
			controller: "bannerCtrl"
		}).state("vwork-list", {
			parent: "main",
			url: "/vwork-list",
			data: { entity_type: "vwork" },
			templateUrl: "src/view/article-work-list.html",		
			controller: "awListCtrl"
		}).state("uwork-list", {
			parent: "main",
			url: "/uwork-list",
			data: { entity_type: "uwork" },
			templateUrl: "src/view/article-work-list.html",		
			controller: "awListCtrl"
		}).state("class", {
			parent: "main",
			url: "/class",
			templateUrl: "src/view/class.html",
			controller: "classCtrl"
		}).state("article-list", {
			parent: "main",
			url: "/article-list",
			data: { entity_type: "article" },
			templateUrl: "src/view/article-work-list.html",
			controller: "awListCtrl"
		}).state("article-edit", {
			parent: "main",
			url: "/article-edit/:id",
			params: {
				id: ""
			},
			templateUrl: "src/view/article-edit.html",
			controller: "articleEditCtrl"
		}).state("vwork-edit", {
			parent: "main",
			url: "/vwork-edit/:id",
			params: {
				id: ""
			},
			templateUrl: "src/view/work-edit.html",
			controller: "workEditCtrl"
		}).state("activity", {
			parent: "main",
			url: "/activity",
			templateUrl: "src/view/activity.html",
			controller: "activityCtrl"
		}).state("user", {
			parent: "main",
			url: "/user",
			templateUrl: "src/view/user.html",
			controller: "userCtrl"
		}).state("message", {
			parent: "main",
			url: "/message",
			templateUrl: "src/view/message.html",
			controller: "messageCtrl"
		}).state("comment", {
			parent: "main",
			url: "/comment",
			templateUrl: "src/view/comment.html",
			controller: "commentCtrl"
		});
	}]);

	angular.bootstrap(document, ['routerModu']);
});