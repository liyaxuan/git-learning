var mainModule=angular.module("MainModule", ["ui.router", "AJAXModule"]);

mainModule.controller("MainController", ["$scope", "$state", "$interval", "CommonAJAX", function ($scope, $state, $interval, CommonAJAX) {
	
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
			text: "作品"
		}, {
			link: "article-list",
			icon: "description",
			text: "文章"
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
		CommonAJAX.put("login", "update", function (data) {
			$.cookie("token", data.token, { path: "/" });
		}, function () {}, {}, {
			"uid": $.cookie("admin-uid"),
			"token": $.cookie("admin-token")
		});
	}, 240*1000);

}]);

mainModule.service("fail", function () {
	return function (error) {
		var data=error.data;
		if(!data&&typeof data!="undefined"&&data!=0)
			alert("发生了不知道是什么的错误");
		else
			alert("发生了没有处理的错误\n错误代码: "+data.error_code+"\n错误信息: "+data.error_info+"\n错误描述: "+data.msg);
	}
});

mainModule.service("Entity", function () {
	return {
		getSearchFormat: function () {
			return {
				entity_type: "",
				class_name: "",
				keyword: "",
				page_num: "",
				order: "",
				author: ""
			};
		},
		getPostFormat: function () {
			return {
				title: "",
				thumbnail: "",
				class_name: "",
				author_uid: "",
				author_content: "",
				main_content: "",
				audio: "",
				audio_name: "",
				video: "",
				video_name: "",
				video_code: ""	
			};		
		}
	};
});

mainModule.service("Plugin", ["AJAXConfig", "CommonAJAX", function (AJAXConfig, CommonAJAX) {
	return {
		setParam: function (isAsy, succCallback, failCallback) {
		    var xhr=new XMLHttpRequest();
	        var url=AJAXConfig.getSignUrl()+"?uid="+$.cookie("admin-uid")+"&token="+$.cookie("admin-token");
	        xhr.open("GET", url, isAsy);
	        xhr.send(null);
	        if(isAsy) {
		        xhr.onreadystatechange=function () {
		        	if(xhr.readyState==4&&xhr.status==200) {
						var data=eval("("+xhr.responseText+")");
						delete data["status"];
						data["success_action_status"]="200";
						succCallback(data);       		
		        	}
		        	else if(xhr.readyState==4&&xhr.status!=200) {
		        		failCallback();
		        	}
		        }	        	
	        }
	        else
	        	return eval("("+xhr.responseText+")");
		},
		newUploader: function (type, scope) {
			var _this=this;

			var typeAllowed=[];
			var maxSize="";
			if(type=="audio") {
				typeAllowed="mp3,wav,wma,ogg";
				maxSize="15MB";
			}			
			else if(type=="video") {
				typeAllowed="mp4,avi,wmv";
				maxSize="350MB";
			}
			else {
				typeAllowed="jpg,gif,png";
				maxSize="5MB";
			}

    		var uploader=new plupload.Uploader({
				runtimes: "html5,flash,silverlight,html4",
				browse_button: document.getElementById("select-"+type),
				container: document.getElementById("container-"+type),
			    url: AJAXConfig.getUploadUrl(),
			    multi_selection: false,
			    filters: {
			    	mime_types: [{
			    		title: "",
			    		extensions: typeAllowed
			    	}],
			    	max_file_size: maxSize,
			    	prevent_duplicates: false,
			    },
				init: {
					FilesAdded: function(uploader, file) {
						_this.setParam(true, function (data) {
					        uploader.setOption({
					            "url": AJAXConfig.getUploadUrl(),
					            "multipart_params": data
					        });
					        uploader.start();
							scope.start(file[0].name);							
						}, function () {
							alert("无法与服务器连接, 获取签名失败");
						});
					},
					UploadProgress: function(uploader, file) {
						scope.render(file.percent);
					},
					FileUploaded: function(uploader, file, info) {
						var data=eval("("+info.response+")");
			            scope.finish(data.file_path);	            	
					},
					Error: function (uploader, error) {
						if(error.code=="-600")
							alert("文件大小必须小于: "+maxSize);
						else if(error.code=="-601")
							alert("文件格式必须是: "+typeAllowed);
					}
				}
			});
			uploader.init();
			return uploader;
		},
		newSimditor: function (cssSelector, toolbar, initCallback) {
			var data=this.setParam(false);

			var simditor=new Simditor({
				textarea: $(cssSelector),
				toolbar: toolbar,
				toolbarFloat: true,
				defaultImage: "lib/simditor/images/image.png",
				upload: {
				    url: AJAXConfig.getUploadUrl(),
				    params: data,
				    fileKey: "file",
				    connectionCount: 3,
				    leaveConfirm: "正在上传文件"
				},
				pasteImage: false,
				imageButton: ["upload"]
			});

			simditor.on("pasting", function (e, $pasteContent) {
				if($pasteContent.find("img").length>0) {
					alert("请使用图片上传功能, 而不要粘贴图片");
					return false;
				}
			});

			return simditor;
		}
	};
}]);

