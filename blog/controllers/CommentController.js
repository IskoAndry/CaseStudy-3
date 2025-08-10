import CommentModel from '../models/Comment.js'
import mongoose from 'mongoose'

export const create = async (req, res) => {
  try {
    const doc = new CommentModel({
      text: req.body.text,
      post: req.body.postId,
      user: req.userId,
    })

    const comment = await doc.save()
    const populatedComment = await CommentModel.findById(comment.id)
      .populate('user')
      .exec()

    res.json(populatedComment)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to create comment',
    })
  }
}

export const getByPostId = async (req, res) => {
  try {
    const postId = req.query.postId

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        message: 'Invalid post ID format',
      })
    }

    const comments = await CommentModel.find({ post: postId })
      .populate('user')
      .exec()

    res.json(comments)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to get comments',
    })
  }
}

export const remove = async (req, res) => {
  try {
    const commentId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        message: 'Invalid comment ID format',
      })
    }

    const comment = await CommentModel.findById(commentId)

    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found',
      })
    }

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({
        message: 'No access to delete this comment',
      })
    }

    await CommentModel.findByIdAndDelete(commentId)
    res.json({
      success: true,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: 'Failed to delete comment',
    })
  }
}
