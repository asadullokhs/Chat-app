const Users = require("../model/userModel");
const path = require("path");
const fs = require("fs");
const { v4 } = require("uuid");

const uploadsDir = path.join(__dirname, "../", "public");

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
          if (deletedUser.profilePicture) {
            await fs.unlink(
              path.join(uploadsDir, deletedUser.profilePicture),
              (err) => {
                if (err) {
                  return res.status(503).send({ message: err.message });
                }
              }
            );
          }
          if (deletedUser.coverPicture) {
            await fs.unlink(
              path.join(uploadsDir, deletedUser.coverPicture),
              (err) => {
                if (err) {
                  return res.status(503).send({ message: err.message });
                }
              }
            );
          }
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
      const user = await Users.findById(userId);

      if (userId == req.user._id || req.userIsAdmin) {
        if (password && password !== "") {
          const hashdedPassword = await bcrypt.hash(password, 10);

          req.body.password = hashdedPassword;
        } else {
          delete req.body.password;
        }

        if (req.files) {
          if (req.files.profilePicture) {
            const { profilePicture } = req.files;

            const format = profilePicture.mimetype.split("/")[1];

            if (format !== "png" && format !== "jpg" && format !== "jpeg") {
              return res.status(403).json({ message: "Format is incorrect" });
            }

            const nameImg = `${v4()}.${format}`;

            profilePicture.mv(path.join(uploadsDir, nameImg), (err) => {
              if (err) {
                res.status(503).json(err.message);
              }
            });

            req.body.profilePicture = nameImg;

            if (user.profilePicture) {
              await fs.unlink(
                path.join(uploadsDir, user.profilePicture),
                (err) => {
                  if (err) {
                    return res.status(503).send({ message: err.message });
                  }
                }
              );
            }
          } else if (req.files.coverPicture) {
            const { coverPicture } = req.files;

            const format = coverPicture.mimetype.split("/")[1];

            if (format !== "png" && format !== "jpg" && format !== "jpeg") {
              return res.status(403).json({ message: "Format is incorrect" });
            }

            const nameImg = `${v4()}.${format}`;

            coverPicture.mv(path.join(uploadsDir, nameImg), (err) => {
              if (err) {
                res.status(503).json(err.message);
              }
            });

            req.body.coverPicture = nameImg;
            if (user.coverPicture) {
              await fs.unlink(
                path.join(uploadsDir, user.coverPicture),
                (err) => {
                  if (err) {
                    return res.status(503).send({ message: err.message });
                  }
                }
              );
            }
          }
        }

        const updatedUser = await Users.findByIdAndUpdate(userId, req.body, {
          new: true,
        });

        if (!updatedUser) {
          return res.status(404).json({ message: "Not found" });
        }

        return res
          .status(200)
          .json({ message: "Updated succesfully", user: updatedUser });
      }
    } catch (error) {
      res.status(503).json(error.message);
    }
  },
};

module.exports = userCtrl;
