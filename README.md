# Post Blog Platform

Мінімалістична, але повнофункціональна платформа для управління контентом на базі **React**, **Node.js (Express)** та **MySQL**.  
Реалізовано патерн **MVC**.

## Деплой
https://blogproj-p8pr.onrender.com/login

---

## Можливості

- **CRUD-контент:** створення, перегляд, редагування та видалення постів.
- **Два типи сутностей:** пости та фільми (єдиний дашборд).
- **Поліморфні лайки та коментарі:** `item_type` = `post` або `movie`.
- **JWT-авторизація**, перевірка прав власності.
- **Пошук із фільтрацією:** реалізовано серверний пошук + debounce на фронтенді.
- **Покращений UX:** toast-повідомлення, кастомні модальні вікна.

---

## Технологічний стек

**Frontend:** React, React Router, Axios  
**Backend:** Node.js, Express  
**Database:** MySQL (`mysql2/promise`)  
**Security:** JWT, bcryptjs, CORS  
**Хостинг:** Render, Railway

---

## Як запустити локально

### 1. Налаштування БД

1. Створіть базу даних (наприклад, `blogdb`).
2. У таблицях `likes` та `comments` обов’язково має бути поле `item_type` (`post` або `movie`).
3. Створіть файл `server/.env`:

```env
PORT=5000
JWT_SECRET=your_super_secret_key_change_this

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=blogdb
````

---

### 2. Встановлення залежностей

**Бекенд:**

```bash
cd server
npm install
```

**Фронтенд:**

```bash
npm install
```

---

### 3. Запуск

**Бекенд:**

```bash
cd server
npm start
```

**Фронтенд:**

```bash
npm start
```

Проєкт буде доступний за адресою:
[http://localhost:3000](http://localhost:3000)

---

## SQL-схеми таблиць

### Основні таблиці

| Таблиця | Призначення | Ключові поля                                                                                    |
| ------- | ----------- | ----------------------------------------------------------------------------------------------- |
| users   | Користувачі | id, first_name, last_name, username, email, password, phone, birth_date, avatar_url, created_at |
| posts   | Пости       | id, user_id, title, content, image, created_at                                                  |
| movies  | Фільми      | id, user_id, title, genre, year, image, created_at                                              |

### Поліморфні таблиці

| Таблиця  | Призначення | Ключові поля                                           |
| -------- | ----------- | ------------------------------------------------------ |
| likes    | Лайки       | id, post_id, user_id, item_type, created_at            |
| comments | Коментарі   | id, post_id, author_id, content, item_type, created_at |

### Соціальні зв’язки

| Таблиця | Призначення | Ключові поля                              |
| ------- | ----------- | ----------------------------------------- |
| follows | Підписки    | id, follower_id, following_id, created_at |

### Зв’язки між таблицями

```
users (1) ──> (N) posts
users (1) ──> (N) movies
users (1) ──> (N) likes
users (1) ──> (N) comments
users (1) ──> (N) follows (follower_id)
users (1) ──> (N) follows (following_id)

posts/movies (1) ──> (N) likes      [post_id + item_type]
posts/movies (1) ──> (N) comments   [post_id + item_type]
```

---

## Troubleshooting

* **404 сторінка:** натисніть "Go Home" → повернення на логін.
* **Не входить у акаунт:** перевірте email/username і пароль.
* **Контент не вантажиться:** оновіть сторінку або перевірте інтернет.
* **Є помилки:** відкрийте DevTools (F12) → Console.

---

## Контакти

У разі проблем — пишіть: **[tysiaknastia@gmail.com](mailto:tysiaknastia@gmail.com)**
