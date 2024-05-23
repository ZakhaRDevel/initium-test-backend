var express = require('express');
var app = express();
var fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

app.get('/users', function (req, res) {
    const {name, email, phone, sortBy, order} = req.query;

    fs.readFile('db.json', 'utf-8', function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Ошибка чтения файла');
            return;
        }

        let users = JSON.parse(data).users;

        if (name) {
            users = users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
        }
        if (email) {
            users = users.filter(user => user.email.toLowerCase().includes(email.toLowerCase()));
        }
        if (phone) {
            users = users.filter(user => user.phone.includes(phone));
        }

        if (sortBy) {
            users.sort((a, b) => {
                if (a[sortBy] < b[sortBy]) {
                    return order === 'desc' ? 1 : -1;
                }
                if (a[sortBy] > b[sortBy]) {
                    return order === 'desc' ? -1 : 1;
                }
                return 0;
            });
        }

        res.json(users);
    });
});

app.put('/users', function (req, res) {
    const newTaskList = req.body;
    const jsonContent = JSON.stringify({ users: newTaskList }, null, 2);

    fs.writeFile('db.json', jsonContent, 'utf8', function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Ошибка записи в файл');
            return;
        }
        res.status(200).json({ message: 'Список задач успешно обновлен' });
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
            res.status(200).json({ message: 'Список успешно создан' });
        });
    });
});

app.delete('/users', function (req, res) {
    const userIds = req.body.ids; // Ожидаем массив идентификаторов в теле запроса

    if (!Array.isArray(userIds)) {
        return res.status(400).json({message: 'Идентификаторы пользователей должны быть в виде массива'});
    }

    fs.readFile('db.json', 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка чтения файла');
        }

        let taskLists = JSON.parse(data);
        taskLists.users = taskLists.users.filter(user => !userIds.includes(user.id));

        fs.writeFile('db.json', JSON.stringify(taskLists, null, 2), 'utf8', function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка записи в файл');
            }
            res.status(200).json({message: 'Пользователи успешно удалены'});
        });
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});