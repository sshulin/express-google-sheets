const gsheets = require ('./googlesheets');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.listen(port, () => {
	console.log('Listening on http://localhost:' + port);
});

app.get('/auth/step1', (req, res) => {
	gsheets.authorize({
		client_id: req.headers['client_id'],
		client_secret: req.headers['client_secret']
	}, (oAuth) => {
		res.send(gsheets.getAuthUrl(oAuth));
	});
})

app.get('/auth/step2', (req, res) => {
	gsheets.authorize({
		client_id: req.headers['client_id'],
		client_secret: req.headers['client_secret']
	}, (oAuth) => {
		gsheets.getToken(oAuth, req.query.code, (token, error) => {
			res.send({
				token,
				error
			})
		})
	});
})

app.post('/table/get', (req, res) => {
	gsheets.getDataAuthed({
		client_id: req.headers['client_id'],
		client_secret: req.headers['client_secret'],
		token: JSON.parse(req.headers['token'])
	}, {
		spreadsheetId: req.body.spreadsheetId,
		range: req.body.sheetTab + '!' + req.body.range
	}, (data) => {
		res.send(data.values);
	});
})

app.post('/table/update', (req, res) => {
	gsheets.updateDataAuthed({
		client_id: req.headers['client_id'],
		client_secret: req.headers['client_secret'],
		token: JSON.parse(req.headers['token'])
	}, {
		spreadsheetId: req.body.spreadsheetId,
		range: req.body.sheetTab + '!' + req.body.range,
		values: req.body.values
	}, (data) => {
		res.send(data);
	});
})