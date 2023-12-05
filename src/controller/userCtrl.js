const Users = require("../model/userModel");

const userCtrl = {
  getAll: async (req, res) => {
    try {
      let users = await Users.find();

      users = users.map((user) => {
        const { password, role, ...otherDetails } = user._doc;
        return otherDetails;
      });

      res.status(200).json({ message: "All users", users });
    } catch (error) {
      res.status(503).json(error.message);
    }
  },
  getOne: async (req, res) => {
    const { userId } = req.params;
    try {
      let users = await Users.findById(userId);

      if (!users) {
        return res.status(404).json("Not found!");
      }

      const { password, ...otherDetails } = users._doc;

      res.status(200).json({ message: "User info", user: otherDetails });
    } catch (error) {
      res.status(503).json({ message: error.message });
    }
  },
  deleteUser: async (req, res) => {
    const { userId } = req.params;
    try {
      if (userId === req.user._id || req.userIsAdmin) {
        const deletedUser = await Users.findByIdAndDelete(userId);

        if (deletedUser) {
          // delete image
          res
            .status(200)
            .json({ message: "Succesfully deleted", user: deletedUser });
        } else {
          res.status(404).json({ message: "Not found" });
        }
      }
      return res
        .status(405)
        .json({ message: "Acces Denied!. Only you can delete your account" });
    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { password } = req.body;
      const { userId } = req.params;

      if (userId == req.user._id || req.userIsAdmin) {
        if (password && password !== "") {
          const hashdedPassword = await bcrypt.hash(password, 10);

          req.body.password = hashdedPassword;
        } else {
          delete req.body.password;
        }

        if (req.files) {
          const { image } = req.files;

          const format = image.mimetype.split("/")[1];

          if (format !== "png" && format !== "jpg" && format !== "jpeg") {
            return res.status(403).send({ message: "Format is incorrect" });
          }

          const nameImg = `${v4()}.${format}`;

          image.mv(path.join(uploadsDir, nameImg), (err) => {
            if (err) {
              res.status(503).send(err.message);
            }
          });

          req.body.avatar = nameImg;
        }

        const user = await Users.findByIdAndUpdate(userId, req.body, {
          new: true,
        });

        return res.status(200).send({ message: "Updated succesfully", user });
      }
    } catch (error) {
      res.status(503).send(error.message);
    }
  },
};

module.exports = userCtrl;
