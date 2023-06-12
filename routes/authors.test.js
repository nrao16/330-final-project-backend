const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

const User = require('../models/user');
const Author = require('../models/author');

describe("/authors", () => {
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);
    afterEach(testUtils.clearDB);

    let testAuthorMinimal = {
        name: "Margaret Atwood"
    };

    let testAuthorComplete = {
        name: "Arthur Conan Doyle",
        gender: "Male",
        dateOfBirth: "11/15/1975",
        blurb: "Detective series set in London, UK"
    }

    describe('Before login', () => {
        describe('GET /', () => {
            it('should send 401 without a token', async () => {
                const res = await request(server).get("/authors");
                expect(res.statusCode).toEqual(401);
            });
            it('should send 401 with a bad token', async () => {
                const res = await request(server)
                    .get("/authors")
                    .set('Authorization', 'Bearer BAD')
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
        describe('GET /:id', () => {
            it('should send 401 without a token', async () => {
                const res = await request(server).get("/authors/123");
                expect(res.statusCode).toEqual(401);
            });
            it('should send 401 with a bad token', async () => {
                const res = await request(server)
                    .get("/authors/456")
                    .set('Authorization', 'Bearer BAD')
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
        describe('PUT /', () => {
            it('should send 401 without a token', async () => {
              const res = await request(server).put("/authors").send(testAuthorMinimal);
              expect(res.statusCode).toEqual(401);
            });
            it('should send 401 with a bad token', async () => {
              const res = await request(server)
                .post("/authors")
                .set('Authorization', 'Bearer BAD')
                .send(testAuthorMinimal);
              expect(res.statusCode).toEqual(401);
            });
          });
    });

    describe('after login', () => {
        let savedAuthorComplete;
        let savedAuthorMinimal;
        
        // add 2 authors
        beforeAll(async () => {      
            savedAuthorMinimal = (await Author.create(testAuthorMinimal)).toJSON();
            savedAuthorComplete = (await Author.create(testAuthorComplete)).toJSON();           

            savedAuthorComplete._id = savedAuthorComplete._id.toString();
            savedAuthorComplete.dateOfBirth = savedAuthorComplete.dateOfBirth?.toLocaleDateString();
            savedAuthorMinimal._id = savedAuthorMinimal._id.toString();
            // console.log(`savedAuthorMinimal - ${JSON.stringify(savedAuthorMinimal)}`);
            // console.log(`savedAuthorComplete - ${JSON.stringify(savedAuthorComplete)}`);            
        });

        afterAll(testUtils.clearDB);
        
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
            it("should return all authors to normal user", async () => {
                const res = await request(server)
                .get("/authors")
                .set('Authorization', 'Bearer ' + token0)
                .send();

                expect(res.statusCode).toEqual(200);                
                expect(res.body).toMatchObject([savedAuthorComplete, savedAuthorMinimal ]);
            });

            it("should return all authors to admin user", async () => {
                const res = await request(server)
                .get("/authors")
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([savedAuthorComplete, savedAuthorMinimal ]);
            });

            it("should return author to admin user with text search", async () => {
                const res = await request(server)
                .get("/authors?search='detective'")
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([savedAuthorComplete]);
            });

            it("should return author to admin user with dateOfBirth", async () => {
                const res = await request(server)
                .get("/authors?dateOfBirth='11/15/1975'")
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([savedAuthorComplete]);
            });

            it("should return author to admin user with authorName", async () => {
                const res = await request(server)
                .get("/authors?authorName=Arthur")
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([savedAuthorComplete]);
            });
            
            it("should return author to admin user with dateOfBirth and authorName", async () => {
                const res = await request(server)
                .get("/authors?dateOfBirth='11/15/1975'&authorName=Arthur")
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([savedAuthorComplete]);
            });
            
            it("should return empty array to normal user with no match on date of birth", async () => {
                const res = await request(server)
                .get("/authors?dateOfBirth='01/15/1975'")
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([]);
            });

            it("should return empty array to normal user with no match on authorName", async () => {
                const res = await request(server)
                .get("/authors?authorName=teddy")
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([]);
            });

            it("should return array of 1 to normal user with perPage of 1", async () => {
                const res = await request(server)
                .get("/authors?perPage=1")
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([testAuthorComplete]);
            });

            it("should return array of 1 to normal user with perPage of 1 and page of 1", async () => {
                const res = await request(server)
                .get("/authors?perPage=1&page=1")
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([testAuthorMinimal]);
            });

            it("should return 400 if query has both search and authorName", async () => {
                const res = await request(server)
                .get("/authors?authorName='Margaret'&search='test'")
                .set('Authorization', 'Bearer ' + token0)
                .send();

                expect(res.statusCode).toEqual(400);
            });

            it("should return 400 if query has both search and dateOfBirth", async () => {
                const res = await request(server)
                .get("/authors?dateOfBirth='01/01/1980'&search='test'")
                .set('Authorization', 'Bearer ' + token0)
                .send();

                expect(res.statusCode).toEqual(400);
            });

            it("should return 400 if query has search and authorName and dateOfBirth", async () => {
                const res = await request(server)
                .get("/authors?authorName='Margaret'&dateOfBirth='01/01/1980'&search='test'")
                .set('Authorization', 'Bearer ' + token0)
                .send();

                expect(res.statusCode).toEqual(400);
            });            

        });

        describe('GET /:id', () => {
            it("should return author to normal user", async () => {
                const res = await request(server)
                .get("/authors/" + savedAuthorComplete._id)
                .set('Authorization', 'Bearer ' + token0)
                .send();

                expect(res.statusCode).toEqual(200);
                // console.log(`savedAuthorComplete-${JSON.stringify(savedAuthorComplete)},
                // res.body- ${JSON.stringify(res.body)}`)
                expect(res.body).toMatchObject(savedAuthorComplete);
            });

            it("should return author to admin user", async () => {
                const res = await request(server)
                .get("/authors/" + savedAuthorMinimal._id)
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject(savedAuthorMinimal);
            });

            it("should return 400 with a incorrect author id", async () => {
                const res = await request(server)
                .get("/authors/123")
                .set('Authorization', 'Bearer ' + token0)
                .send();

                expect(res.statusCode).toEqual(400);
            });
        });

        describe('PUT /:id', () => {

            it("should allow update of author to admin user", async () => {
                const res = await request(server)
                .put("/authors/" + savedAuthorComplete._id)
                .set('Authorization', 'Bearer ' + adminToken)
                .send({ ...savedAuthorComplete, blurb: "Testing update" });

                expect(res.statusCode).toEqual(200);
                
                const updatedRes = await request(server)
                .get("/authors/" + savedAuthorComplete._id)
                .set('Authorization', 'Bearer ' + adminToken)
                .send();
                expect(updatedRes.body).toMatchObject({...savedAuthorComplete, blurb: 'Testing update'});

                const res2 = await request(server)
                .put("/authors/" + savedAuthorComplete._id)
                .set('Authorization', 'Bearer ' + adminToken)
                .send({ ...savedAuthorComplete });

                expect(res2.statusCode).toEqual(200);
                
                const updatedRes2 = await request(server)
                .get("/authors/" + savedAuthorComplete._id)
                .set('Authorization', 'Bearer ' + adminToken)
                .send();
                expect(updatedRes2.body).toMatchObject({...savedAuthorComplete });


            });

            it("should not allow update of author to normal user", async () => {
                const res = await request(server)
                .put("/authors/" + savedAuthorComplete._id)
                .set('Authorization', 'Bearer ' + token0)
                .send({ ...savedAuthorComplete, blurb: "Testing update" });

                expect(res.statusCode).toEqual(403);        
            });

            it("should return 400 with a incorrect author id", async () => {
                const res = await request(server)
                .put("/authors/123")
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(400);
            });

            it("should return 500 with a bad date of birth", async () => {
                const res = await request(server)
                  .put("/authors/" + savedAuthorComplete._id)
                  .set('Authorization', 'Bearer ' + adminToken)
                  .send({ ...savedAuthorComplete, dateOfBirth: "a19ab" });
                  
                  expect(res.statusCode).toEqual(500);
              });
        });

    });
});