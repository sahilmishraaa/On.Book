import { Link } from "react-router-dom";

export default function About() {
    return (
        <section className="about-page">

            {/* Hero */}
            <div className="about-hero">
                <div className="about-hero-content">
                    <p className="eyebrow">ABOUT ON.BOOK</p>

                    <h1>
                        A place for people
                        <br />
                        who love books.
                    </h1>

                    <p className="about-hero-text">
                        On.Book is a digital space where readers discover
                        stories, creators share their work, and every book
                        has a place to be found.
                    </p>

                    <div className="about-hero-buttons">
                        <Link to="/books" className="dark-btn">
                            Explore Books
                        </Link>

                        <Link to="/publish" className="outline-btn">
                            Publish Your Book
                        </Link>
                    </div>
                </div>

                <div className="about-hero-image">
                    <img
                        src="/assets/img/core/1.jpeg"
                        alt="Featured book"
                    />
                </div>
            </div>

            {/* Introduction */}
            <div className="about-intro">
                <div className="about-intro-label">
                    <span>01</span>
                    <p>OUR STORY</p>
                </div>

                <div className="about-intro-content">
                    <h2>
                        More than a library.
                        <br />
                        A home for stories.
                    </h2>

                    <p>
                        Reading has always been about more than turning
                        pages. It is about discovering new ideas, entering
                        unfamiliar worlds and finding stories that stay
                        with us.
                    </p>

                    <p>
                        On.Book brings that experience into one simple
                        platform. Readers can explore free and paid ebooks,
                        save their favorites, purchase titles and keep track
                        of what they have been reading.
                    </p>

                    <p>
                        At the same time, creators get a place to share their
                        work, publish ebooks and reach readers who are looking
                        for something new.
                    </p>
                </div>
            </div>

            {/* Image section */}
            <div className="about-image-section">
                <img
                    src="/assets/img/core/2.jpeg"
                    alt="Books and reading"
                />

                <div className="about-image-caption">
                    <p>
                        Stories connect people, ideas and imagination.
                    </p>
                </div>
            </div>

            {/* For Readers / Creators / Everyone */}
            <div className="about-values">
                <div className="about-section-heading">
                    <p className="eyebrow">WHAT ON.BOOK OFFERS</p>
                    <h2>Built for every part of the reading journey.</h2>
                </div>

                <div className="about-grid">

                    <article className="about-card">
                        <span className="about-card-number">01</span>

                        <div className="about-card-image">
                            <img
                                src="/assets/img/core/3.jpg"
                                alt="Reader"
                            />
                        </div>

                        <h3>For Readers</h3>

                        <p>
                            Discover free and paid ebooks, browse different
                            categories, save your favorite titles and build
                            your personal reading library.
                        </p>

                        <Link to="/books">
                            Browse Books →
                        </Link>
                    </article>

                    <article className="about-card">
                        <span className="about-card-number">02</span>

                        <div className="about-card-image">
                            <img
                                src="/assets/img/core/4.jpg"
                                alt="Creator"
                            />
                        </div>

                        <h3>For Creators</h3>

                        <p>
                            Turn your ideas into published stories. Add
                            covers, descriptions, pricing and categories and
                            share your work with readers.
                        </p>

                        <Link to="/publish">
                            Start Creating →
                        </Link>
                    </article>

                    <article className="about-card">
                        <span className="about-card-number">03</span>

                        <div className="about-card-image">
                            <img
                                src="/assets/img/core/stranger.png"
                                alt="Book community"
                            />
                        </div>

                        <h3>For Everyone</h3>

                        <p>
                            Reviews, ratings, wishlists and reading history
                            make it easier to discover books and decide what
                            deserves your next hour.
                        </p>

                        <Link to="/books">
                            Find Your Next Book →
                        </Link>
                    </article>

                </div>
            </div>

            {/* Stats */}
            <div className="about-stats">
                <div>
                    <strong>100+</strong>
                    <span>Books to Discover</span>
                </div>

                <div>
                    <strong>6+</strong>
                    <span>Book Categories</span>
                </div>

                <div>
                    <strong>24/7</strong>
                    <span>Access to Your Library</span>
                </div>

                <div>
                    <strong>∞</strong>
                    <span>Stories to Explore</span>
                </div>
            </div>

            {/* Mission */}
            <div className="about-mission">
                <div className="about-mission-image">
                    <img
                        src="/assets/img/core/1.jpeg"
                        alt="Open book"
                    />
                </div>

                <div className="about-mission-content">
                    <p className="eyebrow">OUR PHILOSOPHY</p>

                    <h2>
                        Every story deserves
                        <br />
                        a reader.
                    </h2>

                    <p>
                        We believe that great stories can come from anywhere
                        and anyone. On.Book is designed to make discovering
                        those stories easier while giving creators the tools
                        they need to put their work out into the world.
                    </p>

                    <p>
                        Whether you're looking for your next favorite book or
                        preparing to publish your first one, On.Book is built
                        to keep the experience simple, personal and focused
                        on what matters most — the story.
                    </p>
                </div>
            </div>

            {/* Contact CTA */}
            <div className="contact-strip">
                <div>
                    <p className="eyebrow">LET'S CONNECT</p>

                    <h2>Have a question?</h2>

                    <p>
                        We'd love to hear from you and help you make the most
                        of On.Book.
                    </p>
                </div>

                <Link className="dark-btn" to="/contact">
                    Contact Us
                </Link>
            </div>

        </section>
    );
}