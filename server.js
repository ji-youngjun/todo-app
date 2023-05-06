const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }))
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.use('/public', express.static('public'));

var db;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.fpcbaav.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true }, function (에러, client) {
    if (에러) return console.log(에러)
    db = client.db('TodoApp')

    app.listen(8080, function () {
        console.log('listening on 8080')
    });
})


app.get('/pet', function (요청, 응답) {
    응답.send('펫용품 쇼핑할 수 있는 페이지입니다.');
});
app.get('/beauty', function (요청, 응답) {
    응답.send('뷰티용품을 쇼핑할 수 있는 페이지입니다.')
});
app.get('/', function (요청, 응답) {
    응답.render('/index.ejs')
});
app.get('/write', function (요청, 응답) {
    응답.render('write.ejs')
});

app.post('/add', function (요청, 응답) {  // 누가 폼에서 /add로 POST 요청하면 
    응답.send('전송완료')
    db.collection('counter').findOne({ name: '게시물갯수' }, function (에러, 결과) {  // DB.counter 내의 총게시물갯수를 찾음
        console.log(결과.totalPost)  // 총게시물갯수를 변수에 저장
        let 총게시물갯수 = 결과.totalPost;
        db.collection('post').insertOne({ _id: 총게시물갯수 + 1, 제목: 요청.body.title, 날짜: 요청.body.date }, function (에러, 결과) {  // DB.post에 새게시물을 기록함
            console.log('저장완료');
            db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (에러, 결과) {  // 완료되면 DB.counter 내의 총게시물갯수 +1
                if (에러) { return console.log(에러) }
            })
        });

    });
});

app.get('/list', function (요청, 응답) {
    db.collection('post').find().toArray(function (에러, 결과) {
        console.log(결과);
        응답.render('list.ejs', { posts: 결과 });
    });

});

app.delete('/delete', function (요청, 응답) {
    console.log(요청.body);
    요청.body._id = parseInt(요청.body._id);
    db.collection('post').deleteOne(요청.body, function (에러, 결과) {
        console.log('삭제완료');
        응답.status(200).send({ message: '성공했습니다' })
    })
})

app.get('/detail/:id', function (요청, 응답) {
    db.collection('post').findOne({ _id: parseInt(요청.params.id) }, function (에러, 결과) {
        console.log(결과);
        응답.render('detail.ejs', { data: 결과 });
    })
})

app.get('/edit/:id', function (요청, 응답) {
    db.collection('post').findOne({ _id: parseInt(요청.params.id) }, function (에러, 결과) {

        응답.render('edit.ejs', { post: 결과 })
    })
})

app.put('/edit', function (요청, 응답) {
    db.collection('post').updateOne({ _id: parseInt(요청.body.id) }, { $set: { 제목: 요청.body.title, 날짜: 요청.body.date } }, function (에러, 결과) {
        console.log('수정완료')
        응답.redirect('/list')
    })
})