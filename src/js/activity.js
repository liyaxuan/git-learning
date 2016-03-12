var activityModule=angular.module("ActivityModule", ["ui.router", "MainModule", "AJAXModule"]);

activityModule.filter("time", function () {
	return function (time) {
		time=time.slice(time.indexOf("-")+1);
		var pattern=/[0-9]+-[0-9]+/;
		return pattern.exec(time)[0];
	}
});

activityModule.controller("ActivityController", ["$scope", "Entity", "CommonAJAX", function ($scope, Entity, CommonAJAX) {
	$scope.list=[];
	$scope.curId="";

	$scope.search=Entity.getSearchFormat();
	$scope.search.entity_type="activity";
	$scope.search.page_num=1;
	$scope.maxPage=1;

	$scope.formTitle="新建活动";
	$scope.input=Entity.getPostFormat();
	$scope.setInput=function (attribute, value) {
		$scope.input[attribute]=value;
	};

	$scope.new=function () {
		$scope.formTitle="新建活动";
		$scope.input=Entity.getPostFormat();

		$(".file-input").find("img").attr("src", "img/img_pre.jpg");
	};

	$scope.submit=function () {
		if($scope.curId=="")
			CommonAJAX.post("entity", "post", function () {
				$scope.refresh();
			}, function () {}, $scope.input, {
				entity_type: "activity",
				uid: $.cookie("admin-uid"),
				token: $.cookie("admin-token")
			});
		else
			CommonAJAX.put("entity", "put", $scope.refresh, function () {}, $scope.input, {
				entity_type: "activity",
				entity_id: $scope.curId,
				uid: $.cookie("admin-uid"),
				token: $.cookie("admin-token")
			});
	};

	$scope.delete=function (index) {
		if(confirm("确定要删除活动《"+$scope.list[index].title+"》?")) {
			CommonAJAX.delete("entity", "delete", function () {
					alert("删除成功");
					$scope.refresh();
				}, function () {}, {
					entity_type: "activity",
					entity_id: $scope.list[index].id,
					uid: $.cookie("admin-uid"),
					token: $.cookie("admin-token")
			});
		}
	};

	$scope.edit=function (index) {
		$scope.formTitle="编辑活动";

		CommonAJAX.get("entity", "detail", function (data) {
			$scope.input=data.entity;
			$scope.curId=$scope.list[index].id;

			$(".file-input").find("img").attr("src", $scope.input.thumbnail);			
		}, function () {}, {
			entity_type: "activity",
			entity_id: $scope.list[index].id
		});	
	};

	$scope.refresh=function () {
		CommonAJAX.get("entity", "get", function (data) {
			$scope.list=data.entities;
			$scope.maxPage=data.max_page;
		}, function () {}, $scope.search);
	};

}]);