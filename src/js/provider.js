define(['jquery-cookie'], function () {
	return {
		list: function () {
			function ctrl($scope, $state, entityServ, ajaxServ, failServ) {
				var type=$state.current.data.entity_type;
				switch (type) {
					case "vwork":
						$scope.title="精选";
						$scope.isAuthor=true;
						$scope.isClass=true;
						$scope.isNew=true;
						$scope.isSelect=true;
						break;
					case "uwork":
						$scope.title="朗读";
						$scope.isAuthor=true;
						$scope.isClass=false;
						$scope.isNew=false;
						$scope.isSelect=true;
						break;
					case "article":
						$scope.title="动态";
						$scope.isAuthor=false;
						$scope.isClass=true;
						$scope.isNew=true;
						$scope.isSelect=false;
						break;
				}

				$scope.list=[];

				$scope.search=entityServ.getSearchFormat();
				$scope.search.entity_type=$state.current.data.entity_type;
				$scope.search.page_num=1;
				$scope.maxPage=1;

				$scope.download = function (index) {
					ajaxServ.get('entity', 'detail', function (data) {
						var url = data.entity.media.url;
						var xhr = new XMLHttpRequest();
						xhr.open('get', url);
						xhr.onerror = function () {
							alert('服务端响应码 ' + xhr.status + ' 发生了错误');
						}
						xhr.send();
					}, failServ, {
						entity_type: $scope.search.entity_type,
						entity_id: $scope.list[index].id						
					});
				}

				$scope.delete = function (index) {
					if(confirm("确定删除《" + $scope.list[index].title + "》?")) {
						ajaxServ.delete("entity", "delete", function () {
								alert("删除成功");
								$scope.refresh();
							}, failServ, {
								entity_type: $scope.search.entity_type,
								entity_id: $scope.list[index].id,
								uid: $.cookie("admin-uid"),
								token: $.cookie("admin-token")
						});
					}
				};

				$scope.refresh=function () {
					ajaxServ.get("entity", 0, function (data) {
						$scope.list=data.entities;
						$scope.max=data.max_page;

					}, failServ, $scope.search);
				};

				$scope.searchList=function () {
					$scope.search.page_num=1;
					$scope.refresh();
				};
			}

			return ["$scope", "$state", "entityServ", "ajaxServ", "failServ", ctrl];
		},
		edit: function (config) {
			function ctrl($scope, $state, entityServ, ajaxServ, failServ, pluginServ, $interval) {
					
				$scope.search=entityServ.getSearchFormat();
				$scope.search.entity_type=config["type"];
				$scope.input=entityServ.getPostFormat();
				$scope.id="";

				$scope.videoChoice="file";
				$scope.lock=false;

				$scope.warn=[];
				for(var i=0;i<11;i++)
					$scope.warn[i]=false;
				$scope.specialWarn="";

				$scope.isAudio=true;

				$scope.select=function (type) {
					$scope.isAudio=(type=="audio");
				};

				/*注入其他业务逻辑*/
				config.inject($scope, ajaxServ, failServ);

				/*检查图片是否都上传好了*/
				function imgCheck() {
					var result=true;
					$(".simditor-body").each(function () {
						$(this).find("img").each(function () {
							if($(this).attr("src").indexOf("http://")!=0) {
								alert("文本编辑器中有图片还在上传\n请等待片刻再点\"提交\"");
								result=false;
							}
						});
					});
					return result;
				}

				function check(require) {
					if($scope.lock) {
						alert("还有文件正在上传, 点击进度条上的按钮可以停止上传");
						return false;
					}

					for(var i=0;i<11;i++)
						$scope.warn[i]=false;
			
					$scope.warn[0]=$scope.input["title"]=="";
					$scope.warn[1]=$scope.input["thumbnail"]=="";
					$scope.warn[2]=$scope.input["class_name"]=="";
					$scope.warn[5]=$scope.input["main_content"]=="";

					config.basicCheck($scope);

					var result=true;
					for(var i=0;i<$scope.warn.length;i++)
						result=result&&(!$scope.warn[i]);
					
					if(!result) {
						console.log($scope.warn);
						alert("请在有红色*标记的地方将表单填写完整");
						return false;
					}
					else
						return config.attachmentCheck($scope);
				}

				$scope.isSubmitting=false;

				$scope.submit=function () {
					config.setValueBeforeSubmit($scope);

					if(!imgCheck())
						return;
					var result=check();

					if($scope.id=="") {
						if(result) {
							$scope.isSubmitting=true;
							ajaxServ.post("entity", "post", function () {
								alert("新建成功")
								$state.go(config["link"]);
							}, failServ, $scope.input, {
								entity_type: config["type"],
								uid: $.cookie("admin-uid"),
								token: $.cookie("admin-token")
							});						
						}
			
					}
					else {
						$scope.isSubmitting=true;
						ajaxServ.put("entity", "put", function () {
							$scope.isSubmitting=false;
							alert("编辑成功")
							$state.go(config["link"]);
						}, function () {
							$scope.isSubmitting=false;
							failServ();
						}, $scope.input, {
							entity_type: config["type"],
							entity_id: $scope.id,
							uid: $.cookie("admin-uid"),
							token: $.cookie("admin-token")
						});			
					}
						
				};

				$scope.simditorLoaded=false;
				$scope.$on("$viewContentLoaded", function (event) {
					config.initSimditor($scope, pluginServ);
					$scope.simditorLoaded=true;
				});

				$scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
					$scope.id=toParams.id;
					if(toParams.id!="")
						ajaxServ.get("entity", "detail", function (data) {
							/*标题和分类*/
							$scope.input.title=data.entity.title;
							$scope.input.class_name=data.entity.class_name;

							/*缩略图*/
							$scope.input.thumbnail=data.entity.thumbnail;

							/*音频/视频文件*/
							var type=data.entity.media.media_type;
							$scope.input[type]=data.entity.media.url;
							$scope.input[type+"_name"]=data.entity.media.name;
							if(type=="video")
								$scope.input["video_code"]=data.entity.media.code;

							/*其他赋值, 文本编辑器以及作者部分*/
							var release=$scope.$watch("simditorLoaded", function (newValue, oldValue, context) {
								if(newValue) {
									console.log(newValue);
									console.log(data);
									config.setValueBeforeEdit($scope, data);
									release();
								}
							});
						}, failServ, {
							"entity_type": config.type,
							"entity_id": toParams.id,
							"uid": $.cookie("admin-uid"),
							"token": $.cookie("admin-token")
						});
				});
			}

			return ["$scope", "$state", "entityServ", "ajaxServ", "failServ", "pluginServ", "$interval", ctrl];
		}	
	};
});