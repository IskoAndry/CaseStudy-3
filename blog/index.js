import express from 'express';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';
import {registerValidator} from './validations/auth.js';
import {loginValidator, postCreateValidation, commentCreateValidation } from './validations/validations.js';

import {checkAuth, handleValidationErrors} from './utils/index.js';
import {UserController, PostController, CommentController} from './controllers/index.js';


mongoose
.connect('mongodb+srv://admin:302075Qwe@cluster0.riey77q.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0')
.then(() =>console.log('DB OK'))
.catch(err => console.log('DB error', err));

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage});

app.use(express.json());
app.use(cors());
app.use('/uploads',express.static('uploads'));

app.post('/auth/login', loginValidator, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidator, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/uploads', checkAuth, upload.single('image'), (req, res)=>{
    res.json({
        url: '/uploads/${req.file.originalname}',
    });
});

app.get('/posts', PostController.getAll);
app.get('/tags', PostController.getLastTags);

app.get('/posts/tags', PostController.getLastTags);

app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update);
app.get('/posts/subscriptions', checkAuth, PostController.getBySubscriptions);

app.get('/comments', CommentController.getByPostId);
app.post('/comments', checkAuth, commentCreateValidation, handleValidationErrors, CommentController.create);
app.delete('/comments/:id', checkAuth, CommentController.remove);


app.post('/users/:id/subscribe', checkAuth, UserController.subscribe)
app.post('/users/:id/unsubscribe', checkAuth, UserController.unsubscribe)

app.listen(4444, (err) =>{
    if(err){
        return console.log(err);
    }
    console.log("Server OK");
});


