const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");

router.use(fileUpload());

router.post("/", (req, res) => {
    if (!req.files)
        return res.status(400).json({ msg: "No image found !" });
     console.log("image page")
    res.send(req.files.file);
})

module.exports = router;