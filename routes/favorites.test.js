const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

const User = require('../models/user');
const Book = require('../models/book');
const Author = require("../models/author");
const Favorite = require("../models/favorite");

describe('/favorites', () => {
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);
    afterEach(testUtils.clearDB);

    let testBook1 = {
        "title": "James Bond",
        "genre": "Spy",
        "isbn": "111",
        "summary": "High jinks",
        "publishedYear": 1970
    };

    let testAuthor1 = {
        "name": "Ian Fleming"
    };

    let testBook2 = {
        "title": "Wizarding School",
        "genre": "Fantasy",
        "isbn": "222",
        "summary": "wizard, young adult",
        "publishedYear": 2005
    };

    let testAuthor2 = {
        "name": "Jane Smith "
    }

    let testBook3 = {
        "title": "Steelheart",
        "genre": "Young Adult Fantasy",
        "isbn": "9786",
        "summary": "Dystopian superhero world",
        "publishedYear": 2013
    }

    let testAuthor3 = {
        "name": "Brandon Sanderson",
        "gender": "Male",
        //"dateOfBirth": "10/5/1975"
    }

    describe('Before login', () => {
        describe('GET /', () => {
            it('should send 401 without a token', async () => {
                const res = await request(server).get("/favorites");
                expect(res.statusCode).toEqual(401);
            });
            it('should send 401 with a bad token', async () => {
                const res = await request(server)
                    .get("/favorites")
                    .set('Authorization', 'Bearer BAD')
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });

        describe('GET /:id', () => {
            it('should send 401 without a token', async () => {
                const res = await request(server).get("/favorites/123");
                expect(res.statusCode).toEqual(401);
            });
            it('should send 401 with a bad token', async () => {
                const res = await request(server)
                    .get("/favorites/456")
                    .set('Authorization', 'Bearer BAD')
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });

        describe('POST /', () => {
            it('should send 401 without a token', async () => {
                const res = await request(server).put("/favorites").send([
                    "6485017031848f66b81efdd3",
                    "6485017031848f66b81efdd3"
                ]);
                expect(res.statusCode).toEqual(401);
            });
            it('should send 401 with a bad token', async () => {
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer BAD')
                    .send([
                        "6485017031848f66b81efdd3",
                        "6485017031848f66b81efdd3"
                    ]);
                expect(res.statusCode).toEqual(401);
            });
        });

        describe('PUT /', () => {
            it('should send 401 without a token', async () => {
                const res = await request(server).put("/favorites").send([
                    "6485017031848f66b81efdd3",
                    "6485017031848f66b81efdd3"
                ]);
                expect(res.statusCode).toEqual(401);
            });
            it('should send 401 with a bad token', async () => {
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer BAD')
                    .send([
                        "6485017031848f66b81efdd3",
                        "6485017031848f66b81efdd3"
                    ]);
                expect(res.statusCode).toEqual(401);
            });
        });

        describe('DELETE /:id', () => {
            it('should send 401 without a token', async () => {
                const res = await request(server).delete("/favorites/123");
                expect(res.statusCode).toEqual(401);
            });
            it('should send 401 with a bad token', async () => {
                const res = await request(server)
                    .delete("/favorites/456")
                    .set('Authorization', 'Bearer BAD')
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });

    });

    describe('after login', () => {

        let savedAuthor1;
        let savedBook1;
        let savedBook2;
        let savedAuthor2;
        let savedBook3;
        let savedAuthor3;

        // add an author and associate it with book
        beforeEach(async () => {

            savedAuthor1 = (await Author.create(testAuthor1)).toJSON();
            savedBook1 = (await Book.create({ ...testBook1, authorId: savedAuthor1._id })).toJSON();

            savedAuthor1._id = savedAuthor1._id.toString();
            delete savedAuthor1.__v;
            savedBook1._id = savedBook1._id.toString();
            savedBook1.authorId = savedBook1.authorId.toString();
            delete savedBook1.__v;

            savedAuthor2 = (await Author.create(testAuthor2)).toJSON();
            savedBook2 = (await Book.create({ ...testBook2, authorId: savedAuthor2._id })).toJSON();

            savedAuthor2._id = savedAuthor2._id.toString();
            delete savedAuthor2.__v;
            savedBook2._id = savedBook2._id.toString();
            savedBook2.authorId = savedBook2.authorId.toString();
            delete savedBook2.__v;

            savedAuthor3 = (await Author.create(testAuthor3)).toJSON();
            savedBook3 = (await Book.create({ ...testBook3, authorId: savedAuthor3._id })).toJSON();

            savedAuthor3._id = savedAuthor3._id.toString();
            delete savedAuthor3.__v;

            savedBook3._id = savedBook3._id.toString();
            savedBook3.authorId = savedBook3.authorId.toString();
            delete savedBook3.__v;
        });

        const user0 = {
            email: 'user2323@mail.com',
            password: '123password'
        };
        const user1 = {
            email: 'user4343@mail.com',
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
            it("should return empty array if no favorites belonging to own user", async () => {
                const newFavorites1 = [savedBook1._id, savedBook2._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send(newFavorites1);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }, { ...savedBook2, author: { ...savedAuthor2 } }] });

                const res3 = await request(server)
                    .get("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res3.statusCode).toEqual(200);
                expect(res3.body).toMatchObject([]);
            });

            it("should return all favorites to admin user even if not own favorites", async () => {
                const res = await request(server)
                    .get("/favorites")
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([]);

                const newFavorites = [savedBook3._id];
                const res1 = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send(newFavorites);

                expect(res1.statusCode).toEqual(200);
                let newFavoriteId = res1.body._id;
                let favoriteUserId = res1.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook3, author: { ...savedAuthor3 } }] });
            });

        });

        describe("GET /:id", () => {
            it("should return favorites to admin user even if not own favorites", async () => {
                const res = await request(server)
                    .get("/favorites")
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([]);

                const newFavorites = [savedBook3._id];
                const res1 = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send(newFavorites);

                expect(res1.statusCode).toEqual(200);
                let newFavoriteId = res1.body._id;
                let favoriteUserId = res1.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook3, author: { ...savedAuthor3 } }] });
            });

            it("should return 400 if incorrect favorite id", async () => {
                const res3 = await request(server)
                    .get("/favorites/123")
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res3.statusCode).toEqual(400);
            });

        });

        describe("POST /", () => {
            it("should allow adding of favorites to admin user", async () => {
                const newFavorites1 = [savedBook1._id, savedBook2._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send(newFavorites1);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }, { ...savedBook2, author: { ...savedAuthor2 } }] });
            });

            it("should allow adding of favorites to normal user", async () => {
                const newFavorites = [savedBook3._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send(newFavorites);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook3, author: { ...savedAuthor3 } }] });
            });

            it("should allow ignore duplicate book ids when creating favorites", async () => {
                const newFavorites = [savedBook3._id, savedBook3._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send(newFavorites);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook3, author: { ...savedAuthor3 } }] });
            });

            it("should return 400 with a empty array", async () => {
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send([]);

                expect(res.statusCode).toEqual(400);
            });

            it("should return 400 with a invalid book id", async () => {
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send([savedBook1._id, 123]);

                expect(res.statusCode).toEqual(400);

            });

        });

        describe("DELETE /", () => {
            it("should allow deleting of favorites to admin user", async () => {
                const newFavorites1 = [savedBook1._id, savedBook2._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send(newFavorites1);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }, { ...savedBook2, author: { ...savedAuthor2 } }] });

                const res3 = await request(server)
                    .delete("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res3.statusCode).toEqual(200);

                const res4 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res4.statusCode).toEqual(400);

            });

            it("should allow deleting of other user's favorites to admin user", async () => {
                const newFavorites1 = [savedBook1._id, savedBook2._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send(newFavorites1);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }, { ...savedBook2, author: { ...savedAuthor2 } }] });

                const res3 = await request(server)
                    .delete("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res3.statusCode).toEqual(200);

                const res4 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res4.statusCode).toEqual(400);

            });

            it("should not allow deleting of other user's favorites to normal user", async () => {
                const newFavorites1 = [savedBook1._id, savedBook2._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send(newFavorites1);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }, { ...savedBook2, author: { ...savedAuthor2 } }] });

                const res3 = await request(server)
                    .delete("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res3.statusCode).toEqual(400);

            });

            it("should allow deleting of favorites to normal user", async () => {
                const newFavorites = [savedBook3._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send(newFavorites);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook3, author: { ...savedAuthor3 } }] });

                const res3 = await request(server)
                    .delete("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res3.statusCode).toEqual(200);

                const res4 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res4.statusCode).toEqual(400);

            });

            it("should return 400 with a incorrect favorite id", async () => {
                const res1 = await request(server)
                    .delete("/favorites/123")
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send([savedBook1._id]);

                expect(res1.statusCode).toEqual(400);
            });


        });
        describe("PUT /:id", () => {
            it("should allow updating of favorites to admin user", async () => {
                const newFavorites1 = [savedBook1._id, savedBook2._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send(newFavorites1);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }, { ...savedBook2, author: { ...savedAuthor2 } }] });

                const res3 = await request(server)
                    .put("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send([savedBook1._id]);

                expect(res3.statusCode).toEqual(200);

                const res4 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res4.statusCode).toEqual(200);
                expect(res4.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }] });
            });

            it("should allow updating of other user's favorites to admin user", async () => {
                const newFavorites1 = [savedBook1._id, savedBook2._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send(newFavorites1);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }, { ...savedBook2, author: { ...savedAuthor2 } }] });

                const res3 = await request(server)
                    .put("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send([savedBook1._id]);

                expect(res3.statusCode).toEqual(200);

                const res4 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res4.statusCode).toEqual(200);
                expect(res4.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }] });
            });

            it("should not allow updating of other user's favorites to normal user", async () => {
                const newFavorites1 = [savedBook1._id, savedBook2._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send(newFavorites1);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }, { ...savedBook2, author: { ...savedAuthor2 } }] });

                const res3 = await request(server)
                    .put("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send([savedBook1._id]);

                expect(res3.statusCode).toEqual(400);    
            });

            it("should allow updating of favorites to admin user while ignoring duplicate ids", async () => {
                const newFavorites1 = [savedBook1._id, savedBook2._id, savedBook1._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send(newFavorites1);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }, { ...savedBook2, author: { ...savedAuthor2 } }] });

                const res3 = await request(server)
                    .put("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send([savedBook1._id]);

                expect(res3.statusCode).toEqual(200);

                const res4 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send();

                expect(res4.statusCode).toEqual(200);
                expect(res4.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook1, author: { ...savedAuthor1 } }] });
            });

            it("should allow updating of favorites to normal user", async () => {
                const newFavorites = [savedBook3._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send(newFavorites);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;
                let favoriteUserId = res.body.userId;

                const res2 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res2.statusCode).toEqual(200);
                expect(res2.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook3, author: { ...savedAuthor3 } }] });

                const res3 = await request(server)
                    .put("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send([savedBook2._id]);

                expect(res3.statusCode).toEqual(200);

                const res4 = await request(server)
                    .get("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + token0)
                    .send();

                expect(res4.statusCode).toEqual(200);
                expect(res4.body).toMatchObject({ _id: newFavoriteId, userId: favoriteUserId, books: [{ ...savedBook2, author: { ...savedAuthor2 } }] });

            });

            it("should return 400 with a incorrect favorite id", async () => {
                const res1 = await request(server)
                    .put("/favorites/123")
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send([savedBook1._id]);

                expect(res1.statusCode).toEqual(400);
            });

            it("should return 400 with a empty array", async () => {
                const newFavorites = [savedBook3._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send(newFavorites);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;

                const res2 = await request(server)
                    .put("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send([]);

                expect(res2.statusCode).toEqual(400);
            });

            it("should return 400 with a invalid book id", async () => {
                const newFavorites = [savedBook3._id];
                const res = await request(server)
                    .post("/favorites")
                    .set('Authorization', 'Bearer ' + token0)
                    .send(newFavorites);

                expect(res.statusCode).toEqual(200);
                let newFavoriteId = res.body._id;

                const res2 = await request(server)
                    .put("/favorites/" + newFavoriteId)
                    .set('Authorization', 'Bearer ' + adminToken)
                    .send([savedBook1._id, 555]);

                expect(res2.statusCode).toEqual(400);
            });

        });
    });
})