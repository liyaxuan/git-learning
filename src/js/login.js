define(['angular', 'angular-ui-router', 'jquery-cookie', 'md5', 'ajax'], function () {
	angular.module("loginModu", ["ui.router", "ajaxModu"])
	.controller("loginCtrl", ["$scope", "$state", "ajaxServ", "failServ", function ($scope, $state, ajaxServ, failServ) {
		$scope.version="5月10日 0:56更新"

		$scope.uid=$.cookie("admin-uid")||"";
		$scope.pwd="";
		$scope.isUidError=false;
		$scope.uidTip="";
		$scope.isPwdError=true;
		$scope.pwdTip="";
		
		$scope.login=function () {
			var form={
				"uid": $scope.uid,
				"pwd": hex_md5($scope.uid+$scope.pwd)
			}

			$scope.isUidError=false;
			$scope.isPwdError=false;

			var result=false;

			if($scope.uid=="") {
				$scope.isUidError=true;
				$scope.uidTip="用户名不能为空";
				result=result||$scope.isUidError;
			}
			if($scope.pwd=="") {
				$scope.isPwdError=true;
				$scope.pwdTip="密码不能为空";
				result=result||$scope.isPwdError;			
			}
			if(!result)
				ajaxServ.post("login", 0, function (data) {
					$.cookie("admin-uid", $scope.uid, { path: "/" });
					$.cookie("admin-token", data.token, { path: "/" });
					$state.go("home");			
				}, function (errorObj) {
					data=errorObj.data
					if(data.error_code=="E43"&&data.error_info=="wrong_uid") {
						$scope.isUidError=true;
						$scope.uidTip="用户名不存在";					
					}
					else if(data.error_code=="E45"&&data.error_info=="wrong_password") {
						$scope.isPwdError=true;
						$scope.pwdTip="密码错误";
					}
					else {
						failServ(errorObj);
					}
				}, form, {});
		};

	}]);
});