define(['angular', 'angular-ui-router', 'jquery-cookie', 'component', 'ajax'], function () {
	function MessageControllerProvider(boxType) {
		function MessageController($scope, ajaxServ, failServ) {
			$scope.list=[];
			$scope.curPage=1;
			$scope.maxPage=1;

			var option=boxType=="notice"?"notice":"message";

			$scope.refresh=function () {
				var parameter={
					page_num: $scope.curPage,
					uid: $.cookie("admin-uid"),
					token: $.cookie("admin-token")
				};
				if(boxType!="notice")
					parameter["in_out"]=boxType;

				ajaxServ.get(option, "list", function (data) {
					$scope.list=data.msgs;
					$scope.maxPage=data.max_page;
						
				}, failServ, parameter);
			};

			$scope.delete=function (index) {
				var parameter={
					uid: $.cookie("admin-uid"),
					token: $.cookie("admin-token")					
				};
				if(boxType=="notice")
					parameter["notice_id"]=$scope.list[index]["notice_id"];
				else {
					parameter["in_out"]=boxType;
					parameter["msg_id"]=$scope.list[index].id;
				}
				if(confirm("确定删除?"))
					ajaxServ.delete(option, "delete", function (data) {
						alert("删除成功");
						$scope.refresh();
					}, failServ, parameter);
			};

		}

		return 	["$scope", "ajaxServ", "failServ", MessageController];
	}

	angular.module("userModu", ["ui.router", "componentModu", "ajaxModu"])
	.controller("userCtrl", ["$scope", "ajaxServ", "failServ", function ($scope, ajaxServ, failServ) {
		$scope.isClass = false;
		$scope.isAuthor = false;

		$scope.list=[];
		$scope.search = { keyword: '', page_num: 1 };
		$scope.maxPage=1;

		$scope.refresh=function () {
			ajaxServ.get("user", "list", function (data) {
				$scope.list=data.users;
				$scope.maxPage=data.max_page;				
			}, failServ, {
				page_num: $scope.search.page_num,
				keyword: $scope.search.keyword,
				uid: $.cookie("admin-uid"),
				token: $.cookie("admin-token")
			});
		};

		$scope.mail=function (index) {
			$scope.isLayerOpen=true;
			$scope.isDisabled=true;
			$scope.uid_to=$scope.list[index].uid;
		};

		$scope.delete=function (index) {
			var userId=$scope.list[index].uid;
			if(userId=="admin001")
				alert("禁止删除admin001");		
			else
				if(confirm("确定删除用户 "+userId+"?"))
					ajaxServ.delete("user", "delete", function () {
						alert("删除成功");
						$scope.refresh();
					}, failServ, {
						_uid: userId,
						uid: $.cookie("admin-uid"),
						token: $.cookie("admin-token")
					});
		};

		$scope.open=function (index) {
			var pos=$(".user-list").find(".item").eq(index+1).find(".img").position();
			ajaxServ.get("user", "detail", function (data) {
				$scope.curUser=data.user;
				$(".user-detail").css("left", pos.left+48+"px");
				$(".user-detail").css("top", pos.top+"px");
				$scope.isDetailOpen=true;
			}, failServ, {
				"_uid": $scope.list[index].uid,
				uid: $.cookie("admin-uid"),
				token: $.cookie("admin-token")
			});		
		};

		$scope.close=function (index) {
			$scope.isDetailOpen=false;
		};	

		$scope.curUser={};		
	}])
	.controller("messageCtrl", ["$scope", function ($scope) {
		$scope.isLayerOpen=false;
		$scope.isDisabled=true;
		
		$scope.open=function () {
			$scope.uidTo="所有人";
			$scope.isLayerOpen=true;
		};
	}])
	.controller("noticeCtrl", MessageControllerProvider("notice"))
	.controller("messageReceiveCtrl", MessageControllerProvider("inbox"))
	.controller("messageSendCtrl", MessageControllerProvider("outbox"))
	.controller("commentCtrl", ["$scope", "ajaxServ", "failServ", function ($scope, ajaxServ, failServ) {
		$scope.list=[];
		$scope.search = { keyword: '', page_num: 1 };
		$scope.maxPage=1;

		$scope.delete=function (index) {
			if(confirm("确定删除评论" + $scope.list[index].id + "?"))
				ajaxServ.delete("comment", "delete", function () {
					alert("删除成功");
					$scope.refresh();
				}, failServ, {
					"entity_type": $scope.list[index].entity_type,
					"entity_id": $scope.list[index].entity_id,
					"comment_id": $scope.list[index].id,
					"uid": $.cookie("admin-uid"),
					"token": $.cookie("admin-token")
				});
		};

		$scope.refresh=function () {
			ajaxServ.get("comment", "list", function (data) {
				$scope.list=data.comments;
				for(var i=0;i<$scope.list.length;i++)
					$scope.list[i].link="http://xunsheng90.com/entity/" + $scope.list[i].entity_type + "/" + $scope.list[i].entity_id;
				$scope.maxPage=data.max_page;
			}, failServ, {
				"page_num": $scope.search.page_num,
				"keyword": $scope.search.keyword,
				"uid": $.cookie("admin-uid"),
				"token": $.cookie("admin-token")
			});
		};
	}]);
});