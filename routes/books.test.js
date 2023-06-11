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

  let testBook = {
    "title": "Hobbit",
    "genre": "Fantasy",
    "isbn": "888",
    "summary": "Prequel",
    "publishedYear": 1961
  };

  let testAuthor = {
      "name": "Tolkein",
      "gender": "M",
      "dateOfBirth": "1/3/1892",
      "blurb": "University of Oxford profession father of modern fantasy lit"
  };

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
        const res = await request(server).put("/books").send(testBook);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer BAD')
          .send(testBook);
        expect(res.statusCode).toEqual(401);
      });
    });

    describe('PUT /', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).put("/books").send(testBook);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .post("/books")
          .set('Authorization', 'Bearer BAD')
          .send(testBook);
        expect(res.statusCode).toEqual(401);
      });
    });

  });

  describe('after login', () => {
    const user0 = {
        email: 'user0@mail.com',
        password: '123password'
    };
    const user1 = {
        email: 'user1@mail.com',
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
        let savedBook;

        beforeEach(async () => {   
            savedAuthor = await Author.create(testAuthor);    
            savedBook = await Book.create({...testBook, authorId: savedAuthor._id});
        });

        
        it("should return all books to normal user", async () => {
            const res = await request(server)
            .get("/books")
            .set('Authorization', 'Bearer ' + token0)
            .send();

            console.log(`-----savedBook - ${JSON.stringify(savedBook)}`)
            expect(res.statusCode).toEqual(200);
            //expect(res.body).toMatchObject([{...savedBook, author: [{...savedAuthor}] } ]);
        });
    });
});

})