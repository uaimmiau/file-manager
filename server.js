let express = require("express");
let app = express();
let path = require("path");
let hbs = require('express-handlebars');
// let bodyParser = require("body-parser");
let formidable = require('formidable');
const PORT = 3000;
let context = {
    files: []
};
let tab = [];
let idCount = 1;

// app.use(bodyParser.urlencoded({
//     extended: true
// }));

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
}));
app.engine('hbs', hbs({
    extname: '.hbs',
    partialsDir: "views/partials",
}));
app.set('view engine', 'hbs');
//APP GETy i inne takie
app.get('/', (req, res) => {
    res.redirect("/upload");
})

app.get('/upload', (req, res) => {
    res.render('upload.hbs')
})

app.get('/filemanager', (req, res) => {
    res.render('filemanager.hbs', context)
})

app.get('/info', (req, res) => {
    res.render('info.hbs')
})

app.post('/handleUpload', (req, res) => {
    let form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/static/upload/';
    form.keepExtensions = true;
    form.multiples = true;
    form.parse(req, (err, fields, files) => {
        // console.log('files', files);
        // console.log(files.imagetoupload.size)
        // res.send(files)
        for (let file of Object.entries(files)) {
            try {
                for (let property of file[1]) {
                    let relativePath = property.path.substring(property.path.indexOf('static'))
                    relativePath = relativePath.split('\\').join('/')
                    relativePath = '/app/'.concat(relativePath)
                    tab.push({
                        id: idCount,
                        name: property.name,
                        path: relativePath,
                        size: property.size,
                        type: property.type,
                        savedate: Date.now(),
                        pathToImage: `gfx/${property.name.slice((Math.max(0, property.name.lastIndexOf(".")) || Infinity) + 1)}.png`,
                        downloadPath: path.basename(property.path)
                    })
                    idCount++;
                }

            } catch (error) {
                let relativePath = file[1].path.substring(file[1].path.indexOf('static'))
                relativePath = relativePath.split('\\').join('/')
                relativePath = '/app/'.concat(relativePath)
                tab.push({
                    id: idCount,
                    name: file[1].name,
                    path: relativePath,
                    size: file[1].size,
                    type: file[1].type,
                    savedate: Date.now(),
                    pathToImage: `gfx/${file[1].name.slice((Math.max(0, file[1].name.lastIndexOf(".")) || Infinity) + 1)}.png`,
                    downloadPath: path.basename(file[1].path)
                })
                idCount++;
            }
        }
        context = {
            files: tab
        }
        res.redirect('/filemanager')
    });
});

app.get('/info/:id', (req, res) => {
    const id = req.params.id;
    let con = {};
    for (let el of tab) {
        if (id == el.id) {
            con = el;
        }
    }
    res.render('info.hbs', con)
})

app.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    let i = 0;
    for (let el of tab) {
        if (id == el.id) {
            tab.splice(i, 1)
        }
        i++;
    }
    context = {
        files: tab
    }
    res.redirect('/filemanager');
})

app.get('/delete', (req, res) => {
    tab = [];
    context = {
        files: tab
    }
    res.redirect('/filemanager');
})

app.use(express.static("static"));
app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT);
});