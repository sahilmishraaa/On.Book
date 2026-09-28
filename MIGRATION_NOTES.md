# Django → MERN migration notes

## Source branches covered
- `master`
- `origin/ui-development`

## Django → MERN mapping

| Django | MERN |
|---|---|
| auth.User | User model + JWT |
| ebooks.Ebook | Ebook model |
| ebooks.Category | Category model |
| Django templates | React pages/components |
| Django views | Express route handlers |
| SQLite | MongoDB |
| ImageField/FileField | Multer uploads |
| Django sessions | JWT local storage |
| Review UI | Review model + REST API |
| Author dashboard UI | CreatorDashboard.jsx |
| publishbook.html | PublishBook.jsx |
| writebook.html (empty) | WriteBook.jsx |
| allbooks.html (empty) | AllBooks.jsx |
| checkout.html | Checkout.jsx |
| orderconfirm.html | OrderConfirm.jsx |
| search.html | Books.jsx |
| reviews.html | Reviews.jsx |
| writereview.html | WriteReview.jsx |

The source `base.html` exposes an About Us navigation item but no standalone about template exists in the supplied commits, so this MERN recreation includes a functional About page rather than leaving the navigation item dead.

## Demo reading and purchase access

The MERN version now preserves the intended ebook access rule:

1. A free book is readable without purchase after login.
2. A paid book is not readable until a completed order exists for that user and book.
3. The PDF is streamed by an authenticated backend endpoint instead of being served as a public `/uploads/books/...` URL.
4. Checkout is intentionally a demo payment. `Proceed to Payment` immediately creates a completed order.
5. Completed purchases and free library additions appear under `My Books`.
