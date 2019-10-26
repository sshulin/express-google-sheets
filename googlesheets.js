const { google } = require('googleapis');

module.exports = {
	authorize: function (params, callback) {
		const oAuth2Client = new google.auth.OAuth2(
			params.client_id,
			params.client_secret,
			'urn:ietf:wg:oauth:2.0:oob'
		)

		if(params.token) oAuth2Client.setCredentials(params.token);

		if(callback) callback(oAuth2Client);
	},
	getAuthUrl: function (oAuth2Client) {
		return oAuth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: ['https://www.googleapis.com/auth/spreadsheets']
		})
	},
	getToken: function (oAuth2Client, authCode, callback) {

		oAuth2Client.getToken(authCode, (error, token) => {
			callback(token, error, oAuth2Client);
		})
	},
	getData: function (oAuth2Client, spreedsheetId, range, callback) {
		const sheets = google.sheets({version: 'v4', auth: oAuth2Client});
		sheets.spreadsheets.values.get({
			spreadsheetId: spreedsheetId,
			range: range,
		}, (err, res) => {
			if (err) return console.log('The API returned an error: ' + err);
			if (callback) callback(res.data);
		});
	},
	updateData: function (oAuth2Client, spreedsheetId, range, values, callback) {
		const sheets = google.sheets({version: 'v4', auth: oAuth2Client});
		sheets.spreadsheets.values.update({
			spreadsheetId: spreedsheetId,
			range: range,
			valueInputOption: 'USER_ENTERED',
			resource: {
				majorDimension: "ROWS",
				values: values
			},
		}, (err, res) => {
			if (callback) callback(res.data);
			if (err) return console.log('The API returned an error: ' + err);
		});
	},
	getDataAuthed: function(authParams, getParams, callback) {
		var vm = this;

		vm.authorize({
			client_id: authParams.client_id,
			client_secret: authParams.client_secret,
			token: authParams.token
		}, (oAuth) => {
			vm.getData(oAuth, getParams.spreadsheetId, getParams.range, callback);
		})
	},
	updateDataAuthed: function(authParams, updateParams, callback) {
		var vm = this;

		vm.authorize({
			client_id: authParams.client_id,
			client_secret: authParams.client_secret,
			token: authParams.token
		}, (oAuth) => {
			vm.updateData(oAuth, updateParams.spreadsheetId, updateParams.range, updateParams.values, callback);
		})
	}
}