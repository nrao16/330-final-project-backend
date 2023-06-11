const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

const User = require('../models/user');
const Author = require('../models/author');

describe("/authors", () => {
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);
    afterEach(testUtils.clearDB);

    let testAuthors = [
        {
            name: "Brandon Sanderson",
            gender: "Male",
            dateOfBirth: "11/15/1975"
        }
        // ,
        // {
        //     name: "James Baldwin",
        //     gender: "Male",
        //     dateOfBirth: "02/05/1924"
        // },
        // {
        //     name: "Margaret Atwood",
        //     gender: "Female",
        //     dateOfBirth: "07/28/1939"
        // },    
        // {
        //     name: "N. K. Jemisin",
        //     gender: "Female",
        //     dateOfBirth: "01/01/1972"
        // }
    ];

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
              const res = await request(server).put("/authors").send(testAuthors[0]);
              expect(res.statusCode).toEqual(401);
            });
            it('should send 401 with a bad token', async () => {
              const res = await request(server)
                .post("/authors")
                .set('Authorization', 'Bearer BAD')
                .send(testAuthors[0]);
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
            let savedAuthors;

            beforeEach(async () => {       
                savedAuthors = (await Author.insertMany(testAuthors)).map(i => i.toJSON());
                savedAuthors.forEach(i => {i._id = i._id.toString(); i.dateOfBirth = i.dateOfBirth.toLocaleDateString(); });
            });
            afterEach(testUtils.clearDB);
            
            it("should return all authors to normal user", async () => {
                const res = await request(server)
                .get("/authors")
                .set('Authorization', 'Bearer ' + token0)
                .send();

                expect(res.statusCode).toEqual(200);
                //expect(res.body).toMatchObject(savedAuthors);
            });

            it("should return all authors to admin user", async () => {
                const res = await request(server)
                .get("/authors")
                .set('Authorization', 'Bearer ' + adminToken)
                .send();

                expect(res.statusCode).toEqual(200);
                //expect(res.body).toMatchObject(savedAuthors);
            });
        });
    });
});