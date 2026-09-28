# On.Book

A full-stack MERN-based eBook platform where users can discover, purchase, read, review, and manage books. The platform also provides creator functionality that allows authors to write, save drafts, and publish their own books.

## Features

### Reader Features

- User registration and login
- JWT-based authentication
- Browse available books
- Search books by title, description, or keywords
- Filter books by category
- Filter books by free/paid type
- View detailed book information
- Purchase books
- Personal library
- Wishlist functionality
- Reading history
- Ratings and reviews
- Mark reviews as helpful/not helpful
- Built-in book reader
- User profile management

### Creator Features

- Become a creator
- Creator dashboard
- Write books using the built-in editor
- Save books as drafts
- Continue editing saved drafts
- Publish books
- Add book title, description, category, pricing, keywords, and publisher
- Upload book covers
- Upload book files
- Manage published books
- Track purchases and book information

### General Features

- Responsive user interface
- Category-based browsing
- Book search
- JWT authentication
- Role-based authorization
- MongoDB database
- REST API
- File uploads
- Protected routes

---

## Tech Stack

### Frontend

- React
- React Router
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Slugify

### Development Tools

- Git
- GitHub
- Nodemon
- VS Code

---

## Project Structure

```text
onbook/
│
├── client/
│   ├── public/
│   │   └── assets/
│   │
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── seed.js
│   │   └── server.js
│   │
│   └── package.json
│
├── .gitignore
├── README.md
└── MIGRATION_NOTES.md
