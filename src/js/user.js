var userModule=angular.module("UserModule", ["ui.router", "MainModule", "AJAXModule"]);

userModule.filter("MessageTime", function () {
	return function (time) {
		var lds=(new Date()).toLocaleDateString();
		time=time.split(" ");
		day=time[0].split("-");
		lds=lds.split("/");

		var result=true;
		for(var i=0;i<3;i++)
			result=result&&(parseInt(lds[i])==parseInt(day[i]));

		if(result)
			return time[1].slice(0, time[1].length-3);			
		else
			if(lds[0]==day[0])
				return time[0].slice(5, time[0].length);
			else
				return time[0];
	}
});

function MessageControllerProvider(boxType) {
	function MessageController($scope, CommonAJAX, fail) {

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

			CommonAJAX.get(option, "list", function (data) {
				$scope.list=data.msgs;
				$scope.maxPage=data.max_page;
					
			}, fail, parameter);
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
				CommonAJAX.delete(option, "delete", function (data) {
					alert("删除成功");
					$scope.refresh();
				}, fail, parameter);
		};

	}

	return 	["$scope", "CommonAJAX", "fail", MessageController];
}


userModule.controller("UserController", ["$scope", "CommonAJAX", "fail", function ($scope, CommonAJAX, fail) {

	$scope.list=[];
	$scope.curPage=1;
	$scope.maxPage=1;

	$scope.refresh=function () {
		CommonAJAX.get("user", "list", function (data) {
			$scope.list=data.users;
			$scope.maxPage=data.max_page;				
		}, fail, {
			page_num: $scope.curPage,
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
				CommonAJAX.delete("user", "delete", function () {
					alert("删除成功");
					$scope.refresh();
				}, fail, {
					_uid: userId,
					uid: $.cookie("admin-uid"),
					token: $.cookie("admin-token")
				});
	};

	$scope.open=function (index) {
		var pos=$(".user-list").find(".item").eq(index+1).find(".img").position();
		CommonAJAX.get("user", "detail", function (data) {
			$scope.curUser=data.user;
			$(".user-detail").css("left", pos.left+48+"px");
			$(".user-detail").css("top", pos.top+"px");
			$scope.isDetailOpen=true;
		}, fail, {
			"_uid": $scope.list[index].uid,
			uid: $.cookie("admin-uid"),
			token: $.cookie("admin-token")
		});		
	};

	$scope.close=function (index) {
		$scope.isDetailOpen=false;
	};	

	$scope.curUser={};
	
}]);

userModule.controller("MessageController", ["$scope", function ($scope) {
	$scope.isLayerOpen=false;
	$scope.isDisabled=true;
	$scope.uid_to="所有人";
	$scope.open=function () {
		$scope.isLayerOpen=true;
	};
}]);

userModule.controller("NoticeController", MessageControllerProvider("notice"));

userModule.controller("MessageReceiveController", MessageControllerProvider("inbox"));

userModule.controller("MessageSendController", MessageControllerProvider("outbox"));

userModule.controller("CommentController", ["$scope", "CommonAJAX", "fail", function ($scope, CommonAJAX, fail) {

	$scope.list=[];
	$scope.curPage=1;
	$scope.maxPage=1;

	$scope.delete=function (index) {
		if(confirm("确定删除评论"+$scope.list[index].id+"?"))
			CommonAJAX.delete("comment", "delete", function () {
				alert("删除成功");
				$scope.refresh();
			}, fail, {
				"entity_type": $scope.list[index].entity_type,
				"entity_id": $scope.list[index].entity_id,
				"comment_id": $scope.list[index].id,
				"uid": $.cookie("admin-uid"),
				"token": $.cookie("admin-token")
			});
	};

	$scope.refresh=function () {
		CommonAJAX.get("comment", "list", function (data) {
			$scope.list=data.comments;
			for(var i=0;i<$scope.list.length;i++)
				$scope.list[i].link="http://xunsheng90.com/entity/"+$scope.list[i].entity_type+"/"+$scope.list[i].entity_id;
			$scope.maxPage=data.max_page;
		}, fail, {
			"page_num": $scope.curPage,
			"uid": $.cookie("admin-uid"),
			"token": $.cookie("admin-token")
		});
	};

}]);