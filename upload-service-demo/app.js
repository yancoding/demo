const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const static = require('koa-static');
const cors = require('koa2-cors')
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const MongoClient = require('mongodb').MongoClient
const mongoose = require('mongoose')

// 服务地址、端口
const hostname = '127.0.0.1'
const port = 3000

// 静态资源目录、上传目录
const staticPath = 'static'
const uploadPath = 'upload'

// mongodb地址、数据库
const dbUrl = 'mongodb://localhost:27017'
const dbName = 'test'

let db = MongoClient.connect(dbUrl, { useNewUrlParser: true }, (err, client) => {
    assert.strictEqual(err, null)
    return client.db(dbName)
})
console.log(db)

const app = new Koa()
const router = new Router()

let dir = __dirname
path.join(staticPath, uploadPath).split(path.sep).forEach(value => {
    dir = path.join(dir, value)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
})

app.use(cors())
app.use(static(staticPath))

router
    .get('/', (ctx, next) => {
        ctx.body = 'hello world!'
    })
    .get('/api/files', async (ctx, next) => {
        let files = null
            ctx.body = {
            files
        }
    })
    .post('/api/upload', koaBody({
        multipart: true,
        formidable: {
        }
    }), (ctx, next) => {
        if (!ctx.request.files) {
            ctx.status = 400
            return
        }
        let file = ctx.request.files.file

        let extname = path.extname(file.name)
        let fileName = `${Date.now()}${extname}`
        let fileReader = fs.createReadStream(file.path)
        let writeStream = fs.createWriteStream(path.join(__dirname, staticPath, uploadPath, `${fileName}`))

        fileReader.pipe(writeStream)
        let url = `http://${hostname}:${port}/${uploadPath}/${fileName}`

        console.log(db)
        const collection = db.collection('files')
        collection.insertMany([{
            fileName,
            extname,
            url
        }], (err, result) => {
            if (!err) {
                console.log('插入文档成功！')
            } else {
                console.log('插入文档失败！')
            }
        })
        ctx.body = {
            url
        }
    })

app
    .use(router.routes())
    .use(router.allowedMethods())

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})