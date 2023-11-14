const {db} = require('./app/utilities/firebaseConfig');

const customRef = db.collection('culttobacco').doc('c10');
customRef.get().then((resp) => {
  if (!resp.exists) {
    console.log('No such document!');
  } else {
    console.log('Document data:', resp.data());
  }
});
