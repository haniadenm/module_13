const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint
router.get("/", async (req, res) => {
  try {
    // Find all categories including associated products
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

// GET /api/categories/1
router.get("/:id", async (req, res) => {
  try {
    // Find one category by its `id` value, including associated products through ProductTag
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!categoryData) {
      res.status(404).json({ message: "No category found with that id!" });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    // Catch any errors
    console.error(err);
    res.status(500).json({ error: "Failed to fetch category." });
  }
});

// POST /api/categories
router.post("/", async (req, res) => {
  try {
    // Create a new category
    const category = await Category.create(req.body);
    res.status(201).json(category);
    // Catch any errors
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create a new category." });
  }
});

// PUT /api/categories/1
router.put("/:id", async (req, res) => {
  try {
    // Update a category by its id
    const [rowsUpdated] = await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (rowsUpdated === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Fetch the updated category
    const updatedCategory = await Category.findByPk(req.params.id);

    // Return the updated category data
    res.status(200).json(updatedCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update category." });
  }
});

// DELETE /api/categories/1
router.delete("/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if the category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Delete the category, and Sequelize will set category_id to NULL for associated products
    await category.destroy();

    res.status(200).json({ message: "Category deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete category." });
  }
});

module.exports = router;
