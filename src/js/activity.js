define(['angular', 'angular-ui-router', 'jquery-cookie', 'component', 'ajax'], function () {
	angular.module("activityModu", ["ui.router", "componentModu", "ajaxModu"])
	.controller("activityCtrl", ["$scope", "entityServ", "ajaxServ", "failServ", function ($scope, entityServ, ajaxServ, failServ) {
		$scope.list=[];
		$scope.curId="";

		$scope.search=entityServ.getSearchFormat();
		$scope.search.entity_type="activity";
		$scope.search.page_num=1;
		$scope.maxPage=1;

		$scope.formTitle="新建活动";
		$scope.input=entityServ.getPostFormat();

		$scope.new=function () {
			$scope.curId="";
			$scope.formTitle="新建活动";
			$scope.input=entityServ.getPostFormat();
		};

		$scope.submit=function () {
			if($scope.curId=="")
				ajaxServ.post("entity", "post", function () {
					alert("新建成功");
					$scope.refresh();
				}, failServ, $scope.input, {
					entity_type: "activity",
					uid: $.cookie("admin-uid"),
					token: $.cookie("admin-token")
				});
			else
				ajaxServ.put("entity", "put", function () {
					alert("编辑成功");
					$scope.refresh();
				}, failServ, $scope.input, {
					entity_type: "activity",
					entity_id: $scope.curId,
					uid: $.cookie("admin-uid"),
					token: $.cookie("admin-token")
				});

			$scope.new();
		};

		$scope.delete=function (index) {
			if(confirm("确定要删除活动《"+$scope.list[index].title+"》?")) {
				ajaxServ.delete("entity", "delete", function () {
						alert("删除成功");
						$scope.refresh();
					}, failServ, {
						entity_type: "activity",
						entity_id: $scope.list[index].id,
						uid: $.cookie("admin-uid"),
						token: $.cookie("admin-token")
				});
			}
		};

		$scope.edit=function (index) {
			$scope.formTitle="编辑活动";

			ajaxServ.get("entity", "detail", function (data) {
				$scope.input=data.entity;
				$scope.curId=$scope.list[index].id;		
			}, failServ, {
				entity_type: "activity",
				entity_id: $scope.list[index].id
			});	
		};

		$scope.refresh=function () {
			ajaxServ.get("entity", "get", function (data) {
				$scope.list=data.entities;
				$scope.maxPage=data.max_page;
			}, failServ, $scope.search);
		};
	}]);	
});