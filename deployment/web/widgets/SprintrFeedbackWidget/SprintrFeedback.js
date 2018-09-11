/*jslint indent: 4, forin: true */
/*global dojo, logger, mx, window*/
require([
		"dojo/_base/declare",
		"mxui/widget/_WidgetBase",
		"dojo/io/script"
], function (declare, _WidgetBase, ioScript) {

		return declare("SprintrFeedbackWidget.SprintrFeedback", _WidgetBase, {
			inputargs: {

			sprintrapp : '',
			entity : '',
			usernameattr : '',
			emailattr : '',
			allowFile : true,
			allowSshot : false,
			sprintrserver : ''

			},

		postCreate : function(){
			if (!window.sprintrFeedback) {
				var url = this.sprintrserver + (this.sprintrserver.match(/\/$/) != null ? "" : "/");
				ioScript.attach("sprintrfeedbackWrapper", url + "feedback/sprintrfeedback.js");

				this.checkScript(function () { return typeof window.sprintrFeedback != "undefined";}, dojo.hitch(this, function() {
					mx.addOnLoad(dojo.hitch(this, this.loadData));
				}), 0);
			} else {
				mx.addOnLoad(dojo.hitch(this, this.loadData));
			}
		},
		loadData : function () {
			if (this.entity !== '' && !!mx.session.getUserId()) {
				mx.data.get({
					guid : mx.session.getUserId(),
					callback : dojo.hitch(this, this.startFeedback),
					error: function(e) {
						// RvS: #829192: Showing an alert here will sometimes block loading Sprintr in webkit browsers unnecessarily
						console.warn("Error while loading feedback form: " +e);
					}
				});
			} else {
				this.startFeedback(null);
			}
		},
		startFeedback : function (userobj) {
			var data = {
				'sprintrid' : this.sprintrapp,
				'allowFile' : this.allowFile,
				'allowSshot' : this.allowSshot
			};
			var username = '';
			if (userobj != null && this.usernameattr != '' && userobj.has(this.usernameattr))
				username = userobj.get(this.usernameattr)
			else if (mx.session.getUserId() > 0 && mx.session.isGuest && !mx.session.isGuest())
				username = mx.session.getUserName();

			var emailaddr =
				(userobj != null && this.emailattr != '' && userobj.has(this.emailattr))
				? userobj.get(this.emailattr)
				: (username.match(/.+@.+\..+/) ? username : ''); //if it looks like an email address, it is one.

			var rolenames = [];
			if (mx.session.getUserRoleNames) {
			  rolenames = mx.session.getUserRoleNames();
			} else {
			  var roles = mx.session.getUserRoles();
			  for(var i = 0; i < roles.length; i++)
			    rolenames.push(roles[i].get("Name"));
			}

			data.userdata = {
				'username' : username,
				'emailaddress' : emailaddr,
				'userroles' : rolenames.join(" ") + " (account: " + username + ")"
			};
			window.sprintrFeedback.create(data);
		},
		checkScript : function (elem, cb, counter) {
					if (elem()) {
							cb();
					} else {
							if (counter < 30) {
									setTimeout(dojo.hitch(this, function () {
											this.checkScript(elem, cb, counter+1);
									}), 50);
							}
					}
			},
		uninitialize : function(){
		}
	});
});
