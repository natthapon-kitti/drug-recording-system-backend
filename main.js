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

app.get('/medications', (req, res) => {
    connection.connect()

    connection.query('SELECT * FROM Medications', (err, rows, fields) => {
        if (err) throw err

        console.log(rows)
        res.status(200).json(rows)
    })
})

app.get('/records', (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const sql = 'SELECT * FROM Records LIMIT ? OFFSET ?'
    const countSql = 'SELECT COUNT(*) AS total FROM Records'

    connection.query(countSql, (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit)

        connection.query(sql, [limit, offset], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(200).json({
                page,
                limit,
                total,
                totalPages,
                data: rows
            })
        })
    })
})

app.listen(port)