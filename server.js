require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const multer = require('multer');
const hbs = require('hbs');
const port = 3000;

app.use(express.static('./views'));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

//middleware
const convertToJson = multer();

//config AWS
AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = 'paper';

app.get('/', (req, res) => {
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            return res.send('Internal server error');
        } else {
            return res.render('index', { data: data.Items });
        }
    });
});

app.post('/', convertToJson.fields([]), (req, res) => {

    const { id, tenBaiBao, tacGia, isbn, soTrang, namxb } = req.body;

    const params = {
        TableName: tableName,
        Item: {
            id,
            tenBaiBao,
            tacGia,
            isbn,
            soTrang,
            namxb
        }
    };

    docClient.put(params, (err, data) => {
        if (err) {
            return res.send('Internal server error');
        } else {
            return res.redirect('/');
        }
    });
});

app.post('/delete', convertToJson.fields([]), (req, res) => {

    const { id } = req.body;

    const params = {
        TableName: tableName,
        Key: {
            id
        }
    };

    docClient.delete(params, (err, data) => {
        if (err) {
            return res.send('Internal server error');
        } else {
            return res.redirect('/');
        }
    });
});

app.get('/paper/:id', (req, resp) => {
    const pr = {
        TableName: tableName,
        Key: {
            id: req.params.id
        }
    }

    docClient.get(pr, (e, d) => {
        if (e) {
            return resp.status(500).send(e)
        }
        return resp.status(200).send(d.Item)
    })
})


app.patch('/', convertToJson.fields([]), (req, res) => {
    const params = {
        TableName: tableName,
        Key: {
            id: req.params.id
        },
        UpdateExpression: "set tenBaiBao = :tenBaiBao, tacGia = :tacGia, isbn = :isbn, soTrang = :soTrang, namxb = :namxb",
        ExpressionAttributeValues: {
            ":tenBaiBao": req.body.tenBaiBao,
            ":tacGia": req.body.tacGia,
            ":isbn": req.body.isbn,
            ":soTrang": req.body.soTrang,
            ":namxb": req.body.namxb,
        },
        ReturnValues: "UPDATE_NEW"
    };

    docClient.update(params, (err, data) => {
        if (err) {
            return res.send('Internal server error');
        } else {
            return res.redirect('/');
        }
    });
});

app.listen(port, () => {
    console.log('Server running on port: ', `${port}`);
});