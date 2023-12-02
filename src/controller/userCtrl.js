const Users = require("../model/userModel");

const userCtrl = {
  getAll: async (req, res) => {
    try {
      let users = await Users.find();

      users = users.map((user) => {
        const { password, role, ...otherDetails } = user._doc;
        return otherDetails;
      });

      res.status(200).send({ message: "All users", users });
    } catch (error) {
      res.status(503).send(error.message);
    }
  },
  getOne: async (req, res) => {
    try {
      const { userId } = req.params;

      let users = await Users.findById(userId);

      const { password, ...otherDetails } = users._doc;

      res.status(200).send({ message: "User info", user: otherDetails });
    } catch (error) {
      res.status(503).send({ message: error.message });
    }
  },
};

module.exports = userCtrl;
