# 330-final-project-backend
Final project for 330 course using nodejs/express/mongodb

## Scenario
This is a continuation of the project theme that I submitted for my React course. 
I would like users to be able to create lists of favorite books that are associated with their account (based on email address) and perform additions/deletions/updates to their favorite lists. In the UI the book lists were from the New York Times bestseller lists and users were able to favorite them to add them to a firebase db. 
Since this is a backend project, only admins will be able to add or update the books and authors, and users will only be able to get books and authors but have full CRUD access for their own favorite lists.
## Requirements
In addition to the signup/login route, there will 3 additional routes to access the underlying mongodb collections.
 - A books route that will enable CRU operations on books along with their author information. Only users in admin role will be able to add/update books, all users will be able to get the full list of books or specific book by id. Books cannot be deleted since they may already be part of a user's favorites collection. 
 - An authors route to either update or get author details. Only users in admin role will be able to update author details. All users will be able to get all authors or specific author by id.
 - A favorites route that will enable CRUD operations on lists of book ids. Admin users will be able to perform CRUD operations on any user's favorites, other users will only be able to manipulate their own favorite lists.
 - Middleware to handle authentication, authorization and errors. JWT tokens with expiration will contain the user id. Middleware will need to decode bearer token and also check for expiry.
## Technical Components

#### Initial Setup and Dependencies
1. Install recent version of [Node.js](https://nodejs.org/en/download/).
2. Set up git and github set up on computer. 
3. Clone this repository locally. 
4. Use week 5 package.json with bcrypt, express, jsonwebtoken, mongoose dependencies
4. In terminal, from inside this project directory, run `npm install` to install the project dependencies.
5. Download and install [MongoDB](https://www.mongodb.com/try/download/community). This project uses the default MongoDB configuration.
6. Run `npm start` to start your local server. You should see a logged statement telling you `Server is listening on http://localhost:3000`.
7. Download [Postman](https://www.postman.com/).
8. Run the unit tests of this project: `npm test`.

### Project Design
1. Authentication - Use email and encrypted password for user authentication.  Use the [bcrypt](https://www.npmjs.com/package/bcrypt) library for securely storing passwords. 

2. Authorization - Use JWT tokens with expiration times, along with user/admin roles for resource authorization. Generate JWTs using the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) library. 

3. Routes 
    - login
        - Signup: `POST /login/signup`
        - Login: `POST /login`
        - Change Password `POST /login/password`
    - favorites (requires authentication)
        - Create a list of favorite books: `POST /favorites` - open to all users
            - Takes an array of book _id values (duplicates are ignored). This list is associated with the user id from the jwt token and stored in their favorites collection. In case of any invalid book ids, nothing will be created and a 400 error will be returned. 
        - Get a specific list of favorite books: `GET /favorites/:id` - open to all users
            - Returns book and author details of all books associated with favorites _id.
            - Return a 404 if favorites _id is not associated with token user id. An admin user should be able to see any list of favorites.
        - Update list of favorite books: `PUT /favorites/:id` - open to all users
            - This list of book ids will replace existing list associated with favorites _id. 
            - Return a 404 if favorites _id is not associated with token user id. An admin user should be able to update any list.
        - Delete list of favorite books: `DELETE /favorites/:id` - open to all users
            - Return a 404 if favorites _id is not associated with token user id. An admin user should be able to delete any list.
        - Get all favorite lists: `GET /favorites` 
            - return all favorite lists created by the user making the request if not an admin user. If an admin user, return all favorite lists in the DB.
    - books (requires authentication)
        - Create: `POST /books` - restricted to users in the admin role.
        - Update a book: `PUT /books/:id` - restricted to users in the admin role.  400 error with message saying 'Book Id Not Found ' if no match on id.
        - Get a book: `GET /books/:id` - open to all users
            - Get specific book for given id. 400 error with message saying 'Book Id Not Found ' if no match on id.
        - Get all books: `GET /books` - open to all users
            - Get all book details along with author details- optionally search by full or partial match on author name, or genre, or title, or summary.
    - authors (requires authentication)
        - Update an author: `PUT /authors/:id` - restricted to users with the admin role
        - Get an author: `GET /authors/:id` - open to all users
            - Get specific author for given id. 400 error with message saying 'Author Id Not Found ' if no match on id.
        - Get all authors: `GET /authors` - open to all users
            - Get all author details - optionally by full or partial match on name.

4. Models
    - user - password, email, roles
    - book - title, genre, isbn, authorId, summary, publishedYear 
    - author - name, gender, blurb
    - favorite - userId, list of book ids.
5. DAOs
    - user 
    - book
    - author
    - favorite

6. Jest tests for all routes - including tests for authentication, authorization, invalid Ids, valid CRUD operations based on route.

### Tasks Timeline
Total 3 weeks for project submission on June 18th.
    - Week 6 - 7 - Set up and install project with dependences, create basic structure of project, create user model and dao, create middleware, create login route and create jest tests for route.
        - [x] Set up Git project
        - [x] Create README
        - [ ] Create express server
        - [ ] Create package.json and install - `npm install`
        - [ ] Test initial install by running project - `npm start`
        - [ ] Create project structure with directories for daos, models, routes, middleware; create index.js
        - [ ] Create user model - email should be unique
        - [ ] user DAO
        - [ ] Create middleware with bearer token and role checking
        - [ ] Create login route
        - [ ] Create postman project and test login route with Postman
        - [ ] Create jest tests for login route - Valid signup, login, password update. Invalid signup (duplicate email), invalid login, invalid password update with 404 situations.
    - Week 7 - 8 - Create books, authors, favorites models, daos, routes, create jest tests for routes.
        - [ ] Create book model with text indexes on title, genre, summary. isbn should be unique.
        - [ ] Create book DAO
        - [ ] Create author model with text index on name
        - [ ] Create author DAO
        - [ ] Create books route and test with Postman
        - [ ] Create authors route and test with Postman
        - [ ] Create favorite model
        - [ ] Create favorite DAO
        - [ ] Create favorites route and test with Postman
        - [ ] Create jest tests for books route - Valid CRU based on roles. Unauthorized access to perform create and updates. 
        - [ ] Submit prototype/proof of concept with all routes working with basic operations.
    - Week 8 - 9 - create jest tests. Test overall project and prep for presentation.
        - [ ] Create jest tests for authors route - Valid RU based on roles. Unauthorized access to perform updates.
        - [ ] Create jest tests for favorites route - Valid CRUD based on roles. Unauthorized access to perform crud on other user's favorites except for admins. 
        - [ ] Create slide show and practice demo.
    - Week 9 - Submit and present  

    ### Self Evaluation
      - What worked
      - What didn't work
      - Lesson learnt