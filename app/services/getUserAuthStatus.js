const {db, adminFirestore} = require('../utilities/firebaseConfig');
const {bot} = require('../utilities/telegramConfig');

module.exports = async (userId) => {
  const userRef = db.collection('users').doc(String(userId));
  const doc = await userRef.get();

  return doc.exists;
};
