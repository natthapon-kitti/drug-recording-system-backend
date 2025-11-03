const express = require('express')
const mysql = require('mysql2')
const app = express()
const port = 8000
require('dotenv').config();


const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

app.get('/', (req, res) => {
    return res.send(200)
})

// GET students
app.get('/students', (req, res) => {

    connection.connect()

    connection.query('SELECT * FROM Students', (err, rows, fields) => {
        if (err) throw err

        console.log(rows)
        res.status(200).json(rows)
    })
})

app.listen(port)