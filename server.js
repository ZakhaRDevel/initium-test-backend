var express = require('express');
var app = express();
var fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

app.get('/users', function (req, res) {
    fs.readFile('db.json', 'utf-8', function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Ошибка чтения файла');
            return;
        }
        var jsonData = JSON.parse(data);
        res.json(jsonData);
    });
});

app.put('/users', function (req, res) {
    const newTaskList = req.body;
    const jsonContent = JSON.stringify(newTaskList, null, 2);

    fs.writeFile('db.json', jsonContent, 'utf8', function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Ошибка записи в файл');
            return;
        }
        res.status(200).json({message: 'Список задач успешно обновлен'});
    });
});

app.post('/users', function (req, res) {
    const newTask = req.body;
    fs.readFile('db.json', 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Ошибка чтения файла');
            return;
        }
        const taskList = JSON.parse(data);
        newTask.id = taskList.users.length;
        taskList.users.push(newTask);
        const jsonContent = JSON.stringify(taskList, null, 2);
        fs.writeFile('db.json', jsonContent, 'utf8', function (err) {
            if (err) {
                console.error(err);
                res.status(500).send('Ошибка записи в файл');
                return;
            }
            res.status(200).json({message: 'Список успешно создан'});
        });
    });
});

app.delete('/users/:id', function (req, res) {
    const userId = parseInt(req.params.id);

    fs.readFile('db.json', 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Ошибка чтения файла');
            return;
        }

        let taskLists = JSON.parse(data);
        const listIndex = taskLists.users.findIndex(list => list.id === userId);
        if (listIndex === -1) {
            res.status(404).send('Пользователь с указанным id не найден');
            return;
        }

        taskLists.users.splice(listIndex, 1);

        fs.writeFile('db.json', JSON.stringify(taskLists, null, 2), 'utf8', function (err) {
            if (err) {
                console.error(err);
                res.status(500).send('Ошибка записи в файл');
                return;
            }
            res.status(200).json({message: 'Пользователь успешно удален'});
        });
    });
});

// Используем переменную окружения для назначения порта
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});