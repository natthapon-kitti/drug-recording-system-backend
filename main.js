const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const app = express()
const port = 8000
require('dotenv').config();

app.use(express.json())
app.use(cors())

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
    const filterId = req.query.filterId && req.query.filterId != 0 ? parseInt(req.query.filterId) : null

    let sql = 'SELECT * FROM Records'
    let countSql = 'SELECT COUNT(*) AS total FROM Records'
    let sqlParams = []
    let countParams = []

    if (filterId !== null) {
        sql += ' WHERE record_id = ?'
        countSql += ' WHERE record_id = ?'
        sqlParams.push(filterId)
        countParams.push(filterId)
    } else {
        sql += ' LIMIT ? OFFSET ?'
        sqlParams.push(limit, offset)
    }

    // ดึงจำนวนรวมก่อน
    connection.query(countSql, countParams, (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });

        const total = countResult[0].total
        const totalPages = Math.ceil(total / limit)

        // ดึงข้อมูลจริง
        connection.query(sql, sqlParams, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message })

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

app.get('/records/:id', (req, res) => {
    const id = req.params.id

    const sql = 'SELECT * FROM Records WHERE record_id = ?'



    connection.query(sql, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message })

        res.status(200).json({
            data: rows
        })
    })
})

app.post('/records/create', (req, res) => {
    console.log(req.body)
    const { student_id, med_id, symptoms } = req.body
    const timestamp = new Date()

    const sql = 'INSERT INTO Records  (student_id,med_id,symptoms,timestamp) VALUES (?,?,?,?)'

    connection.query(sql, [student_id, med_id, symptoms, timestamp], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message })


        res.status(200).json({
            message: 'Record added successfully',
            record_id: rows.insertId
        })
    })


})

app.put('/records/edit', (req, res) => {
    const { student_id, med_id, symptoms, record_id } = req.body
    const timestamp = new Date()

    const sql = 'UPDATE Records SET student_id = ?, med_id = ?, symptoms = ?,timestamp = ? WHERE record_id = ?'

    connection.query(sql, [student_id, med_id, symptoms, timestamp, record_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message })

        console.log(rows)

        res.status(200).json({
            message: 'Record edited successfully',
            record_id: record_id
        })

    })

})

app.delete('/records/delete/:record_id', (req, res) => {
    const record_id = req.params.record_id
    console.log(record_id)

    const sql = 'DELETE FROM Records WHERE record_id = ?'

    connection.query(sql, [record_id], (err, results) => {

        if (err) return res.status(500).json({ error: err.message })

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: 'Record not found',
                record_id: record_id
            })
        }


        res.status(200).json({
            message: 'Record deleted successfully',
            record_id: record_id
        })
    })
})

app.listen(port)