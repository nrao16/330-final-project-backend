const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

const User = require('../models/user');
const Book = require('../models/book');
const Author = require("../models/author");

describe('/books', () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);
  afterEach(testUtils.clearDB);

  let testBook1 = {
    "title": "Hobbit",
    "genre": "Fantasy",
    "isbn": "888",
    "summary": "Prequel",
    "publishedYear": 1961
  };

  let testAuthor1 = {
    "name": "Tolkein",
    "gender": "M",
    "dateOfBirth": "1/3/1892",
    "blurb": "University of Oxford profession father of modern fantasy lit"
  };

  let testBook2 = {
    "title": "Sherlock Holmes",
    "genre": "private eye",
    "isbn": "777",
    "summary": "Ace detective solving crimes",
    "publishedYear": 1887
  };

  let testAuthor2 = {
    name: "Arthur Conan Doyle",
    gender: "Male",
    dateOfBirth: "2/25/1852",
    blurb: "English novelist"
  }

  describe('Before login', () => {
    describe('GET /', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).get("/books");
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .get("/books")
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });

    describe('GET /:id', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).get("/books/123");
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .get("/books/456")
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });

    describe('POST /', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).put("/books").send(testBook1);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer BAD')
          .send(testBook1);
        expect(res.statusCode).toEqual(401);
      });
    });

    describe('PUT /', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).put("/books").send(testBook1);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer BAD')
          .send(testBook1);
        expect(res.statusCode).toEqual(401);
      });
    });

  });

  describe('after login', () => {

    let savedAuthor1;
    let savedBook1;
    let savedAuthor2;
    let savedBook2;

    // add an author and associate it with book
    beforeEach(async () => {
      savedAuthor1 = (await Author.create(testAuthor1)).toJSON();
      savedBook1 = (await Book.create({ ...testBook1, authorId: savedAuthor1._id })).toJSON();

      savedAuthor1._id = savedAuthor1._id.toString();
      delete savedAuthor1.__v;
      savedAuthor1.dateOfBirth = savedAuthor1.dateOfBirth?.toLocaleDateString();
      savedBook1._id = savedBook1._id.toString();
      savedBook1.authorId = savedBook1.authorId.toString();
      delete savedBook1.__v;

      savedAuthor2 = (await Author.create(testAuthor2)).toJSON();
      savedBook2 = (await Book.create({ ...testBook2, authorId: savedAuthor2._id })).toJSON();

      savedAuthor2._id = savedAuthor2._id.toString();
      delete savedAuthor2.__v;
      savedAuthor2.dateOfBirth = savedAuthor2.dateOfBirth?.toLocaleDateString();
      savedBook2._id = savedBook2._id.toString();
      savedBook2.authorId = savedBook2.authorId.toString();
      delete savedBook2.__v;          
    });


    const user0 = {
      email: 'user567@mail.com',
      password: '123password'
    };
    const user1 = {
      email: 'user890@mail.com',
      password: '456password'
    }
    let token0;
    let adminToken;
    beforeEach(async () => {
      await request(server).post("/login/signup").send(user0);
      const res0 = await request(server).post("/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/login/signup").send(user1);
      await User.updateOne({ email: user1.email }, { $push: { roles: 'admin' } });
      const res1 = await request(server).post("/login").send(user1);
      adminToken = res1.body.token;
    });

    describe("GET /", () => {

      it("should return all books to normal user", async () => {
        const res = await request(server)
          .get("/books")
          .set('Authorization', 'Bearer ' + token0)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([{ ...savedBook1, author: { ...savedAuthor1 } }, { ...savedBook2, author: { ...savedAuthor2 } }]);
      });

      it("should return all books to admin user", async () => {
        const res = await request(server)
          .get("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([{ ...savedBook1, author: { ...savedAuthor1 } }, { ...savedBook2, author: { ...savedAuthor2 } }]);
      });

      it("should return matched book on title search to admin user", async () => {
        const res = await request(server)
          .get("/books?search=sherlock")
          .set('Authorization', 'Bearer ' + adminToken)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([{ ...savedBook2, author: { ...savedAuthor2 } }]);
      });

      it("should return matched book on genre search to admin user", async () => {
        const res = await request(server)
          .get("/books?search=fantasy")
          .set('Authorization', 'Bearer ' + adminToken)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([{ ...savedBook1, author: { ...savedAuthor1 } }]);
      });

      it("should return matched book on author name search to admin user", async () => {
        const res = await request(server)
          .get("/books?search=arthur")
          .set('Authorization', 'Bearer ' + adminToken)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([{ ...savedBook2, author: { ...savedAuthor2 } }]);
      });

      it("should return matched book on book summary search to admin user", async () => {
        const res = await request(server)
          .get("/books?search=prequel")
          .set('Authorization', 'Bearer ' + adminToken)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([{ ...savedBook1, author: { ...savedAuthor1 } }]);
      });

      it("should return array of 1 to normal user with perPage of 1", async () => {
        const res = await request(server)
          .get("/books?perPage=1")
          .set('Authorization', 'Bearer ' + token0)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([{ ...savedBook1, author: { ...savedAuthor1 } }]);
      });

      it("should return array of 1 to normal user with perPage of 1 and page of 1", async () => {
        const res = await request(server)
          .get("/books?perPage=1&page=1")
          .set('Authorization', 'Bearer ' + token0)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([{ ...savedBook2, author: { ...savedAuthor2 } }]);
      });

      it("should return empty array to normal user with perPage of 1 and page of 2", async () => {
        const res = await request(server)
          .get("/books?perPage=1&page=2")
          .set('Authorization', 'Bearer ' + token0)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([]);
      });

    });

    describe('GET /:id', () => {
      it("should return book to normal user", async () => {
        const res = await request(server)
          .get("/books/" + savedBook1._id)
          .set('Authorization', 'Bearer ' + token0)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({ ...savedBook1, author: { ...savedAuthor1 } });
      });

      it("should return book to admin user", async () => {
        const res = await request(server)
          .get("/books/" + savedBook1._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({ ...savedBook1, author: { ...savedAuthor1 } });
      });

      it("should return 400 with a incorrect book id", async () => {
        const res = await request(server)
          .get("/books/123")
          .set('Authorization', 'Bearer ' + token0)
          .send();

        expect(res.statusCode).toEqual(400);
      });
    });

    describe('PUT /:id', () => {

      it("should allow update of book to admin user", async () => {
        const res = await request(server)
          .put("/books/" + savedBook1._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...savedBook1, publishedYear: 1901 });

        expect(res.statusCode).toEqual(200);

        const updatedRes = await request(server)
          .get("/books/" + savedBook1._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(updatedRes.body).toMatchObject({ ...savedBook1, publishedYear: 1901, author: { ...savedAuthor1 } });

        const res2 = await request(server)
          .put("/books/" + savedBook1._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...savedBook1 });

        expect(res2.statusCode).toEqual(200);

        const updatedRes2 = await request(server)
          .get("/books/" + savedBook1._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(updatedRes2.body).toMatchObject({ ...savedBook1, author: { ...savedAuthor1 } });
      });

      it("should not allow update of book to normal user", async () => {
        const res = await request(server)
          .put("/books/" + savedBook1._id)
          .set('Authorization', 'Bearer ' + token0)
          .send({ ...savedBook1, publishedYear: 1901 });

        expect(res.statusCode).toEqual(403);
      });

      it("should return 400 with a incorrect book id", async () => {
        const res = await request(server)
          .put("/books/123")
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...savedBook1, publishedYear: 1901 });

        expect(res.statusCode).toEqual(400);
      });

      it("should return 400 with empty json", async () => {
        const res = await request(server)
          .put("/books/" + savedBook1._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send({});

        expect(res.statusCode).toEqual(400);
      });

      it("should return 400 if author sent in request", async () => {
        const res = await request(server)
          .put("/books/" + savedBook1._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...savedBook1, publishedYear: 1901, author: { ...savedAuthor1 } });

        expect(res.statusCode).toEqual(400);
      });

      it("should return 500 with a bad year", async () => {
        const res = await request(server)
          .put("/books/" + savedBook1._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...savedBook1, publishedYear: "a19ab" });

        expect(res.statusCode).toEqual(500);
      });

    });

    describe('POST /', () => {

      const newBook = {
        "title": "Harry Potter and the Chamber of Secrets",
        "genre": "Fantasy",
        "isbn": "333",
        "summary": "wizard, hogwarts, young adult",
        "publishedYear": 2005
      };

      const newBook2 = {
        "title": "Harry Potter and the Sorcerer's Stone",
        "genre": "Fantasy",
        "isbn": "989",
        "summary": "wizard, hogwarts, young adult",
        "publishedYear": 2008
      }

      const newAuthor = { "name": "JK Rowling", gender: "F", dateOfBirth: "7/1/1965", blurb: "English writer of children and young adult fiction" };

      let newAuthorId;

      it("should allow adding of book with author to admin user", async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...newBook, author: { ...newAuthor } });

        expect(res.statusCode).toEqual(200);

        let newBookId = res.body._id;
        newAuthorId = res.body.authorId;

        const res2 = await request(server)
          .get("/books/" + newBookId)
          .set('Authorization', 'Bearer ' + adminToken)
          .send();

        expect(res2.statusCode).toEqual(200);
        expect(res2.body).toMatchObject({ ...newBook, author: { ...newAuthor } });
      });

      it("should allow adding of book with authorId to admin user", async () => {
        
        const bookWithAuthorId = { ...newBook2, authorId: savedAuthor1._id.toString() };

        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send(bookWithAuthorId);

        expect(res.statusCode).toEqual(200);
        let newBookId = res.body._id;

        const res2 = await request(server)
        .get("/books/" + newBookId)
        .set('Authorization', 'Bearer ' + adminToken)
        .send();

      expect(res2.statusCode).toEqual(200);
      expect(res2.body).toMatchObject({ ...newBook2, author: { ...savedAuthor1 } });
      });


      it("should not allow adding of book to normal user", async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + token0)
          .send({ ...newBook, author: { ...newAuthor } });

        expect(res.statusCode).toEqual(403);
      });

      it("should return 409 with a duplicate book isbn", async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...savedBook1, author: { ...newAuthor } });

        expect(res.statusCode).toEqual(409);
      });

      it("should return 400 with empty json", async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send({});

        expect(res.statusCode).toEqual(400);
      });

      it("should return 400 if book title not sent in request", async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...newBook, isbn: 2525, title: null, author: { ...newAuthor } });

        expect(res.statusCode).toEqual(400);
      });

      it("should return 400 if book isbn not sent in request", async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...newBook, isbn: null, author: { ...newAuthor } });

        expect(res.statusCode).toEqual(400);
      });

      it("should return 400 if book publishedYear not sent in request", async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...newBook, isbn: 2525, publishedYear: null, author: { ...newAuthor } });

        expect(res.statusCode).toEqual(400);
      });

      it("should return 400 if book author and authorId not sent in request", async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...newBook, isbn: 2525 });

        expect(res.statusCode).toEqual(400);
      });

      it("should return 400 if book author name and authorId not sent in request", async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...newBook, isbn: 2525, author: { ...newAuthor, name: null } });

        expect(res.statusCode).toEqual(400);
      });


      it("should return 400 if book authorId not found ", async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...newBook, isbn: 2525, authorId: '6484fe04b7bff38582c53747' });

        expect(res.statusCode).toEqual(400);
      });

      it("should return 500 with a bad year", async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...newBook, isbn: 1212, publishedYear: 'aaa', author: { ...newAuthor } });

        expect(res.statusCode).toEqual(500);
      });

    });

  });

})