mainModule.directive("imgInputOss", ["Plugin", function (Plugin) {
	return {
		restrict: "E",
		replace: true,
		templateUrl: "src/template/img-input-oss.html",
		scope: {
			file: "=",
			lock: "="
		}
	};
}]);

mainModule.directive("fileInput", ["Plugin", function (Plugin) {
	return {
		restrict: "E",
		replace: true,
		templateUrl: "src/template/file-input.html",
		scope: {
			file: "=",
			lock: "=",
			isAttachment: "="
		},
		link: function (scope, element, attribute) {

			$(element).find(".container").attr("id", "container-"+attribute.type);
			$(element).find(".select").attr("id", "select-"+attribute.type);

			var attachment=$(element).next();
			scope.isProcessing=false;

			function setSrc(src) {
				if(attribute.type!="thumbnail")
					attachment.find(attribute.type).attr("src", src);
				else {
					attachment.find("img").attr("src", src);
				}	
				src==""?attachment.hide():attachment.show();				
			}

			scope.$watch("file", function (newValue, oldValue, context) {
				setSrc(newValue);		
			});

			scope.start=function (filename) {
				scope.$apply(function () {
					scope.isProcessing=true;
					scope.filename=filename;
					scope.percent=0;
				});
				scope.file="";
				$(element).find(".bar").css("width", "0%");
				setSrc("");
			};

			scope.render=function (percent) {
				if(scope.isProcessing) {
					scope.lock=true;		
					scope.$apply(function () {
						scope.percent=percent;
					});
					$(element).find(".bar").css("width", percent+"%");						
				}		
			};

			scope.finish=function (filePath) {
				scope.lock=false;
				scope.$apply(function () {
					scope.isProcessing=false;					
				});
				scope.file=filePath;
				setSrc(filePath);
			};

			var uploader=Plugin.newUploader(attribute.type, scope);

			scope.cancel=function () {
				scope.isProcessing=false;
				uploader.stop();

				scope.isProcessing=false;
				scope.filename="";
				scope.percent=0;

				scope.file="";
				$(element).find(".bar").css("width", "0%");
				setSrc("");
							
			};
		}
	};
}]);


mainModule.directive("avInput", function () {
	return {
		restrict: "E",
		replace: true,
		templateUrl: "src/template/av-input.html",
		scope: {
			input: "=",
			lock: "=",
			isAudio: "=",
			videoChoice: "="
		},
		link: function (scope, element, attribute) {
			scope.isFile=true;
			scope.select=function (choice) {
				scope.isFile=!scope.isFile;
				if(choice=="file") {
					scope.input.video_code="";
				}					
				else if(choice=="code") {
					scope.input.video="";
				}				
			}
			
			scope.$watch("isAudio", function (newValue, oldValue, context) {
				/* isAudio==true显示音频 */
				if(newValue) {
					scope.input["video"]="";
					scope.input["video_name"]="";
					scope.input["video_code"]="";
				}
				/* isAudio==true显示视频 */
				else {
					scope.input["audio"]="";
					scope.input["audio_name"]="";				
				}
			});
		}
	}
});

