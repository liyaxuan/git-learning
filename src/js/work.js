var workModule=angular.module("WorkModule", ["ui.router", "MainModule", "AJAXModule"]);

workModule.controller("AWListController", AAWListControllerProvider());

var WorkEditConfig={
	type: "vwork",
	link: "vwork-list",
	inject: function (scope, CommonAJAX, fail) {
		scope.curPage=1;
		scope.maxPage=1;
		scope.author=[];
		scope.isAuthorList=false;

		scope.refreshAuthor=function () {
			CommonAJAX.get("user", "list", function (data) {
				scope.author=data.users;
				scope.maxPage=data.max_page;
			}, fail, {
				page_num: scope.curPage,
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
}

workModule.controller("WorkEditController", EditControllerProvider(WorkEditConfig))

workModule.controller("ClassController", ["$scope", "CommonAJAX", "fail", function ($scope, CommonAJAX, fail) {

	$scope.refresh=function () {
		CommonAJAX.get("class", 0, function (data) {
			$scope.vworkClass=[];
			for(var i=0;i<data.class_name.length;i++)
				$scope.vworkClass.push(data.class_name[i]);
		}, fail, { entity_type: "vwork" });

		CommonAJAX.get("class", 0, function (data) {
			$scope.articleClass=[];
			for(var i=0;i<data.class_name.length;i++)
				$scope.articleClass.push(data.class_name[i]);
		}, fail, { entity_type: "article" });
	};

	$scope.select=function (type) {
		$scope.current=type;
	};

	$scope.submit=function () {
		CommonAJAX.post("class", 1, $scope.refresh, fail, {
			class_name: $scope.className
		},{
			entity_type: $scope.current,
			uid: $.cookie("admin-uid"),
			token: $.cookie("admin-token")
		});
	};

	$scope.delete=function (type, className) {
		CommonAJAX.delete("class", 2, $scope.refresh, fail, {
			entity_type: type,
			uid: $.cookie("admin-uid"),
			token: $.cookie("admin-token"),
			class_name: className
		});
	};

	$scope.className="";
	$scope.current="vwork";
	$scope.vworkClass=[];
	$scope.articleClass=[];

	$scope.refresh();

}]);