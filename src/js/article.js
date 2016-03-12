var articleModule=angular.module("ArticleModule", ["ui.router", "MainModule", "AJAXModule"]);

articleModule.controller("AWListController", AAWListControllerProvider());

var ArticleConfig={
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
				if(confirm("音频信息不全, 忽略音频直接上传吗?")) {
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
	// attachmentCheck: function (scope) {

	// 	scope.warn[6]=scope.input["audio"]=="";
	// 	scope.warn[7]=scope.input["audio_name"]=="";

	// 	scope.warn[8]=scope.input["video"]=="";
	// 	scope.warn[9]=scope.input["video_name"]=="";
	// 	scope.warn[10]=scope.input["video_code"]=="";

	// 	function innerCheck(vo, choice, ao) {
			
	// 		var post=["为空", "不完整", ""];
	// 		tip="上传视频也需要上传音频";
	// 		var end="\n要忽略附件直接上传吗?";

	// 		function con(type, option) {
	// 			if(option==2)
	// 				return "";
	// 			else {
	// 				var pre=(type=="video"?"视频信息":"音频信息");
	// 				return pre+post[option];					
	// 			}
	// 		}

	// 		if( ((vo==0||vo==2)&&ao==2) || (vo==0&&ao==0) ) 
	// 			/*视频为空或者完整时, 音频完整*/
	// 			/*或者音频视频都为空*/
	// 			return true;

	// 		var tipStr=(vo==2&&ao!=2?tip:"");
	// 		var conStr=con("video", vo)+con("audio", ao)+tipStr+end;

	// 		if(confirm(conStr)) {
	// 			if(post[vo]=="不完整") {
	// 				var attr=(choice=="file"?"video":"video_code");
	// 				scope.input[attr]="";
	// 				scope.input["video_name"]="";					
	// 			}
	// 			if(post[ao]=="不完整") {
	// 				scope.input["audio"]="";
	// 				scope.input["audio_name"]="";						
	// 			}
	// 			return true;
	// 		}
	// 		else
	// 			return false;
	// 	}

	// 	if(scope.videoChoice=="file") {
	// 		var isOneTrueOnefalse=scope.warn[8]^scope.warn[9];
	// 		var isBothFilled=!scope.warn[8]&&!scope.warn[9];
	// 	}
	// 	else {
	// 		var isOneTrueOnefalse=scope.warn[10]^scope.warn[9];
	// 		var isBothFilled=!scope.warn[10]&&!scope.warn[9];
	// 	}

	// 	var vc;

	// 	if(isOneTrueOnefalse)
	// 		vc=1;
	// 	else if(isBothFilled)
	// 		vc=2;
	// 	else
	// 		vc=0;

	// 	console.log("video condition: "+vc);

	// 	if(scope.warn[6]&&scope.warn[7]) {
	// 		/*audio和audio_name都是空值*/
	// 		console.log("audio condition: 0");
	// 		return innerCheck(vc, scope.videoChoice, 0);
	// 	}			
	// 	else if(scope.warn[6]^scope.warn[7]) {
	// 		/*audio和audio_name有一个是空值*/
	// 		console.log("audio condition: 1");
	// 		return innerCheck(vc, scope.videoChoice, 1);
	// 	}		
	// 	else if(!scope.warn[6]&&!scope.warn[7]) {
	// 		/*audio和audio_name都不是空值*/
	// 		console.log("audio condition: 2");
	// 		return innerCheck(vc, scope.videoChoice, 2);
	// 	}
			
	// },
	setValueBeforeSubmit: function (scope) {
		scope.input.main_content=scope.articleEditor.getValue();
	},
	setValueBeforeEdit: function (scope, data) {
		$(".simditor-body").html(data.entity.main_content);
	}
}

articleModule.controller("ArticleEditController", EditControllerProvider(ArticleConfig));