mainModule.directive("pagination", function () {
	return {
		restrict: "AE",
		replace: true,
		scope: {
			cur: "=",
			max: "=",
			refresh: "&"
		},
		templateUrl: "src/template/pagination.html",
		link: function (scope, element, attribute) {
			scope.turn=function (arg) {
				if(arg=="backward"&&scope.cur!=1)
					scope.cur=scope.cur-1;
				else if(arg=="forward"&&scope.cur!=scope.max)
					scope.cur=scope.cur+1;
				else {
					var reg=new RegExp("^[0-9]*$");
					if(reg.test(arg)) {
						arg=parseInt(arg);
						if(arg>scope.max)
							scope.cur=scope.max;
						else
							scope.cur=arg;
						scope.to=scope.cur;						
					}
					else if(arg!="backward"&&arg!="forward")
						alert("请输入正确的页码");
				}			
			};

			scope.$watch("cur", function () {
				scope.refresh();
			});
		}
	};
});

mainModule.directive("toolBar", ["CommonAJAX", function (CommonAJAX) {
	return {
		restrict: "AE",
		replace: true,
		scope: {
			search: "=",
			refresh: "&",
			isAuthor: "=",
			isClass: "="
		},
		templateUrl: "src/template/tool-bar.html",
	};
}]);

mainModule.directive("classList", ["CommonAJAX", function (CommonAJAX) {
	return {
		restrict: "AE",
		replace: true,
		scope: {
			search: "=",
			type: "="
		},
		templateUrl: "src/template/class-list.html",
		link: function (scope, element, attribute) {
			scope.isClosed=true;

			scope.toggle=function () {
				scope.isClosed=!scope.isClosed;
			};
			scope.select=function (className) {
				scope.isClosed=true;
				scope.search.class_name=className;
			};
			scope.clear=function () {
				scope.isClosed=true;
				scope.search.class_name="";
			};

			var type=scope.search.entity_type==undefined?scope.type:scope.search.entity_type;
			type=type=="activity"?"article":type;

			CommonAJAX.get("class", 0, function (data) {
				scope.list=[];
				for(var i=0;i<data.class_name.length;i++)
					scope.list.push(data.class_name[i]);
			}, function () {}, {
				entity_type: type
			});			
		}
	};
}]);

mainModule.directive("messageLayer", ["CommonAJAX", function (CommonAJAX) {
	return {
		restrict: "E",
		replace: true,
		scope: {			
			isOpen: "=isOpen",
			isDisabled: "=isDisabled",
			uid_to: "=uidTo"
		},
		templateUrl: "src/template/message-layer.html",
		link: function (scope, element, attribute) {

			scope.send=function () {
				if(scope.uid_to=="所有人")
					CommonAJAX.post("notice", "post", function () {
						alert("发送成功");
						scope.cancel();
					}, function () {}, {
						type: "notice",
						content: scope.message
					}, {
						"uid": $.cookie("admin-uid"),
						"token": $.cookie("admin-token")
					});					
				else
					CommonAJAX.post("message", "post", function () {
						alert("发送成功");
						scope.cancel();
					}, function () {}, {
						type: "message",
						content: scope.message
					}, {
						"uid_to": scope.uid_to,
						"uid": $.cookie("admin-uid"),
						"token": $.cookie("admin-token")
					});
			};

			scope.cancel=function () {
				scope.uid_to="";
				scope.message="";
				scope.isOpen=false;
			};

		}
	};
}]);

