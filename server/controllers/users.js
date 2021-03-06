var User = require('mongoose').model('User'),
	Membership = require('mongoose').model('Membership'),
	Activation = require('mongoose').model('Activation'),
	encrypt = require('../utilities/encryption'),
	deleteKey = require('key-del'),
	_ = require('lodash'), //Library for Array
	html_strip = require('htmlstrip-native'),
	commFunc = require('../utilities/commonFunctions'),
	sendgrid = require('sendgrid')('yoyocicada', 'SendGrid1006'),
	randomString = require('random-string');

var sendActivation = function (activationCode, res, userId, email) {
	console.log('chk email');
	console.log(email);
	var activateEmail = new sendgrid.Email({to: email});
	activateEmail.subject = 'Activate your ocfc account';
	activateEmail.setFrom('support@onechurchforchrist.org');
	activateEmail.setHtml('<a href="http://onechurchforchrist.org/activate/' + activationCode + '/userId/' + userId + '/email/' + email + '">Activate</a>');
	sendgrid.send(activateEmail, function (err, json) {
		if (err) {
			return res.json(err);
		}
		return res.json(json);

	});
};

//used as test, to be removed later
exports.signup = function (req, res) {
	sendActivation('3353535353535', 'butterfly43026@gmail.com', res);
};

//Post - Round1
exports.createUser = function (req, res) {
	console.log('createUser is being called');
	var user = req.body;
	var salt = encrypt.createSalt();
	var activationCode = randomString({
		length: 20,
		numeric: true,
		letters: true,
		special: false
	});
	user.salt = salt;
	user.hashedPwd = encrypt.hashPwd(salt, user.password);
	user = new User(user);
	user.save(function (err) {
		if (err) return res.json(err);
		sendActivation(activationCode, res, user._id, user.userName);
		var membership = new Membership({userId: user._id});
		membership.save(function (err) {
			if (err) return res.json(err);
			var activation = new Activation({userId: user._id, activationCode: activationCode});
			activation.save(function (err) {
				if (err) return res.json(err);
				console.log('chk activation obj to see whether it has been saved to database');
				console.log(activation);
				return res.json({status: "success", user: user});
			});
		});
	});
};

//Test - Round1
exports.createUserTest = function (req, res) {
	console.log('createUser is being called');
	var user = req.body;
	var salt = encrypt.createSalt();
//	var activationCode=randomString({
//		length:20,
//		numeric:true,
//		letters:true,
//		special:false
//	});
	user.salt = salt;
	user.hashedPwd = encrypt.hashPwd(salt, user.password);
	user = new User(user);
	user.active = true;  //added 12.27.2014
	user.save(function (err) {
		if (err) return res.json(err);
//		sendActivation(activationCode,res,user._id,user.userName);
		var membership = new Membership({userId: user._id});
		membership.save(function (err) {
//			if (err) return res.json(err);
//			var activation=new Activation({userId:user._id,activationCode:activationCode});
//			activation.save(function(err){
//				if (err) return res.json(err);
//				console.log('chk activation obj to see whether it has been saved to database');
//				console.log(activation);
//				return res.json({status:"success",user:user});
			if (err) return res.json(err);
			return res.json({status: "success", user: user});
//			});
		});
	});
};

exports.activateUser = function (req, res) {
	//chk if req.query.activationCode matches Activation.activationCode tbl
	//Then grab userId and match against User tbl to set Active to true
	console.log('chk req.query');
	console.log(req.query);
	Activation.findOne({activationCode: req.query.activationCode, userId: req.query.userId}, function (err, activation) {
		if (err) return res.json(err);
		if (_.isEmpty(activation)) {
			return    res.json({status: "activation is empty", activation: activation})
		}
		console.log('chk activation');
		console.log(activation);
		User.update({_id: activation.userId}, {active: true}, function (err, numberAffected, raw) {
			if (err) return res.json(err);
			return res.json({status: "success call on activateUser", numberAffected: numberAffected, raw: raw});
		});

	});

};

exports.getActivation = function (req, res) {
	//chk if req.query.activationCode matches Activation.activationCode tbl
	//Then grab userId and match against User tbl to set Active to true
	console.log('chk req.query');
	console.log(req.query);
	Activation.findOne({userId: req.query.userId}, function (err, activation) {
		if (err) return res.json(err);
		if (_.isEmpty(activation)) {
			return res.send({});
		}
		console.log('chk activation');
		console.log(activation);
		return res.json({status: "success call on activation", activation: activation});

	});

};

exports.deleteUserFromActivation = function (req, res) {
	Activation.findOneAndRemove({userId: req.user._id}, function (err) {
		if (err) return res.json(err);
		return res.json({status: "successfully removed user from Activation dataset"});
	});
};

//Put - Round1
exports.updateUser = function (req, res) {
	console.log('updateUser server api has been called');
	console.log('chk req.body obj');
	console.log(req.body);

	var user = commFunc.removeInvalidKeys(req.body, ['fullName', 'userName', 'birthday', 'gender', 'profileImg',
		'about', 'place', 'coordinates', 'language', 'active']);
	User.findOneAndUpdate({ _id: commFunc.reqSessionUserId(req)}, user, function (err, numberAffected, raw) {
		if (err) return res.json(err);
		return res.json({status: "success", raw: raw});
	});
};

//Get - Round1
exports.getUserById = function (req, res) {
	User.findOne({_id: req.params.id}).exec(function (err, user) {
		if (err) return res.json(err);
		return res.json({status: "success", user: user});
	});
};

//Delete - Round1
exports.deleteUser = function (req, res) {
	//TODO implement custom remove to rid all referencing objects
	User.update({_id: commFunc.reqSessionUserId(req)}, {active: false}, function (err) {
		if (err) return res.json(err);
		return res.json({status: "successfully de-activated acct"});
	});
};

//Put - Round1
exports.updateProfileImage = function (req, res) {
	console.log('updateProfileImage is being called');
	var user = {profileImg: req.body.profileImg};
	// Strip tags and decode HTML entities to prevent hacking
	//TODO image validation needed
	user.profileImg = html_strip.html_strip(user.profileImg, commFunc.htmlStripOptions);

	if (user.profileImg !== null || user.profileImg !== "") {
		User.update({ _id: commFunc.reqSessionUserId(req)}, user, function (err, numberAffected, raw) {
			if (err) return res.json(err);
			return res.json({status: "success", raw: raw});
		})
	} else {
		return res.json({status: "no image id"});
	}
};

exports.updateUserPassword = function (req, res) {
	console.log('updateUserPassword is being called');
	console.log('chk req.body');
	console.log(req.body);
	User.findOne({_id: req.user._id}, '+salt +hashedPwd').exec(function (err, user) {
		console.log('chk session user id');
		console.log(req.user._id);

		if (user && user.authenticate(req.body.oldPassword)) {
			//update user password using new password
			var salt = encrypt.createSalt();

			user.salt = salt;
			user.hashedPwd = encrypt.hashPwd(salt, req.body.newPassword);
			console.log('chk new hashedPwd');
			console.log(user.hashedPwd);
			user.save(function (err) {
				console.log('server user.save has been called');
				if (err) return res.json(err);
				return res.json({status: "success", user: user});
			});
		} else {
			return res.json({status: 'error', message: 'incorrect old password'});
		}
	})
};

//TODO Get
exports.resetPassword = function (req, res) {
	res.end();
};

//TODO Put
exports.updateEventParticipation = function (req, res) {
	res.end();
};