define(['angular', 'angular-resource'], function () {
	var host = "http://api.xunsheng90.com";
	var upload = "http://temp.xunsheng90.com";
	var sign = "http://sign.xunsheng90.com/oss-sign";

	var header = {
		get: {
			method: "GET"
		},
		post: {
			method: "POST",
			transformRequest: angular.identity,
        	headers: {"Content-Type": undefined}
		},
		put: {
			method: "PUT",
			transformRequest: angular.identity,
        	headers: {"Content-Type": undefined}
		}			
	};

	angular.module("ajaxModu", ["ngResource"])
	.service('urlServ', function () {
		return {
			host: host,
			upload: upload,
			sign: sign
		};
	})
	.service("ajaxServ", ["$resource", function ($resource) {
		return {
			getResource: function (resource, option) {
				var url="";
				var parameter={};
				switch (resource) {
					case "login": 
						url = host + "/user/login";
						parameter={};
						
						if(option=="update")
							parameter={
								uid: "@uid",
								token: "@token"							
							}
							
						break;
					case "auth":
						url = host + "/auth";
						parameter={
							uid: "@uid",
							token: "@token"
						};


						break;
					case 'meta':
						url = "http://api.xunsheng90.com/meta";
						
						parameter={
							uid: "@uid",
							token: "@token"
						};

						break;
					case 'download':
						parameter={
							uid: "@uid",
							token: "@token"
						};

						if(option == 'uwork')
							url = 'http://sign.xunsheng90.com/excel/uwork';
						else if(option == 'user')
							url = 'http://sign.xunsheng90.com/excel/user';

						break;
					case "banner":
						url = host + "/banner/:whichpage";
						parameter={
							whichpage: "@whichpage"
						};
						if(option=="post") {
							parameter={
								whichpage: "@whichpage",
								uid: "@uid",
								token: "@token"
							};
						}

						break;
					case "entity":
						url = host + "/entity/:entity_type";
						parameter={
							entity_type: "@entity_type",
							class_name: "@class_name",
							keyword: "@keyword",
							page_num: "@page_num",
							order: "@order",
							author: "@author"	
						};

						if(option=="detail") {
							url=url+"/:entity_id";
							parameter={
								entity_id: "@entity_id",
								entity_type: "@entity_type"
							};
						}

						else if(option=="put"||option=="delete") {
							url=url+"/:entity_id";
							parameter={
								entity_type: "@entity_type",
								entity_id: "@entity_id",
								uid: "@uid",
								token: "@token"
							};			
						}

						else if(option=="post") {
							parameter={
								entity_type: "@entity_type",
								uid: "@uid",
								token: "@token"							
							};
						}

						break;
					case "user":
						url= host +"/user/:uid_fromto/following";
						parameter={
							uid_formto: "@uid_fromto",
							uid: "@uid",
							token: "@token"
						};

						if(option=="list") {
							url= host +"/user";
							parameter={
								uid: "@uid",
								token: "@token",
								page_num: "@page_num",
								keyword: "@keyword"
							};					
						}

						else if(option=="detail"||option=="delete") {
							url= host +"/user/:_uid";
							parameter={
								_uid: "@_uid",
								uid: "@uid",
								token: "@token"
							};								
						}

						break;
					case "message":
						if(option=="post") {
							url= host +"/msg/:uid_to";
							parameter={
								uid_to: "@uid_to",
								uid: "@uid",
								token: "@token"
							};						
						}
						else if(option=="delete") {
							url= host +"/msg/self/:in_out/:msg_id";
							parameter={
								in_out: "@in_out",
								msg_id: "@msg_id",
								uid: "@uid",
								token: "@token"
							};						
						}
						else if(option=="list") {
							url= host +"/msg/self/:in_out";
							parameter={
								page_num: "@page_num",
								in_out: "@in_out",
								uid: "@uid",
								token: "@token"
							};							
						}
						
						break;
					case "notice":
						if(option=="list") {
							url= host +"/msg/notices";
							parameter={
								page_num: "@page_num",
								uid: "@uid",
								token: "@token"							
							};
						}
						else if(option=="post") {
							url= host +"/msg/notices";
							parameter={
								uid: "@uid",
								token: "@token"
							};
						}
						else if(option=="delete") {
							url= host +"/msg/notices/:notice_id";
							parameter={
								notice_id: "@notice_id",
								uid: "@uid",
								token: "@token"
							};						
						}
						
						break;
					case "comment":
						if(option == 'list') {
							url= host +"/comment";
							parameter={
								page_num: "@page_num",
								keyword: "@keyword",
								uid: "@uid",
								token: "@token"
							};							
						}

						else if(option=="one") {
							url= host +"/comment/:entity_type/:entity_id";
							parameter={
								entity_type: "@entity_type",
								entity_id: "@entity_id"			
							};
						}

						else if(option=="delete") {
							url= host +"/comment/:entity_type/:entity_id/:comment_id";
							parameter={
								entity_type: "@entity_type",
								entity_id: "@entity_id",
								comment_id: "@comment_id",
								uid: "@uid",
								token: "@token"	
							};
						}

						break;							
					case "class":
						url= host +"/class/:entity_type";
						parameter={ entity_type: "@entity_type" };
						if(option==1) {
							parameter={
								entity_type: "@entity_type",
								uid: "@uid",
								token: "@token"
							};
						}
						else if(option==2) {
							url= host +"/class/:entity_type/:class_name";
							parameter={
								entity_type: "@entity_type",
								uid: "@uid",
								token: "@token",
								class_name: "@class_name"
							};
						}

						break;

					case "sign":
						url = sign;
						parameter={
							uid: "@uid",
							token: "@token"
						};
						break;		
				}
				return $resource(url, parameter, header);	
			},
			post: function (resource, option, succ, fail, form, args) {
				var func = this.getResource(resource, option);
				var reqBody=new FormData();
				for(var x in form)
					reqBody.append(x, form[x]);
				func.post(args, reqBody, succ, fail);
			},
			delete: function (resource, option, succ, fail, args) {
				var func = this.getResource(resource, option);
				func.delete(args, succ, fail);
			},
			put: function (resource, option, succ, fail, form, args) {
				var func = this.getResource(resource, option);
				var reqBody=new FormData();
				for(var x in form)
					reqBody.append(x, form[x]);
				func.put(args, reqBody, succ, fail);
			},
			get: function (resource, option, succ, fail, args) {
				var func = this.getResource(resource, option);
				func.get(args, succ, fail);
			}
		}
	}])
	.service("failServ", function () {
		return function (error) {
			var data=error.data;
			if(!data&&typeof data!="undefined"&&data!=0)
				alert("发生了不知道是什么的错误");
			else
				alert("发生了没有处理的错误\n错误代码: "+data.error_code+"\n错误信息: "+data.error_info+"\n错误描述: "+data.msg);
		}
	});
});