function AAWListControllerProvider() {
	function AWListController($scope, $state, Entity, CommonAJAX) {

		var type=$state.current.data.entity_type;
		switch (type) {
			case "vwork":
				$scope.title="作品列表";
				$scope.isAuthor=true;
				$scope.isClass=true;
				$scope.isNew=true;
				$scope.isSelect=true;
				break;
			case "uwork":
				$scope.title="作品列表";
				$scope.isAuthor=true;
				$scope.isClass=false;
				$scope.isNew=false;
				$scope.isSelect=true;
				break;
			case "article":
				$scope.title="文章列表";
				$scope.isAuthor=false;
				$scope.isClass=true;
				$scope.isNew=true;
				$scope.isSelect=false;
				break;
		}

		$scope.list=[];

		$scope.search=Entity.getSearchFormat();
		$scope.search.entity_type=$state.current.data.entity_type;
		$scope.search.page_num=1;
		$scope.maxPage=1;

		$scope.delete=function (index) {
			if(confirm("确定删除《"+$scope.list[index].title+"》?")) {
				CommonAJAX.delete("entity", "delete", function () {
						alert("删除成功");
						$scope.refresh();
					}, function () {}, {
						entity_type: $scope.search.entity_type,
						entity_id: $scope.list[index].id,
						uid: $.cookie("admin-uid"),
						token: $.cookie("admin-token")
				});
			}
		};

		$scope.refresh=function () {
			CommonAJAX.get("entity", 0, function (data) {
				$scope.list=data.entities;
				$scope.max=data.max_page;

			}, function () {}, $scope.search);
		};

	}
	return ["$scope", "$state", "Entity", "CommonAJAX", AWListController];
}

function EditControllerProvider(Config) {
	function EditController($scope, $interval, $state, Entity, Plugin, fail, CommonAJAX) {
			
		$scope.search=Entity.getSearchFormat();
		$scope.search.entity_type=Config["type"];
		$scope.input=Entity.getPostFormat();
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
		Config.inject($scope, CommonAJAX, fail);

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

			Config.basicCheck($scope);

			var result=true;
			for(var i=0;i<$scope.warn.length;i++)
				result=result&&(!$scope.warn[i]);
			
			if(!result) {
				console.log($scope.warn);
				alert("请在有红色*标记的地方将表单填写完整");
				return false;
			}
			else
				return Config.attachmentCheck($scope);
		}

		$scope.submit=function () {
			Config.setValueBeforeSubmit($scope);

			if(!imgCheck())
				return;
			var result=check();
			if($scope.id=="") {
				if(result) 
					CommonAJAX.post("entity", "post", function () {
						alert("新建成功")
						$state.go(Config["link"]);
					}, fail, $scope.input, {
						entity_type: Config["type"],
						uid: $.cookie("admin-uid"),
						token: $.cookie("admin-token")
					});		
			}
			else {
				CommonAJAX.put("entity", "put", function () {
					alert("编辑成功")
					$state.go(Config["link"]);
				}, fail, $scope.input, {
					entity_type: Config["type"],
					entity_id: $scope.id,
					uid: $.cookie("admin-uid"),
					token: $.cookie("admin-token")
				});			
			}
				
		};

		$scope.simditorLoaded=false;
		$scope.$on("$viewContentLoaded", function (event) {
			Config.initSimditor($scope, Plugin);
			$scope.simditorLoaded=true;
		});

		$scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
			$scope.id=toParams.id;
			if(toParams.id!="")
				CommonAJAX.get("entity", "detail", function (data) {
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
							Config.setValueBeforeEdit($scope, data);
							release();
						}
					});
				}, function () {}, {
					"entity_type": Config.type,
					"entity_id": toParams.id,
					"uid": $.cookie("admin-uid"),
					"token": $.cookie("admin-token")
				});
		});
	}
	return ["$scope", "$interval", "$state", "Entity", "Plugin", "fail", "CommonAJAX", EditController];

}