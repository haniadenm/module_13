const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint
router.get("/", async (req, res) => {
  // find all tags
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  // find a single tag by its `id`
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    if (!tagData) {
      res.status(404).json({ message: "No tag with this id!" });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
  // be sure to include its associated Product data
});

// POST /api/tags
router.post("/", async (req, res) => {
  // create a new tag
  try {
    const tagData = await Tag.create(req.body);
    res.status(200).json(tagData);
    // Catch any errors
  } catch (err) {
    res.status(500).json({ error: "Couldn't grab what you wanted." });
  }
});

// PUT /api/tags/1
router.put("/:id", async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const tagData = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (!tagData[0]) {
      res.status(404).json({ message: "No tag with this id!" });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't grab what you wanted." });
  }
});

// DELETE /api/tags/1
router.delete("/:id", async (req, res) => {
  // delete on tag by id
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!tagData) {
      return res.status(404).json({ message: "No tag found with that id!" });
    }
    res.status(200).json({ message: "Tag deleted." });
    // Catch any errors
  } catch (err) {
    res.status(500).json({ error: "Couldn't grab what you wanted." });
  }
});

module.exports = router;
