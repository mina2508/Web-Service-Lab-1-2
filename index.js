const express = require('express');
require('./helpers/dbConnection');
const bodyParser = require('body-parser');
const { errorHandler } = require('./middlewares');
const { User, Article, Comment, Author } = require('./models');
const { getHateos } = require('./helpers/constants');

const server = express();

server.use(bodyParser.json());

const userRouter = express.Router();
const articleRouter = express.Router();
const commentRouter = express.Router();
const authorRouter = express.Router();

articleRouter.get('/', async (req, res, next) => {
  try {
    const articles = await Article.find({}).populate('comments');
    res.status(200).send(articles);
  } catch (e) {
    next(e);
  }
});

articleRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const articles = await Article.findById(id).populate('comments');
    res.status(200).send(articles);
  } catch (e) {
    next(e);
  }
});

authorRouter.get('/', async (req, res, next) => {
  try {
    const { id } = req.params;
    const authors = await Article.findById(id)
      .populate('author')
      .select('author');
    res.status(200).send(authors);
  } catch (e) {
    next(e);
  }
});
///////////////////////////////////////////
authorRouter.post('/', async (req, res, next) => {
  try {
    const { name, DOB } = req.body;
    const author = await Author.create({ name, DOB });
    if (!author) throw new Error('notreal');
    res.status(200);
    res.send({ message: 'success' });
  } catch (e) {
    next(e);
  }
});

articleRouter.post('/', async (req, res, next) => {
  const { title, mybody, content, authorId } = req.body;
  console.log(req.body);
  try {
    const result = await Article.create({
      title,
      body: mybody,
      content,
      author: authorId,
    });
    if (!result) throw new Error('notcreated');
  } catch (err) {
    return next(err);
  }
  res.status(200).send({ message: 'success' });
});

articleRouter.patch('/:id', async (req, res, next) => {
  try {
    const result = Article.findByIdAndUpdate(req.params.id, {
      $set: { ...req.body },
    });
    if (!result) throw new Error('article not found');
  } catch (err) {
    return next(err);
  }
  res.status(204).end();
});

articleRouter.delete('/:id', async (req, res, next) => {
  try {
    const result = Article.findByIdAndRemove(req.params.id);
    if (!result) throw new Error('article not found');
  } catch (err) {
    return next(err);
  }
  res.status(204).end();
});

userRouter.get('/', async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (e) {
    next(e);
  }
});
userRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const users = await User.findById(id).populate('comments');
    res.status(200).send(users);
  } catch (e) {
    next(e);
  }
});

userRouter.get('/:id/articles', async (req, res, next) => {
  try {
    const { id } = req.params;
    const articles = await User.findById(id)
      .populate('articles')
      .select('articles');
    res.status(200).send(articles);
  } catch (e) {
    next(e);
  }
});
commentRouter.get('/', async (req, res, next) => {
  try {
    const { id } = req.params;
    const comments = await Article.findById(id)
      .populate('comments')
      .select('comments');
    res.status(200).send(comments);
  } catch (e) {
    next(e);
  }
});
commentRouter.post('/', async (req, res, next) => {
  const { content, user_id, date } = req.body;

  try {
    const { _id: CommentId } = Comment.create({ content, user_id, date });
    if (!CommentId) throw new Error('notcreated');
    const article = Article.findById(req.params.id);
    article.comments.push(CommentId);
    article.save();
  } catch (err) {
    return next(err);
  }
  res.status(204).end();
});
commentRouter.patch('/:comment_id', async (req, res, next) => {
  try {
    // const newComment = new Comment(content, date, user_id);
    // const result = await newComment.save();
    const result = Comment.findByIdAndUpdate(req.params.comment_id, {
      $set: {
        ...req.body,
      },
    });
    if (!result) throw new Error('comment not updated');
  } catch (err) {
    return next(err);
  }
  res.status(204).end();
});

commentRouter.delete('/:comment_id', async (req, res, next) => {
  try {
    const result = Comment.findByIdAndRemove(req.params.comment_id);
    if (!result) throw new Error('comment not deleted');
  } catch (err) {
    return next(err);
  }
  res.status(204).end();
});
userRouter.patch('/:id/suspend', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await User.findByIdAndUpdate(id, {
      $set: { isSusbended: true },
    });
    if (!result) throw new Error('Not Updated');
    res.status(200).end();
  } catch (e) {
    next(e);
  }
});
userRouter.patch('/:id/unsuspend', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await User.findByIdAndUpdate(id, {
      $set: { isSusbended: false },
    });
    if (!result) throw new Error('Not Updated');

    res.status(200).end();
  } catch (e) {
    next(e);
  }
});

server.get('/', (req, res, next) => {
  try {
    const hateos = getHateos('https://', 'localhost');
    res.status(200).send(hateos);
  } catch (e) {
    next(e);
  }
});

userRouter.post('/', async (req, res, next) => {
  try {
    await User.create({ ...req.body });
  } catch (err) {
    next(err);
  }
  res.status(200);
  res.send({ message: 'success' });
});
//GraphQL API Task 2

server.use('/articles', articleRouter);
server.use('/articles/:id/comments', commentRouter);
server.use('/users', userRouter);
server.use(['/authors', '/articles/:id/authors'], authorRouter);
server.use(errorHandler);
server.use(express.urlencoded());
server.use(express.json());
server.listen(3000, 'localhost', () => {
  console.log(`server is listening on: 3000`);
});
