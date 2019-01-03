/* import app from "firebase/app";
import "firebase/auth"; */
import firebase from "firebase";

var config = {
  apiKey: "AIzaSyCpSa6Cnf2Vp4fe8-x5_8HFy1PzdfCQ8qU",
  authDomain: "my-serverless-blog.firebaseapp.com",
  databaseURL: "https://my-serverless-blog.firebaseio.com",
  projectId: "my-serverless-blog",
  storageBucket: "my-serverless-blog.appspot.com",
  messagingSenderId: "306398256193"
};

firebase.initializeApp(config);

export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

export default firebase;
