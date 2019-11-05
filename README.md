# express-google-sheets

Express server with bunch of simple apis for authorizing and manipulating google speradsheets data.

## Authorization
All API's use headers for autorization:
`HEADERS['client_id']` and `HEADERS['client_secret']` - developer keys, that could be got [here](https://developers.google.com/sheets/api/quickstart/nodejs) ("Enable the Google Sheets API" button)
`HEADERS['token']` - stringified token from api */auth/step2*


### GET /auth/step1
This API returns url, where after allowing app to use your google account you'll be given `code` for the second authourization API
#### Request
| Property | Description |
| ------ | ------ |
| HEADERS['client_id']  | client id developer key |
| HEADERS['client_secret']  | client secret developer key |

#### Response
``` json
https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fspreadsheets&response_type=code&client_id=yourclientid&redirect_uri=youredirecturi
```

### GET /auth/step2
#### Request
| Property | Description |
| ------ | ------ |
| HEADERS['client_id']  | client id developer key |
| HEADERS['client_secret']  | client secret developer key |
| QUERY['code']  | code from the previous step |

#### Response
``` json
{
  "access_token": "somestring",
  "refresh_token": "somestring",
  "scope": "https://www.googleapis.com/auth/spreadsheets",
  "token_type": "Bearer",
  "expiry_date": 1572100000000
}
```

### POST /table/get
Wrapper of [spreadsheets.values.get](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values#resource-valuerange) method
#### Request
| Property | Description |
| ------ | ------ |
| HEADERS['client_id']  | client id developer key |
| HEADERS['client_secret']  | client secret developer key |
| HEADERS['token']  | Stringified token from `/auth/step2` |
| BODY['spreadsheetId']  | id of desired sheet (from doc url) |
| BODY['sheetTab']  | name of desired sheet tab |
| BODY['range']  | desired range (ex: "A1:B3") |

#### Response
`values` property from [ValueRange](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get)
``` json
[
  ["Name", "Age"],
  ["Aaron", "15"],
  ["Andrew", "20"]
]
```

### POST /table/update
Wrapper of [spreadsheets.values.update](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update) method
#### Request
| Property | Description |
| ------ | ------ |
| HEADERS['client_id']  | client id developer key |
| HEADERS['client_secret']  | client secret developer key |
| HEADERS['token']  | Stringified token from `/auth/step2` |
| BODY['spreadsheetId']  | id of desired sheet (from doc url) |
| BODY['sheetTab']  | name of desired sheet tab |
| BODY['range']  | desired range (ex: "A1:B3") |
| BODY['values']  | updated values (formatted like response in `/table/get`) |
