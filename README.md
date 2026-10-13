# Django + React: JWT-аутентификация

Небольшое учебное приложение: Django REST Framework проверяет логин и пароль и выдаёт пару access/refresh токенов Simple JWT. React сохраняет пару токенов, добавляет заголовок `Authorization: Bearer <access>` к защищённым запросам и автоматически обновляет access-токен, если сервер вернул `401`.

## Требования

- Python 3.10+
- Node.js 18+

## Запуск Django API

Из корня проекта:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

В `createsuperuser` задайте логин и пароль, затем используйте их для входа в React. Django API будет доступно на `http://127.0.0.1:8000`.

## Запуск React

Во втором терминале из корня проекта:

```powershell
cd frontend
npm install
npm run dev
```

Откройте адрес Vite, показанный в терминале (обычно `http://localhost:5173`). Vite проксирует `/api` на Django.

## API

| Метод и путь | Назначение | Авторизация |
| --- | --- | --- |
| `POST /api/auth/token/` | Получить `access` и `refresh` (`username`, `password`) | Нет |
| `POST /api/auth/refresh/` | Обновить access-токен (`refresh`) | Нет |
| `GET /api/auth/me/` | Получить профиль текущего пользователя | Bearer access |
| `GET /api/dashboard/` | Получить пример защищённых данных | Bearer access |

Access-токен действует 10 минут, refresh — 1 день. При обновлении Simple JWT ротирует refresh-токен и добавляет старый в blacklist. В разработке фронтенд хранит токены в `localStorage`; для production рекомендуется перенести refresh-токен в защищённую `HttpOnly` cookie, задать секреты через окружение, отключить `DEBUG` и настроить HTTPS и `ALLOWED_HOSTS`.
