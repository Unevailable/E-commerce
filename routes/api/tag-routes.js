const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    // find all tags
    const tagsData = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }],
    });
    res.json(tagsData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    // find a single tag by its `id`
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag }],
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }

    res.json(tagData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    // create a new tag
    const newTag = await Tag.create(req.body);
    res.status(200).json(newTag);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});


router.put('/:id', async (req, res) => {
  try {
    // update a tag's name by its `id` value
    const answer = await Tag.update(req.body, {
      where: { id: req.params.id },
    
    });

    console.log('answer:', answer);

    if (answer) {
      res.status(200).json({ message: 'Tag edited successfully' });
    } else {
      res.status(404).json({ message: 'No tag found with this id' });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});


router.delete('/:id', async (req, res) => {
  try {
    // delete one tag by its `id` value
    const deletedTag = await Tag.destroy({
      where: { id: req.params.id },
    });

    if (deletedTag > 0) {
      res.status(200).json({ message: 'Tag deleted successfully' });
    } else {
      res.status(404).json({ message: 'No tag found with this id' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
