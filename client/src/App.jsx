import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Protected from "./components/Protected";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";
import History from "./pages/History";
import Orders from "./pages/Orders";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Checkout from "./pages/Checkout";
import OrderConfirm from "./pages/OrderConfirm";
import Reviews from "./pages/Reviews";
import WriteReview from "./pages/WriteReview";
import CreatorDashboard from "./pages/CreatorDashboard";
import PublishBook from "./pages/PublishBook";
import WriteBook from "./pages/WriteBook";
import AllBooks from "./pages/AllBooks";
import Contact from "./pages/Contact";
import Reader from "./pages/Reader";
import BecomeCreator from "./pages/BecomeCreator";
export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route
            path="/books/:id/read"
            element={
              <Protected>
                <Reader />
              </Protected>
            }
          />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/checkout/:id"
            element={
              <Protected>
                <Checkout />
              </Protected>
            }
          />
          <Route
            path="/order-confirm"
            element={
              <Protected>
                <OrderConfirm />
              </Protected>
            }
          />
          <Route path="/reviews/:id" element={<Reviews />} />
          <Route
            path="/reviews/:id/write"
            element={
              <Protected>
                <WriteReview />
              </Protected>
            }
          />
          <Route
            path="/account"
            element={
              <Protected>
                <Account />
              </Protected>
            }
          />
          <Route
            path="/wishlist"
            element={
              <Protected>
                <Wishlist />
              </Protected>
            }
          />
          <Route
            path="/history"
            element={
              <Protected>
                <History />
              </Protected>
            }
          />
          <Route
            path="/orders"
            element={
              <Protected>
                <Orders />
              </Protected>
            }
          />
          <Route
            path="/my-books"
            element={
              <Protected>
                <Orders />
              </Protected>
            }
          />
          <Route
            path="/creator"
            element={
              <Protected creator>
                <CreatorDashboard />
              </Protected>
            }
          />
          <Route
            path="/creator/publish"
            element={
              <Protected creator>
                <PublishBook />
              </Protected>
            }
          />
          <Route
            path="/creator/write"
            element={
              <Protected creator>
                <WriteBook />
              </Protected>
            }
          />

          <Route
            path="/creator/write/:id"
            element={
              <Protected creator>
                <WriteBook />
              </Protected>
            }
          />
          <Route
            path="/creator/books"
            element={
              <Protected creator>
                <AllBooks />
              </Protected>
            }
          />
          <Route
            path="/become-creator"
            element={
              <Protected>
                <BecomeCreator />
              </Protected>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
