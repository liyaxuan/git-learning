define(['provider', 'angular', 'jquery-cookie', 'component', 'angular-ui-router', 'ajax'], function (provider) {
	var config = {
		type: "vwork",
		link: "vwork-list",
		inject: function (scope, ajaxServ, failServ) {
			scope.search = {
				page_num: 1,
				keyword: ''
			};

			scope.maxPage=1;
			scope.author=[];
			scope.isAuthorList=false;

			scope.isAuthor = false;
			scope.isClass = false;

			scope.refreshAuthor=function () {
				ajaxServ.get("user", "list", function (data) {
					scope.author=data.users;
					scope.maxPage=data.max_page;
				}, failServ, {
					page_num: scope.search.page_num,
					keyword: scope.search.keyword,
					uid: $.cookie("admin-uid"),
					token: $.cookie("admin-token")
				});	
			};

			scope.toggleAuthorList=function () {
				scope.isAuthorList=!scope.isAuthorList;
				$("#author-list-body").css("left", $("#author-list-header").position().left+116+"px");
				$("#author-list-body").css("top", $("#author-list-header").position().top+64+"px");
			};
			
			scope.selectAuthor=function (index) {
				scope.authorImg=scope.author[index].headimg;
				scope.input.author_uid=scope.author[index].uid;
				scope.isAuthorList=false;
			};

			var release=scope.$watch("author", function (newValue, oldValue, context) {
				if(newValue.length!=0) {
					scope.selectAuthor(0);
					release();				
				}
			});
		},
		initSimditor: function (scope, Plugin) {
			var toolbar_author=["title", "bold", "image", "alignment"];
			var toolbar_work=["title", "bold", "italic", "underline", "strikethrough","color", "|", "ol", "ul", "blockquote", "|", "link", "image", "hr", "|", "indent", "outdent", "alignment"];
			scope.authorEditor=Plugin.newSimditor("#author", toolbar_author);
			scope.workEditor=Plugin.newSimditor("#work", toolbar_work);
		},
		basicCheck: function (scope) {
			scope.warn[4]=scope.input["author_content"]=="";
			if(scope.isAudio) {
				scope.warn[6]=scope.input["audio"]=="";
				scope.warn[7]=scope.input["audio_name"]=="";
			}
			else {
				scope.warn[9]=scope.input["video_name"]=="";
				if(scope.videoChoice=="file") {
					scope.warn[8]=scope.input["video"]=="";
				}
				else {
					scope.warn[10]=scope.input["video_code"]=="";
				}
			}		
		},
		attachmentCheck: function (scope) {
			return true;
		},
		setValueBeforeSubmit: function (scope) {
			scope.input.author_content=scope.authorEditor.getValue();
			scope.input.main_content=scope.workEditor.getValue();
		},
		setValueBeforeEdit: function (scope,data) {
			scope.authorImg=data.entity.author.headimg;
			scope.input.author_uid=data.entity.author.uid;

			$(".simditor-body").eq(0).html(data.entity.author_content);
			$(".simditor-body").eq(1).html(data.entity.main_content);
		}
	};

	angular.module("workModu", ["ui.router", "componentModu", "ajaxModu"])
	.controller("awListCtrl", provider.list())
	.controller("workEditCtrl", provider.edit(config))
	.controller("classCtrl", ["$scope", "ajaxServ", "failServ", function ($scope, ajaxServ, failServ) {
		$scope.refresh = function () {
			ajaxServ.get("class", 'get', function (data) {

				$scope.className = data.class_name;

				console.log($scope.className)
			}, failServ, { 'entity_type': $scope.current });
		};

		$scope.select = function (type) {
			$scope.current = type;
			$scope.refresh();
		};

		$scope.submit = function () {
			if(!$scope.classNameInput) {
				alert("分类不能为空值");
			}
			else
				ajaxServ.post("class", 'post', function () {
					$scope.refresh();
					alert('新建成功');
				}, failServ, {
					class_name: $scope.classNameInput
				},{
					entity_type: $scope.current,
					uid: $.cookie("admin-uid"),
					token: $.cookie("admin-token")
				});
		};

		$scope.delete = function (type, classNameToDelete) {
			if(confirm("确认删除分类\"" + classNameToDelete + "\"?"))
				ajaxServ.delete("class", 'delete', function () {
					$scope.refresh();
					alert('删除成功');
				}, failServ, {
					entity_type: type,
					uid: $.cookie("admin-uid"),
					token: $.cookie("admin-token"),
					class_name: classNameToDelete
				});
		};

		$scope.classNameInput = "";
		$scope.current = "vwork";
		$scope.className = [];

		$scope.refresh();
	}]);	
});