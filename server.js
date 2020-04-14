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

app.post('/mapped/get', (req, res) => {

	gsheets.authorize({
		client_id: req.headers['client_id'],
		client_secret: req.headers['client_secret'],
		token: JSON.parse(req.headers['token'])
	}, (oAuth) => {
		let scheme;
		let result = [];
		let firstRow = +req.body.range.split(':')[0].replace(/\D/g,'');

		gsheets.getData(oAuth, req.body.spreadsheetId, req.body.sheetTab + '!' + req.body.range, (data) => {

			function fillResult () {
				data.values.forEach((row, index) => {
					let col = {};
					col._rowIndex = index + firstRow;
					row.forEach((colValue, colIndex) => {
						col[scheme[colIndex]] = colValue;
					});

					if(col._rowIndex != 1) result.push(col);
				});
				res.send(result);
			}

			if(firstRow != 1) {
				gsheets.getData(oAuth, req.body.spreadsheetId, req.body.sheetTab + '!A1:Z1', (schemeData) => {
					scheme = data.values[0];
					fillResult();
				});
			} else {
				scheme = data.values[0];
				fillResult();
			}
		});
	})
})

app.post('/mapped/update', (req, res) => {
	gsheets.authorize({
		client_id: req.headers['client_id'],
		client_secret: req.headers['client_secret'],
		token: JSON.parse(req.headers['token'])
	}, (oAuth) => {
		let scheme;
		let result = [];

		gsheets.getData(oAuth, req.body.spreadsheetId, req.body.sheetTab + '!A1:Z1', (schemeData) => {
			scheme = schemeData.values[0];
			scheme.forEach((value) => {
				result.push(req.body.value[value])
			});
			gsheets.updateData(oAuth, req.body.spreadsheetId, req.body.sheetTab + '!A' + req.body.value._rowIndex + ':Z' + req.body.value._rowIndex, [result], (data) => {
				res.send(data);
			});
		});
	})
})