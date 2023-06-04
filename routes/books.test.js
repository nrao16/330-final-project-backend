const request = require("supertest");
var jwt = require('jsonwebtoken');

const server = require("../server");
const testUtils = require('../test-utils');

const Book = require('../models/book');

describe('/books', () => { 
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);
    afterEach(testUtils.clearDB);

    describe('POST /', () => {
        const user0 = {
            email: 'user0@mail.com',
            password: '123password'
          };
          const user1 = {
            email: 'user1@mail.com',
            password: '456password'
          }
        
    })
})