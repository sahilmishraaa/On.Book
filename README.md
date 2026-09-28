# On.Book — MERN recreation

This is a full MERN recreation of the supplied `ebook-store-read-write` Django project, including the UI-development branch additions.

## Included

- Original On.Book landing page and visual language
- Login / signup / profile editing
- Books and categories search UI
- Wishlist and reading history
- Orders / library
- Checkout and order confirmation flow
- Ratings, review listing, filtering, sorting, helpful buttons, write-review page
- Creator / Author Dashboard
- Publish Book workflow with cover + ebook upload
- Write a Book editor
- All Books creator management page
- About Us page and contact form
- MongoDB models and Express APIs
- JWT authentication and bcrypt password hashing
- Original image assets copied from the Django repository
- MongoDB seed data for the homepage books and categories

## Run

### 1. Backend

```powershell
cd server
npm install
copy .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/onbook
JWT_SECRET=change_this_for_real_deployments
CLIENT_URL=http://localhost:5173
```

Make sure MongoDB is running, then:

```powershell
npm run seed
npm run dev
```

### 2. Frontend

In another terminal:

```powershell
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo creator account

`admin / admin123`

## Notes

The original Django project contains UI commits for the author dashboard, publishing, reviews, search, checkout and order confirmation. Those are all represented in this MERN version. The original `writebook.html` and `allbooks.html` were empty, so the MERN version implements the intended functionality rather than leaving them blank.

The payment system in the source project was described as future work. Checkout here is deliberately a demo purchase flow and does not charge a real payment method.

## Reading access and demo payments

- Free books can be opened in the reader by any signed-in user without a purchase.
- Paid books cannot be read until the user has a completed purchase for that book.
- Paid ebook files are not exposed as public static files. The backend streams them through `GET /api/ebooks/:id/read` only after checking the user's order.
- The checkout is a demo payment flow. No real payment gateway or money is used. Clicking `Proceed to Payment` completes the purchase immediately and adds the book to `My Books`.
- `My Books` is available at `/my-books` and contains free books added to the library and paid books purchased through the demo checkout.
- The supplied example PDF is used as the ebook file for seeded books for demonstration purposes.
