import React, { Component } from "react";

import firebase, { auth, provider } from "./components/Firebase/firebase";
import "./App.css";

let blog_api_url,
  posts_list,
  posts_container,
  loadJsonFromFirebase,
  post_full,
  getQueryParam,
  currentUID,
  messageForm;

class App extends Component {
  componentDidMount() {
    console.log(firebase);
    console.log(auth);
    console.log(provider);
    // initiate variables for API & dom endpoints.
    blog_api_url =
      "https://us-central1-my-serverless-blog.cloudfunctions.net/posts/";
    posts_list = document.getElementById("articles-list");
    posts_container = posts_list.querySelector(".articles-container");
    post_full = document.getElementById("article-whole");
    messageForm = document.getElementById("message-form");

    // fetch data
    loadJsonFromFirebase = function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", function() {
        callback(JSON.parse(this.response));
      });
      xhr.open("GET", url);
      xhr.send();
    };

    getQueryParam = function(param) {
      let params = window.location.search.substr(1);
      params = params.split("&");
      let paramList = {};
      for (let i = 0; i < params.length; i++) {
        let tmp = params[i].split("=");
        paramList[tmp[0]] = decodeURI(tmp[1]);
      }
      return paramList[param];
    };

    loadJsonFromFirebase(blog_api_url, function(data) {
      let list = document.createElement("div");
      Object.keys(data).forEach(function(key) {
        let ts = new Date(data[key].created);
        list.innerHTML += `<article class="article-block">
        <h2>${data[key].title}</h2>
        <time>${ts.toDateString()}</time>
        <div class="excerpt">
          <p>${data[key].content.substr(0, 150)}...</p>
        </div>
        <a href="#${key}" data-post="${key}">Read Post</a>
      </article>`;
      });
      posts_container.insertBefore(list, posts_container.firstChild);
      console.log({ posts_container });
    });

    posts_list.addEventListener("click", this.showPostClick);

    var onLogInOutChange = function(user) {
      // Ignore token refresh events
      if (user && currentUID === user.uid) {
        return;
      }

      // If logged in, show the new post button
      if (user) {
        currentUID = user.uid;
        document.getElementById("sign-in-button").style.display = "none";
        document.getElementById("new-post-button").style.display = "block";
      } else {
        currentUID = null;
        document.getElementById("sign-in-button").style.display = "block";
        document.getElementById("new-post-button").style.display = "none";
      }
    };

    console.log({ firebase });

    document
      .getElementById("sign-in-button")
      .addEventListener("click", function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider);
        firebase.auth().onAuthStateChanged(onLogInOutChange);
      });

    // show the new post form
    document
      .getElementById("new-post-button")
      .addEventListener("click", function() {
        document.getElementById("new-post").style.display = "";
      });

    messageForm.onsubmit = function(e) {
      e.preventDefault();

      let postTitle = document.getElementById("new-post-title");
      let postContent = document.getElementById("new-post-content");
      let title = postTitle.value;
      let content = postContent.value;

      if (content) {
        // if the user is logged in, continue
        firebase
          .auth()
          .currentUser.getIdToken(/* forceRefresh */ true)
          .then(function(idToken) {
            var xhr = new XMLHttpRequest();
            xhr.addEventListener("load", function() {
              // on success, display post @ top of the list and hide the form
              postTitle.value = "";
              postContent.value = "";
              document.getElementById("new-post").style.display = "none";

              let postDetails = JSON.parse(this.response);
              let div = document.createElement("div");
              let ts = postDetails.created;
              console.log(ts);
              let currentDate = new Date(ts);
              div.innerHTML += `<article class="article-block">
                   <h2>${postDetails.title}</h2>
                   ${currentDate}
                   <div class="excerpt">
                     <p>${postDetails.content.substr(0, 150)}...</p>
                   </div>
                   <a>Read Post</a>
                 </article>`;
              posts_container.insertBefore(div, posts_container.firstChild);
            });

            xhr.open("POST", blog_api_url);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(
              JSON.stringify({ title: title, content: content, token: idToken })
            );
          })
          .catch(function(error) {
            // otherwise, TODO: handle error, user isn't authenticated yet
          });
      } else {
        // TODO: display box around the missing content field
      }
    };
  }

  // hide the individual post and show the list of posts
  showListClick = e => {
    // hide the single post
    post_full.classList.add("start-hidden");
    // show the full list
    posts_container.classList.remove("start-hidden");
  };

  // handle selecting the links in the list
  showPostClick = e => {
    let post_id = e.target.dataset.post;

    if (post_id) {
      // load the post from ajax call
      loadJsonFromFirebase(blog_api_url + post_id, function(data) {
        let ts = new Date(data.created);
        let div = document.createElement("div");
        div.innerHTML = `
        <h1>${data.title}</h1>
        <time>${ts.toDateString()}</time>
        <div class="article-body">
            <p>${data.content}</p>
        </div>
      `;
        post_full.replaceChild(div, post_full.firstChild);

        // hide the full list
        posts_container.classList.add("start-hidden");
        // show the single post
        post_full.classList.remove("start-hidden");
      });
    }
  };

  // Saves message on form submit.

  render() {
    //document.getElementById('post-view-all').addEventListener('click', showListClick);

    return (
      <div className="App">
        <header className="site-header">
          <div className="site-title">A Serverless Blog</div>
          <div className="site-subtitle">
            All the code that powers this blog is right here.
          </div>
        </header>

        <a id="sign-in-button" class="button sign-in-button">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
          </svg>
          Sign In
        </a>
        <a id="new-post-button" class="button sign-in-button start-hidden">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
          </svg>
          New Post
        </a>

        <section id="new-post" class="article-form" style={{ display: "none" }}>
          <h2>New Post</h2>
          <form id="message-form" action="#">
            <h4>
              <label for="new-post-title">Title</label>
            </h4>
            <input type="text" id="new-post-title" />
            <h4>
              <label for="new-post-content">Content</label>
            </h4>
            <textarea rows="3" id="new-post-content" />
            <button type="submit">Add post</button>
          </form>
        </section>

        <main className="site-wrap">
          <div id="articles-list">
            <div className="articles-container">
              <p>hey!</p>
            </div>
          </div>

          <article id="article-whole" class="article-whole start-hidden">
            <div />
          </article>
        </main>
      </div>
    );
  }
}

export default App;
