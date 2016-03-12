var ajaxModule=angular.module("AJAXModule", ["ngResource"]);

ajaxModule.service("AJAXConfig", function () {
	var host="http://api.xunsheng90.com";
	var upload="http://temp.xunsheng90.com";
	var sign="http://sign.xunsheng90.com/oss-sign"
	return {
		getHostUrl: function () {
			return host;
		},
		getUploadUrl: function () {
			return upload;
		},
		getSignUrl: function () {
			return sign;
		},
		getHeaders: function () {
			return {
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
		}
	};
});

ajaxModule.service("CommonAJAX", ["$resource", "AJAXConfig", function ($resource, AJAXConfig) {
	return {
		getResource: function (resource, option) {
			var url="";
			var parameter={};
			switch (resource) {
				case "login": 
					url=AJAXConfig.getHostUrl()+"/user/login";
					parameter={};
					
					if(option=="update")
						parameter={
							uid: "@uid",
							token: "@token"							
						}
						
					break;
				case "auth":
					url=AJAXConfig.getHostUrl()+"/auth";
					parameter={
						uid: "@uid",
						token: "@token"
					};


					break;
				case "banner":
					url=AJAXConfig.getHostUrl()+"/banner/:whichpage";
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
					url=AJAXConfig.getHostUrl()+"/entity/:entity_type";
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
					url=AJAXConfig.getHostUrl()+"/user/:uid_fromto/following";
					parameter={
						uid_formto: "@uid_fromto",
						uid: "@uid",
						token: "@token"
					};

					if(option=="list") {
						url=AJAXConfig.getHostUrl()+"/user";
						parameter={
							uid: "@uid",
							token: "@token",
							page_num: "@page_num"
						};					
					}

					else if(option=="detail"||option=="delete") {
						url=AJAXConfig.getHostUrl()+"/user/:_uid";
						parameter={
							_uid: "@_uid",
							uid: "@uid",
							token: "@token"
						};								
					}

					break;
				case "message":
					if(option=="post") {
						url=AJAXConfig.getHostUrl()+"/msg/:uid_to";
						parameter={
							uid_to: "@uid_to",
							uid: "@uid",
							token: "@token"
						};						
					}
					else if(option=="delete") {
						url=AJAXConfig.getHostUrl()+"/msg/self/:in_out/:msg_id";
						parameter={
							in_out: "@in_out",
							msg_id: "@msg_id",
							uid: "@uid",
							token: "@token"
						};						
					}
					else if(option=="list") {
						url=AJAXConfig.getHostUrl()+"/msg/self/:in_out";
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
						url=AJAXConfig.getHostUrl()+"/msg/notices";
						parameter={
							page_num: "@page_num",
							uid: "@uid",
							token: "@token"							
						};
					}
					else if(option=="post") {
						url=AJAXConfig.getHostUrl()+"/msg/notices";
						parameter={
							uid: "@uid",
							token: "@token"
						};
					}
					else if(option=="delete") {
						url=AJAXConfig.getHostUrl()+"/msg/notices/:notice_id";
						parameter={
							notice_id: "@notice_id",
							uid: "@uid",
							token: "@token"
						};						
					}
					
					break;
				case "comment":
					url=AJAXConfig.getHostUrl()+"/comment";
					parameter={
						page_num: "@page_num",
						uid: "@uid",
						token: "@token"
					};

					if(option=="one") {
						url=AJAXConfig.getHostUrl()+"/comment/:entity_type/:entity_id";
						parameter={
							entity_type: "@entity_type",
							entity_id: "@entity_id"			
						};
					}
					else if(option=="delete") {
						url=AJAXConfig.getHostUrl()+"/comment/:entity_type/:entity_id/:comment_id";
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
					url=AJAXConfig.getHostUrl()+"/class/:entity_type";
					parameter={ entity_type: "@entity_type" };
					if(option==1) {
						parameter={
							entity_type: "@entity_type",
							uid: "@uid",
							token: "@token"
						};
					}
					else if(option==2) {
						url=AJAXConfig.getHostUrl()+"/class/:entity_type/:class_name";
						parameter={
							entity_type: "@entity_type",
							uid: "@uid",
							token: "@token",
							class_name: "@class_name"
						};
					}

					break;

				case "sign":
					url=AJAXConfig.getSignUrl();
					parameter={
						uid: "@uid",
						token: "@token"
					};
					break;		
			}
			return $resource(url, parameter, AJAXConfig.getHeaders());	
		},
		post: function (resource, option, succ, fail, form, args) {
			var func=this.getResource(resource, option);
			var reqBody=new FormData();
			for(var x in form)
				reqBody.append(x, form[x]);
			func.post(args, reqBody, succ, fail);
		},
		delete: function (resource, option, succ, fail, args) {
			var func=this.getResource(resource, option);
			func.delete(args, succ, fail);
		},
		put: function (resource, option, succ, fail, form, args) {
			var func=this.getResource(resource, option);
			var reqBody=new FormData();
			for(var x in form)
				reqBody.append(x, form[x]);
			func.put(args, reqBody, succ, fail);
		},
		get: function (resource, option, succ, fail, args) {
			var func=this.getResource(resource, option);
			func.get(args, succ, fail);
		}
	}
}]);