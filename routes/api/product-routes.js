const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    // find all products
    const productsData = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag },
      ],
    });
    res.json(productsData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    // find a single product by its `id`
    const productData = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: ProductTag },
      ],
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }

    res.json(productData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    // create a new product
    const product = await Product.create(req.body);

    // if there are product tags, create pairings in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    // update product data
    const [rowsAffected, updatedProduct] = await Product.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    // if there are product tags, update them in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const existingProductTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      const existingTagIds = existingProductTags.map(({ tag_id }) => tag_id);

      const newProductTags = req.body.tagIds
        .filter((tag_id) => !existingTagIds.includes(tag_id))
        .map((tag_id) => ({
          product_id: req.params.id,
          tag_id,
        }));

      const productTagsToRemove = existingProductTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    if (rowsAffected > 0) {
      res.status(200).json(updatedProduct[0]);
    } else {
      res.status(404).json({ message: 'Success' });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // delete one product by its `id` value
    const deletedProduct = await Product.destroy({
      where: { id: req.params.id },
    });

    if (deletedProduct > 0) {
      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'No product found with this id' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
