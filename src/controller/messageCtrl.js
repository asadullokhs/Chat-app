const Message = require("../model/messageModel");

const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "../", "public");

const messageCtrl = {
  addMessage: async (req, res) => {
    const { chatId, senderId } = req.body;

    try {
      if (!chatId || !senderId) {
        return res.status(403).json({ message: "invalid credentials" });
      }

      if (req.files) {
        const { file } = req.files;

        const format = file.mimetype.split("/")[1];

        if (format !== "png" && format !== "jpg" && format !== "jpeg") {
          return res.status(403).json({ message: "Format is incorrect" });
        }

        const nameImg = `${v4()}.${format}`;

        file.mv(path.join(uploadsDir, nameImg), (err) => {
          if (err) {
            res.status(503).json(err.message);
          }
        });

        req.body.file = nameImg;
      }

      const message = new Message(req.body);

      await message.save();

      res.status(201).json({ message: "New message", message });
    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },
  getMessages: async (req, res) => {
    const { chatId } = req.params;
    try {
      const messages = await Message.find({ chatId });
      res.status(200).json({ message: "Chat's message", messages });
    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },
  deleteMessage: async (req, res) => {
    const { messageId } = req.params;
    try {
      const deletedMessage = await Message.findByIdAndDelete(messageId);
      if (deletedMessage) {
        if (deletedMessage.file !== "") {
          await fs.unlink(
            patth.join(uploadsDir, deletedMessage.file),
            (err) => {
              if (err) {
                return res.status(503).json({ message: err.message });
              }
            }
          );
        }
        return res
          .status(200)
          .json({ message: "Message deleted", deletedMessage });
      }
      res.status(200).json({ message: "Message not found", deletedMessage });
    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },
  updateMessage: async (req, res) => {
    try {
      const { messageId } = req.params;

      const message = await Message.findById(messageId);

      if (message.senderId == req.user._id) {
        if (req.files) {
          if (req.files.file) {
            const { file } = req.files;

            const format = file.mimetype.split("/")[1];

            if (format !== "png" && format !== "jpg" && format !== "jpeg") {
              return res.status(403).json({ message: "Format is incorrect" });
            }

            const nameImg = `${v4()}.${format}`;

            file.mv(path.join(uploadsDir, nameImg), (err) => {
              if (err) {
                res.status(503).json(err.message);
              }
            });

            req.body.file = nameImg;

            if (message.file) {
              await fs.unlink(path.join(uploadsDir, message.file), (err) => {
                if (err) {
                  return res.status(503).send({ message: err.message });
                }
              });
            }
          }
        }

        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          req.body,
          {
            new: true,
          }
        );

        if (!updatedMessage) {
          return res.status(404).json({ message: "Not found" });
        }

        return res
          .status(200)
          .json({ message: "Updated succesfully", updatedMessage });
      }
    } catch (error) {
      res.status(503).json(error.message);
    }
  },
};

module.exports = messageCtrl;
