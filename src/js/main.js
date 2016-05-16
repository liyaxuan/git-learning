define(['angular', 'angular-ui-router', 'jquery-cookie', 'ajax', 'component'], function () {
	angular.module("mainModu", ["ui.router", "ajaxModu", 'componentModu'])
	.controller("mainCtrl", ["$scope", "$state", "$interval", "ajaxServ", 'failServ', function ($scope, $state, $interval, ajaxServ, failServ) {
		$scope.nav=[{
				link: "home",
				icon: "home",
				text: "首页"
			}, {
				link: "banner",
				icon: "image",
				text: "Banner"
			}, {
				link: "vwork-list",
				icon: "whatshot",
				text: "精选"
			}, {
				link: "uwork-list",
				icon: "filter_vintage",
				text: "朗读"
			}, {
				link: "article-list",
				icon: "description",
				text: "动态"
			}, {
				link: "class",
				icon: "view_column",
				text: "分类"
			}, {
				link: "activity",
				icon: "toys",
				text: "活动"
			}, {
				link: "user",
				icon: "person_pin",
				text: "用户"
			}, {
				link: "message",
				icon: "mail",
				text: "消息"
			}, {
				link: "comment",
				icon: "comment",
				text: "评论"
			}
		];

		$scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
			if(!$.cookie("admin-token")) {
				$state.go("login");
				alert("滚去登录 (ノ｀Д´)ノ");
			}
				
			document.title=toState.name;

			for(var i=0;i<$scope.nav.length;i++) {
				var l=$scope.nav[i].link, n=toState.name;
				var a=l.indexOf("-")==-1?l:l.slice(0, l.indexOf("-"));
				var b=n.indexOf("-")==-1?n:n.slice(0, n.indexOf("-"));
				if(a==b||(a=="vwork"&&b=="uwork")) {
					$scope.current=i;
				}				
			}			
		});

		$interval(function () {
			ajaxServ.put("login", "update", function (data) {
				$.cookie("admin-token", data.token, { path: "/" });
			}, failServ, {}, {
				"uid": $.cookie("admin-uid"),
				"token": $.cookie("admin-token")
			});
		}, 240*1000);
	}])
	.controller('homeCtrl', ['$scope', 'ajaxServ', 'failServ', function ($scope, ajaxServ, failServ) {
		ajaxServ.get('meta', '', function (data) {
			delete data.status;	
			for(var x in data.entity) {
				data[x] = {};
				for(var y in data.entity[x]) {
					data[x][y] = data.entity[x][y];
				}
			}
			delete data.entity;
			console.log(data);
			$scope.data = data;
		}, failServ, {
			"uid": $.cookie("admin-uid"),
			"token": $.cookie("admin-token")			
		});
	}]);
});