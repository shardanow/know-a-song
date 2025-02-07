// Import Express
const express = require("express");
// Import Routes For Films
const filmRouter = require('./routes/FilmRoutes');
// Import Routes For Songs
const songRouter = require('./routes/FilmRoutes');
// Import Routes For Users
const userRouter = require('./routes/UserRoutes');
// Import Routes For User Roles
const userRoleRouter = require('./routes/UserRoleRoutes');
// Import Routes For Authorization
const userAuthorizationRouter = require('./routes/AuthorizationRoutes');
// Define PORT
const PORT = process.env.PORT || 3000;
// Init Express
const app = express();

// Routes
app.use(express.json());
app.use('/api', filmRouter);
app.use('/api', songRouter);
app.use('/api', userRouter);
app.use('/api', userRoleRouter);
app.use('/api', userAuthorizationRouter);

// начинаем прослушивание подключений на 3000 порту
app.listen(PORT, () => {console.log('Server was started on port: '+PORT);});