

import { body } from 'express-validator';

export const loginValidator = [
    body('email', 'неверный формат почты').isEmail(),
    body('password','пароль должен быть минимум 5 символов').isLength({min: 5}),
]; 


export const postCreateValidation = [
  body('title', 'Введите заголовок статьи').isLength({ min: 3 }).isString(),
  body('text', 'Введите текст статьи').isLength({ min: 3 }).isString(),
  body('tags', 'Неверный формат тэгов').optional().isString(),
  body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
];

export const commentCreateValidation = [
  body('text', 'Enter comment text').isLength({ min: 1 }).isString(),
  body('postId', 'Invalid post ID').isMongoId(),
];