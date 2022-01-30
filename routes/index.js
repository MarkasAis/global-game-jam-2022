import express from "express";

const router = express.Router();

router.get('/play', (req, res) => {
  res.sendFile('game.html', { root: './public' });
});

router.get('/', (req, res) => {
  res.sendFile('splash.html', { root: './public' });
});

export default router;