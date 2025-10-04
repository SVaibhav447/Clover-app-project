const store = require('../store');
const Room = require('../models/Room');

module.exports = async (req, res, next) => {
  try {
    const roomObj = req.fields.room;
    if (!roomObj) return res.status(400).send('room id required');

    const roomID = roomObj._id;
    const isTyping = req.fields.isTyping;

    if (!roomID) return res.status(400).send('room id required');

    const room = await Room.findById(roomID);

    if (!room) return res.status(404).send('Room not found');

    room.people.forEach((person) => {
      if (person.toString() !== req.user.id.toString()) {
        store.io.to(person.toString()).emit('typing', {
          id: req.user.id,
          roomID,
          isTyping,
        });
      }
    });

    res.status(200).send('ok');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
