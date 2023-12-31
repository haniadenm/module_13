const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
// GET /api/products
router.get("/", async (req, res) => {
  // find all products
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json({ error: "Couldn't grab what you wanted." });
  }
});

// get one product
// GET /api/products/1
router.get("/:id", async (req, res) => {
  // find a single product by id
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
        },
      ],
    });

    if (!productData) {
      res.status(404).json({ message: "No product found with that id!" });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    // Catch any errors
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product." });
  }
});
// be sure to include its associated Category and Tag data

// create new product
// POST /api/products
router.post("/", (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
// PUT /api/products/1
router.put("/:id", async (req, res) => {
  try {
    // Update product data
    await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // Fetch the updated product
    const updatedProduct = await Product.findByPk(req.params.id);

    // Find all associated tags from ProductTag
    const productTags = await ProductTag.findAll({
      where: { product_id: req.params.id },
    });

    // Get list of current tag_ids
    const productTagIds = productTags.map(({ tag_id }) => tag_id);

    // Create filtered list of new tag_ids
    const newProductTags = req.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });

    // Figure out which ones to remove
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    // Run both actions
    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    // Fetch the updated product data again to include the updated associations
    const finalUpdatedProduct = await Product.findByPk(req.params.id, {
      include: [{ model: Tag }],
    });

    res.json(finalUpdatedProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// DELETE /api/products/1
router.delete("/:id", async (req, res) => {
  try {
    // Find the product by its id
    const productData = await Product.findByPk(req.params.id);

    if (!productData) {
      res.status(404).json({ message: "No product found with that id!" });
      return;
    }

    // Delete product tags from ProductTag
    await ProductTag.destroy({ where: { product_id: req.params.id } });

    // Delete the product
    await Product.destroy({ where: { id: req.params.id } });

    res.status(200).json({ message: "Product deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product." });
  }
});

module.exports = router;
