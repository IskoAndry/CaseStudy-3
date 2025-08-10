import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import UserModal from '../models/User.js';


export const register = async (req, res) =>{
    try{
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModal({
            email: req.body.email,
            passwordHash: hash,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
        });

        const user = await doc.save();

        const token = jwt.sign({
                id: user.id,
            }, 'secret123',
            {
                expiresIn: '30d',
            },
        );

    const {passwordHash, ...userData} = user._doc;

    res.json({ ...userData, token });

    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: 'Не удалось зарегистрироваться'
        });
    }    
};

export const login = async (req, res) => {
    try {
        const user = await UserModal.findOne({ email: req.body.email});

        if(!user){
            return res.status(404).json({
                massage: 'User не найден',
            })
        }
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if(!isValidPass){
            return res.status(403).json({
                massage: 'Не верный логин или пароль',
            })
        }

         const token = jwt.sign({
        id: user.id,
    }, 'secret123',
    {
        expiresIn: '30d',
    },
);

    const {passwordHash, ...userData} = user._doc;

    res.json({ ...userData, token });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось авторизоваться'
        });        
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await UserModal.findById(req.userId);

        if(!user){
            return res.status(404).json({
            message: 'пользователь не найден',
            });
        }
            const {passwordHash, ...userData} = user._doc;

            return res.json({ ...userData });
    } catch (err){
        console.error('[getMe Error]', err);
        
        // Обработка ошибок
        const statusCode = err.name === 'CastError' ? 400 : 500;
        return res.status(statusCode).json({
            success: false,
            message: 'Ошибка при получении данных пользователя',
            ...(process.env.NODE_ENV === 'development' && {
                error: err.message,
                stack: err.stack
            })
        });
    }    
};

export const subscribe = async (req, res) => {
  try {
    const userId = req.userId
    const targetUserId = req.params.id

    if (userId === targetUserId) {
      return res.status(400).json({
        message: 'Невозможно подписаться на себя',
      })
    }

    // Добавляем подписку
    await UserModal.findByIdAndUpdate(userId, {
      $addToSet: { subscriptions: targetUserId },
    })

    // Добавляем подписчика
    await UserModal.findByIdAndUpdate(targetUserId, {
      $addToSet: { subscribers: userId },
    })

    res.json({
      success: true,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось подписаться',
    })
  }
}

export const unsubscribe = async (req, res) => {
  try {
    const userId = req.userId
    const targetUserId = req.params.id

    // Удаляем подписку
    await UserModal.findByIdAndUpdate(userId, {
      $pull: { subscriptions: targetUserId },
    })

    // Удаляем подписчика
    await UserModal.findByIdAndUpdate(targetUserId, {
      $pull: { subscribers: userId },
    })

    res.json({
      success: true,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось отписаться',
    })
  }
}