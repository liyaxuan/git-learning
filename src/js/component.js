define(['angular', 'jquery-cookie', 'ajax', 'plupload', 'simditor'], function () {
	angular.module('componentModu', [])
	.filter('title', function () {
		return function (title) {
			switch (title) {
				case 'comment':
					return '评论';
				case 'article':
					return '动态';
				case 'uwork':
					return '朗读';
				case 'vwork':
					return '精选';
				case 'user':
					return '用户';
			}			
		}

	})
	.filter("url", function () {
		return function (url) {
			url=url.replace(/media/, "img");
			return url;
		}
	})
	.filter("workTime", function () {
		return function (time) {
			time=time.slice(time.indexOf("-")+1);
			var pattern=/[0-9]+-[0-9]+/;
			return pattern.exec(time)[0];
		}
	})
	.filter("msgTime", function () {
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
	})
	.service("entityServ", function () {
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
	})
	.service("pluginServ", ["urlServ", "ajaxServ", function (urlServ, ajaxServ) {
		return {
			setParam: function (isAsy, succCallback, failCallback) {
			    var xhr = new XMLHttpRequest();
		        var url = urlServ.sign + "?uid=" + $.cookie("admin-uid") + "&token=" + $.cookie("admin-token");
		        xhr.open("GET", url, isAsy);
		        xhr.send(null);
		        if(isAsy) {
			        xhr.onreadystatechange = function () {
			        	if(xhr.readyState == 4 && xhr.status == 200) {
							var data = JSON.parse(xhr.responseText);
							delete data["status"];
							data["success_action_status"]="200";
							succCallback(data);       		
			        	}
			        	else if(xhr.readyState == 4 && xhr.status != 200) {
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
					typeAllowed="mp4,avi,wmv,flv";
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
				    url: urlServ.upload,
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
						            "url": urlServ.upload,
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
				var data = this.setParam(false);

				var simditor = new Simditor({
					textarea: $(cssSelector),
					toolbar: toolbar,
					toolbarFloat: true,
					defaultImage: 'res/simditor-img.png',
					upload: {
					    url: urlServ.upload,
					    params: data,
					    fileKey: 'file',
					    connectionCount: 3,
					    leaveConfirm: '正在上传文件'
					},
					pasteImage: false,
					imageButton: ['upload']
				});

				simditor.on('pasting', function (e, $pasteContent) {
					if($pasteContent.find('img').length > 0) {
						alert('请使用图片上传功能, 而不要粘贴图片');
						return false;
					}
				});

				return simditor;
			}
		};
	}])
	.directive("imgInput", function () {
		return {
			restrict: "E",
			replace: true,
			templateUrl: "src/template/img-input.html",
			scope: {
				file: "=",
				lock: "="
			},
			link: function (scope, element, attribute) {
				scope.$on("filechanged", function (event, data) {
					scope.file=data;
				});
			}
		};
	})
	.directive("fileInput", ["$rootScope", "pluginServ", function ($rootScope, pluginServ) {
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

					scope.$emit("filechanged", src);			
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

				var uploader=pluginServ.newUploader(attribute.type, scope);

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
	}])
	.directive("avInput", function () {
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

				scope.$on("filechanged", function (event, data) {
					if(scope.isAudio)
						scope.input.audio=data;
					else
						scope.input.video=data;
				});
			}
		}
	})
	.directive("pagination", function () {
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
	})
	.directive("toolBar", ["ajaxServ", function (ajaxServ) {
		return {
			restrict: "AE",
			replace: true,
			scope: {
				search: "=",
				refresh: "&",
				isClass: '=',
				isAuthor: '='
			},
			templateUrl: "src/template/tool-bar.html",
			link: function (scope) {
				scope.get = function () {
					scope.search.page_num = 1;
					scope.refresh();
				}
			}
		};
	}])
	.directive("classList", ["ajaxServ", function (ajaxServ) {
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

				var type = scope.search.entity_type ==undefined ? scope.type : scope.search.entity_type;
				type = type == "activity" ? "article" : type;

				ajaxServ.get("class", 0, function (data) {
					scope.list=[];
					for(var i=0;i<data.class_name.length;i++)
						scope.list.push(data.class_name[i]);
				}, function () {}, {
					entity_type: type
				});			
			}
		};
	}])
	.directive("messageLayer", ["ajaxServ", function (ajaxServ) {
		return {
			restrict: "E",
			replace: true,
			scope: {			
				isOpen: "=",
				isDisabled: "=",
				uidTo: "=",
				refresh: "&"
			},
			templateUrl: "src/template/message-layer.html",
			link: function (scope, element, attribute) {
				scope.send=function () {
					if(scope.uidTo == "所有人")
						ajaxServ.post("notice", "post", function () {
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
						ajaxServ.post("message", "post", function () {
							alert("发送成功");						
							scope.cancel();
						}, function () {}, {
							type: "message",
							content: scope.message
						}, {
							"uid_to": scope.uidTo,
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
});