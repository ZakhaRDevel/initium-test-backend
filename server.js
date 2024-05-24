const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/users', function (req, res) {
  const { name, email, phone, sortBy, order } = req.query;

  fs.readFile('db.json', 'utf-8', function (err, data) {
    if (err) {
      console.error(err);
      res.status(500).send('Ошибка чтения файла');
      return;
    }

    let users = JSON.parse(data).users;

    if (name) {
      users = users.filter((user) =>
          user.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (email) {
      users = users.filter((user) =>
          user.email.toLowerCase().includes(email.toLowerCase())
      );
    }
    if (phone) {
      users = users.filter((user) => user.phone.includes(phone));
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

app.put('/users/:id', function (req, res) {
  const userId = parseInt(req.params.id, 10);
  const updatedUser = req.body;

  fs.readFile('db.json', 'utf8', function (err, data) {
    if (err) {
      console.error('Ошибка чтения файла:', err);
      res.status(500).send('Ошибка чтения файла');
      return;
    }

    try {
      let taskLists = JSON.parse(data);
      let users = taskLists.users;
      const userIndex = users.findIndex(user => user.id === userId);

      if (userIndex === -1) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      // Обновляем пользователя
      users[userIndex] = { ...users[userIndex], ...updatedUser };

      fs.writeFile('db.json', JSON.stringify(taskLists, null, 2), 'utf8', function (err) {
        if (err) {
          console.error('Ошибка записи в файл:', err);
          return res.status(500).send('Ошибка записи в файл');
        }
        res.status(200).json({success: true});
      });
    } catch (parseErr) {
      console.error('Ошибка парсинга JSON:', parseErr);
      res.status(500).send('Ошибка обработки данных');
    }
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
      res.status(200).json({ success: true });
    });
  });
});

app.delete('/users', function (req, res) {
  const userIds = req.body.ids;

  if (!Array.isArray(userIds)) {
    return res.status(400).json({
      message: 'Идентификаторы пользователей должны быть в виде массива',
    });
  }

  fs.readFile('db.json', 'utf8', function (err, data) {
    if (err) {
      console.error('Ошибка чтения файла:', err);
      return res.status(500).send('Ошибка чтения файла');
    }

    try {
      let taskLists = JSON.parse(data);

      // Логирование для отладки
      console.log('Идентификаторы для удаления:', userIds);
      console.log('Список пользователей до удаления:', taskLists.users);

      const originalUserCount = taskLists.users.length;

      // Преобразуем идентификаторы в числа для сравнения
      const userIdsAsNumbers = userIds.map(id => parseInt(id, 10));
      taskLists.users = taskLists.users.filter(
          (user) => !userIdsAsNumbers.includes(user.id)
      );

      const newUserCount = taskLists.users.length;

      console.log('Список пользователей после удаления:', taskLists.users);

      // Проверка, были ли пользователи удалены
      if (originalUserCount === newUserCount) {
        console.warn('Пользователи не были удалены. Проверьте идентификаторы пользователей.');
      }

      fs.writeFile('db.json', JSON.stringify(taskLists, null, 2), 'utf8', function (err) {
        if (err) {
          console.error('Ошибка записи в файл:', err);
          return res.status(500).send('Ошибка записи в файл');
        }
        res.status(200).json({success: true});
      });
    } catch (parseErr) {
      console.error('Ошибка парсинга JSON:', parseErr);
      res.status(500).send('Ошибка обработки данных');
    }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});