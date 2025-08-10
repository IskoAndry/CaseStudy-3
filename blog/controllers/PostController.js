import PostModel from '../models/Post.js';
import mongoose from 'mongoose';

export const getLastTags = async (req, res) =>{
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts.map(obj => obj.tags).flat().slice(0, 5);

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getAll = async (req, res) =>{
  try {
    const posts = await PostModel.find().populate('user').exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный формат ID статьи'
      });
    }

    
    const updatedPost = await PostModel.findOneAndUpdate(
      { _id: postId },  
      { $inc: { viewsCount: 1 } },
      { 
        new: true,          
        runValidators: true
      }
    ).populate('user');  

  
    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: 'Статья не найдена'
      });
    }

  
    const postData = updatedPost.toObject();
    delete postData.__v;
    delete postData.updatedAt;

   
    return res.json({
      success: true,
      data: postData
    });
    
  } catch (err) {
    console.error('Ошибка при получении статьи:', err);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении статьи'
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный ID статьи'
      });
    }

    
    const deletedPost = await PostModel.findOneAndDelete({
      id: postId,
          });

    
    if (!deletedPost) {
      
      const postExists = await PostModel.exists({ id: postId });
      
      return res.status(404).json({
        success: false,
        message: postExists ? 'Нет прав на удаление' : 'Статья не найдена'
      });
    }

    
    return res.json({
      success: true,
      message: 'Статья успешно удалена',
      deletedPostId: deletedPost.id
    });

  } catch (err) {
    console.error('Ошибка при удалении статьи:', err);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении статьи',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};
  
export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl || '',
      tags: req.body.tags.split(','),
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};


export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный ID статьи'
      });
    }
    
    const updateData = {
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags],
      updatedAt: new Date()
    };

    
    const result = await PostModel.updateOne(
      {
        id: postId,
      },
      updateData
    );

    
    if (result.matchedCount === 0) {
      const postExists = await PostModel.exists({ id: postId });
      
      return res.status(postExists ? 403 : 404).json({
        success: false,
        message: postExists ? 'Нет прав на обновление' : 'Статья не найдена'
      });
    }

    
    return res.json({
      success: true,
      message: 'Статья успешно обновлена',
      updatedPostId: postId
    });

  } catch (err) {
    console.error('Ошибка при обновлении статьи:', err);
    return res.status(500).json({
      success: false,
      message: 'Не удалось обновить статью',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};

export const getBySubscriptions = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      })
    }

    const posts = await PostModel.find({
      user: { $in: user.subscriptions }
    })
      .populate('user')
      .exec()

    res.json(posts)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Не удалось получить сообщения',
    })
  }
}