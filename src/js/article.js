define(['provider', 'angular', 'angular-ui-router', 'jquery-cookie', 'ajax', 'component'], function (provider) {
	var config={
		type: "article",
		link: "article-list",
		inject: function (scope, CommonAJAX, fail) {},
		initSimditor: function (scope, Plugin) {
			var toolbar=["title", "bold", "italic", "underline", "strikethrough","color", "|", "ol", "ul", "blockquote", "|", "link", "image", "hr", "|", "indent", "outdent", "alignment"];
			scope.articleEditor=Plugin.newSimditor("#article", toolbar);
		},
		basicCheck: function (scope) {},
		attachmentCheck: function (scope) {
			if(scope.isAudio) {
				var a=scope.warn[6]=(scope.input["audio"]=="");
				var b=scope.warn[7]=(scope.input["audio_name"]=="");
				if(a^b) {
					if(confirm("音频信息不全, 忽略音频直接上传吗?")) {
						scope.input["audio"]="";
						scope.input["audio_name"]="";
						return true;					
					}
					else
						/*不忽略就滚回去重新填写*/
						return false;
				}
				else
					/*都填了或者都没填那我就不管了*/
					return true;
			}
			else {
				var a=scope.warn[9]=(scope.input["video_name"]=="");
				if(scope.videoChoice=="file") {
					var b=scope.warn[8]=(scope.input["video"]=="");
				}
				else {
					var b=scope.warn[10]=(scope.input["video_code"]=="");
				}

				if(a^b) {
					
					if(confirm("视频信息不全, 忽略视频直接上传吗?")) {
						scope.input["video"]="";
						scope.input["video_name"]="";
						scope.input["video_code"]="";
						return true;
					}
					else
						/*不忽略就滚回去重新填写*/
						return false;
				}
				else
					/*都填了或者都没填那我就不管了*/
					return true;		
			}		
		},
		setValueBeforeSubmit: function (scope) {
			scope.input.main_content=scope.articleEditor.getValue();
		},
		setValueBeforeEdit: function (scope, data) {
			$(".simditor-body").html(data.entity.main_content);
		}
	};

	angular.module("articleModu", ["ajaxModu", "componentModu"])
	.controller("awListCtrl", provider.list())
	.controller("articleEditCtrl", provider.edit(config));
});