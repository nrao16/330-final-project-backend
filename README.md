# 330-final-project-backend
Final project for 330 course using nodejs/express/mongodb

## Scenario

## Requirements


## Technical Components

#### Initial Setup
1. Install recent version of [Node.js](https://nodejs.org/en/download/).
2. Set up git and github set up on computer. 
3. Clone this repository locally. 
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
        - Create your list of favorite books: `POST /favorites` - open to all users
            - Takes an array of book _id values (duplicates are ignored). This list is associated with the user id from the jwt token and stored in the favorites collection.
        - Get a specific list of favorite books: `GET /favorites/:id` - open to all users
            - returns book and author details of all books associated with favorites _id.
            - If the user is a normal user return a 404 if it is not their own favorites _id. An admin user should be able to see any list of favorites.
        - Update your list of favorite books: `PUT /favorites/:id` - open to all users
            - This list of book ids will replace existing list associated with favorites _id. 
            - Return a 404 if this is not own favorites _id. An admin user should be able to update any list.
        - Delete your list of favorite books: `DELETE /favorites/:id` - open to all users
            - Return a 404 if this is not own favorites _id. An admin user should be able to delete any list.
        - Get all favorite lists: `GET /favorites` 
            - return all favorite lists created by the user making the request if not an admin user. If they are an admin user it should return all favorite lists in the DB.
    - books (requires authentication)
        - Create: `POST /books` - restricted to users with the "admin" role
        - Update a book: `PUT /books/:id` - restricted to users with the "admin" role
        - Get all books: `GET /books` - open to all users
            - Get all book details along with author - optionally by authorId or partial match on title.
    - authors (requires authentication)
        - Update an author: `PUT /authors/:id` - restricted to users with the "admin" role
        - Get all authors: `GET /authors` - open to all users
            - Get all author details - optionally by full or partial match on name.

4. Models
    - 
5. DAOs



### Tasks Timeline
