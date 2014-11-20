/*************************************************************************************
 11.18.2014 re-create Fellow model as per latest requirement
 ***************************************************************************************/

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var fellowshipSchema = mongoose.Schema({
	albumIds:	[{type: ObjectId, ref: 'Album', index: false,unique: false}],
	fileIds:	[{type: ObjectId, ref:'File',index: false,unique: false}],
	calendarIds:[{type: ObjectId, ref:'Calendar', index: false, unique: false}],
	name:		{type: String, required:'(name) is required!', index: true, unique: false,lowercase: true},
	slogan:		{type: String, index: false, unique: false,lowercase: true},
	about:		{type: String, required: '(about) is required!', index: false, unique: false,lowercase: true},
	address:	{type: String, required: '(address) is required!', index: false, unique: false,lowercase: true},
	city:		{type: String, required: '(city) is required!', index: true, unique: false,lowercase: true},
	country:	{type: String, required: '(country) is required!', index: true, unique: false,lowercase: true},
	zipcode:	{type: String, required: '(zipcode) is required!', index: true, unique: false,lowercase: true},
	startDate: 	{type: Date, required: '(meetupDate) is required!', index: false, unique: false,lowercase: true}
});

var Fellowship = mongoose.model('Fellowship', fellowshipSchema);
function createDefaultFellowships() {
	Fellowship.find({}).exec(function (err, collection) {
		if (collection.length === 0) {
			Fellowship.create({name: '提摩太團契', about: 'Wix is the leading web publishing platform with over 37 million users worldwide. Wix makes it easier than ever to create a stunning website for free by giving you all the essentials. Choose from 100s of designer-made HTML5 templates. Use the',
				   address:'920 sierra vista ave', city:'Mountain View', country:'United States', zipcode: '12456', meetupDate:'Friday 7:30pm'});
			Fellowship.create({name: 'Agape Fellowship', about: 'Wix is the leading web publishing platform with over 37 million users worldwide. Wix makes it easier than ever to create a stunning website for free by giving you all the essentials. Choose from 100s of designer-made HTML5 templates. Use the',
				   address:'920 sierra vista ave', city:'Mountain View', country:'United States', zipcode: '78912', meetupDate:'Friday 7:30pm'});
			Fellowship.create({name: 'Young Adult Fellowship', about: 'Wix is the leading web publishing platform with over 37 million users worldwide. Wix makes it easier than ever to create a stunning website for free by giving you all the essentials. Choose from 100s of designer-made HTML5 templates. Use the',
				   address:'920 sierra vista ave', city:'Mountain View', country:'United States', zipcode: '34567', meetupDate:'Friday 7:30pm'});
			Fellowship.create({name: 'Morning Star Fellowship', about: 'Wix is the leading web publishing platform with over 37 million users worldwide. Wix makes it easier than ever to create a stunning website for free by giving you all the essentials. Choose from 100s of designer-made HTML5 templates. Use the',
				   address:'920 sierra vista ave', city:'Mountain View', country:'United States', zipcode: '65432', meetupDate:'Friday 7:30pm'});
			Fellowship.create({name: 'Lin Xin Fellowship', about: 'Wix is the leading web publishing platform with over 37 million users worldwide. Wix makes it easier than ever to create a stunning website for free by giving you all the essentials. Choose from 100s of designer-made HTML5 templates. Use the',
				   address:'920 sierra vista ave', city:'Mountain View', country:'United States', zipcode: '87564', meetupDate:'Friday 7:30pm'});
			Fellowship.create({name: 'Youth Fellowship', about: 'Wix is the leading web publishing platform with over 37 million users worldwide. Wix makes it easier than ever to create a stunning website for free by giving you all the essentials. Choose from 100s of designer-made HTML5 templates. Use the',
				   address:'920 sierra vista ave', city:'Mountain View', country:'United States', zipcode: '23574', meetupDate:'Friday 7:30pm'});
			Fellowship.create({name: 'Jkl Fellowship', about: 'Wix is the leading web publishing platform with over 37 million users worldwide. Wix makes it easier than ever to create a stunning website for free by giving you all the essentials. Choose from 100s of designer-made HTML5 templates. Use the',
				   address:'920 sierra vista ave', city:'Mountain View', country:'United States', zipcode: '57575', meetupDate:'Friday 7:30pm'});
			Fellowship.create({name: 'Mno Fellowship', about: 'Wix is the leading web publishing platform with over 37 million users worldwide. Wix makes it easier than ever to create a stunning website for free by giving you all the essentials. Choose from 100s of designer-made HTML5 templates. Use the',
				   address:'920 sierra vista ave', city:'Mountain View', country:'United States', zipcode: '57575', meetupDate:'Friday 7:30pm'});
			Fellowship.create({name: 'Pqr Fellowship', about: 'Wix is the leading web publishing platform with over 37 million users worldwide. Wix makes it easier than ever to create a stunning website for free by giving you all the essentials. Choose from 100s of designer-made HTML5 templates. Use the',
				   address:'920 sierra vista ave', city:'Mountain View', country:'United States', zipcode: '33433', meetupDate:'Friday 7:30pm'});
		}
	});
}

exports.createDefaultFellowships = createDefaultFellowships;
