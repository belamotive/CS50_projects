const postsdiv = document.querySelector('#posts');
const usersdiv = document.querySelector('#users');

const followingbtn = document.querySelector('.followingposts');

if (followingbtn != null) {
  document.querySelector('.followingposts').onclick = () => {
    removeChildren(usersdiv);
    GetFollowing();
  }
}


function GetPosts(which) {
  fetch(`/posts/${which}`)
  .then(response => response.json())
  .then(posts => {
    if (posts.length === 0) {
      alert('No posts yet');
    } else if (posts.length > 10) {
      pageposts = paginator(posts, 1, 10);
      RenderPaginav(posts, pageposts.next_page, pageposts.pre_page);
      renderPosts(pageposts.data,);
    } else {
      document.querySelector('#paginav').style.display = 'none';
      renderPosts(posts);
    }
  });
}


function PostPost() {
  // Collect post content
  const post = document.querySelector('#post').value;

  // POST post
  fetch('/post', { 
    method: 'POST',
    body: JSON.stringify({
      post: post,
    }),
  })
    .then(response => response.json())
    .then(posted => {
      if (posted['error']) {
        alert(posted.error);
      } else {
        GetPosts('all');
      }
    });
  return false;
}


function renderPosts(postsjson) {
  removeChildren(postsdiv);

  console.log(postsjson);

  postsjson.forEach((postjson) => {
    const postdiv = document.createElement('div')
    const user = document.createElement('h5');
    const post = document.createElement('p');
    const date = document.createElement('p');
    const likecount = document.createElement('p');

    postdiv.id = `post_${postjson.id}`;
    user.innerHTML = postjson.user;
    post.innerHTML = postjson.post;
    date.innerHTML = postjson.update;

    user.addEventListener('click', () => {
      RenderUser(postjson.user_id);
    })

    postdiv.className = 'boxshadow';
    user.className = 'user';
    post.className = 'post';
    date.className = 'date';

    const actionrow = document.createElement('div')
    actionrow.className = 'd-flex justify-content-between';

    const like = document.createElement('button');

    fetch(`likepost/${postjson.id}`)
    .then(response => response.json())
    .then(likedposts => {
      likedpost = likedposts.likes;
      userliked = likedposts.userliked;

      likecount.innerHTML = likedpost.length;

      if (userliked == "login") {
        console.log(userliked);
        like.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-heart" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#E83151" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>';
        like.className = 'btn btn-light';

        like.addEventListener('click', () => {
          alert('To Like posts you need to Log In', 'login', 'Click here to Log In')
        })
      } else if (likedpost.length == 0) {
        like.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-heart" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#E83151" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>';
        like.className = 'btn btn-light';

        like.addEventListener('click', () => {
            LikePost(postjson.id, true);
        })
      } else if (userliked == true) {
        like.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-heart" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#E83151" fill="#E83151" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>';
        like.className = 'btn btn-light';

        like.addEventListener('click', () => {
          LikePost(postjson.id, false);
        })
      } else {
        like.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-heart" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#E83151" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>';
        like.className = 'btn btn-light';

        like.addEventListener('click', () => {
          LikePost(postjson.id, true);
        })
      }
    })

    actionrow.append(likecount, like);

    if (document.querySelector('#user')) {
      // Add Edit btn
      if (document.querySelector('#user').value == postjson.user_id) {
        const edit = document.createElement('button');
        edit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-edit" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#050505" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 7h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" /><path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" /><line x1="16" y1="5" x2="19" y2="8" /></svg>';
        edit.className = 'btn btn-light editbtn';
        edit.addEventListener('click', () => {
          editpost = document.querySelector(`post_${postjson.id}`);
  
          // Remove old p element then create new form field
          let oldpost = document.querySelector(`#post_${postjson.id} > .post`);
          console.log(oldpost);
          console.log(`.post_${postjson.id}`);
          postdiv.removeChild(oldpost);

          let textare = document.createElement('textarea');
          textare.className = 'form-control';
          textare.value = postjson.post;
          postdiv.insertBefore(textare, postdiv.children[2]);
  
          // Remove old Edit btn then create new one
          edit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-checkbox" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#050505" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="9 11 12 14 20 6" /><path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" /></svg>';
  
          edit.addEventListener('click', () => {
            console.log(postjson.id);
            console.log(textare.value);
            UpdatePost(postjson.id, textare.value);
          })
  
          postdiv.append(edit);
        })
        postdiv.append(edit);
        
      }
    }
    postdiv.append(user, post, date, actionrow);
    postsdiv.append(postdiv);
  })
}


function renderPost(post_id) {
  const newPostDiv = document.querySelector(`#post_${post_id}`);
  removeChildren(newPostDiv);

  const user = document.createElement('h5');
  const post = document.createElement('p');
  const date = document.createElement('p');
  const likecount = document.createElement('p');

  fetch(`updatepost/${post_id}`)
  .then(response => response.json())
  .then(upData => {
    upData = upData[0];
    console.log(upData);
    newPostDiv.id = `post_${upData.id}`;
    user.innerHTML = upData.user;
    post.innerHTML = upData.post;
    date.innerHTML = upData.update;

    user.addEventListener('click', () => {
      RenderUser(upData.user_id);
    })
    
    user.className = 'user';
    post.className = 'post';
    date.className = 'date';

    const actionrow = document.createElement('div')
    actionrow.className = 'd-flex justify-content-between';

    const like = document.createElement('button');

    fetch(`likepost/${upData.id}`)
    .then(response => response.json())
    .then(likedposts => {
      console.log(likedposts);
      likedpost = likedposts.likes;
      userliked = likedposts.userliked;

      likecount.innerHTML = likedpost.length;

      if (userliked == "login") {
        like.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-heart" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#E83151" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>';
        like.className = 'btn btn-light';

        like.addEventListener('click', () => {
          alert('To Like posts you need to Log In', 'login', 'Click here to Log In')
        })
      } else if (likedpost.length == 0) {
        like.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-heart" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#E83151" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>';
        like.className = 'btn btn-light';

        like.addEventListener('click', () => {
            LikePost(upData.id, true);
        })
      } else if (userliked == true) {
        like.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-heart" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#E83151" fill="#E83151" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>';
        like.className = 'btn btn-light';

        like.addEventListener('click', () => {
          LikePost(upData.id, false);
        })
      } else {
        like.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-heart" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#E83151" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428m0 0a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>';
        like.className = 'btn btn-light';

        like.addEventListener('click', () => {
          LikePost(upData.id, true);
        })
      }
    })

    actionrow.append(likecount, like);

    if (document.querySelector('#user').value == upData.user_id) {
      const edit = document.createElement('button');
      edit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-edit" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#050505" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 7h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" /><path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" /><line x1="16" y1="5" x2="19" y2="8" /></svg>';
      edit.className = 'btn btn-light editbtn';
      edit.addEventListener('click', () => {
        editpost = document.querySelector(`post_${upData.id}`);

        // Remove old p element then create new form field
        let oldpost = document.querySelector(`#post_${upData.id} > .post`);
        console.log(oldpost);
        console.log(`.post_${upData.id}`);
        postdiv.removeChild(oldpost);

        let textare = document.createElement('textarea');
        textare.className = 'form-control';
        textare.value = upData.post;
        postdiv.insertBefore(textare, postdiv.children[2]);

        // Remove old Edit btn then create new one
        edit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-checkbox" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#050505" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="9 11 12 14 20 6" /><path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" /></svg>';

        edit.addEventListener('click', () => {
          console.log(upData.id);
          console.log(textare.value);
          UpdatePost(upData.id, textare.value);
        })

        newPostDiv.append(edit);
      })
      newPostDiv.append(edit);
      
    }
    newPostDiv.append(user, post, date, actionrow);
  })
}


function UpdatePost(post_id, post) {
  fetch(`updatepost/${post_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      post: post,
    }),
  })
  .then(response => response.json())
  .then(response => {
    if (response['error']) {
      alert('You need to log in to Like posts', 'login', 'Click here to Log In');
    } else {
      renderPost(post_id);
    }
  });
  return false;
}


function LikePost(post_id, like) {
  fetch(`likepost/${post_id}`, {
    method: 'POST',
    body: JSON.stringify({
      liked: like
    }),
  })
  .then(response => response.json())
  .then(response => {
    if (response['error']) {
      alert('You need to log in to Like posts', 'login', 'Click here to Log In');
    } else {
      console.log(post_id)
      console.log(response);
      renderPost(post_id);
    }
  });
  return false;
}


async function GetLikes(post_id) {
  fetch(`likepost/${post_id}`)
  .then(response => response.json())
  .then(likedposts => {
    return likedposts;
  })
}


function GetProfile(user_id) {
  fetch(`profile/${user_id}`)
  .then(response => response.json())
  .then(profile => {
    console.log(profile);
    RenderProfile(profile);
  })
}


function RenderProfile(data) {
  const username = document.createElement('h5');
  username.className = 'profilename';
  username.innerHTML = data.user[0].username; 
  userdiv = document.querySelector('.userdiv');
  userdiv.append(username);

  const followerscount = document.createElement('p');
  followerscount.innerHTML = `Followers: ${data.followers.length}`;

  const followingcount = document.createElement('p');
  followingcount.innerHTML = `Following: ${data.following.length}`;

  const followbtn = document.createElement('button');

  userdiv.append(username, followerscount, followingcount);

  if (document.querySelector('#user')) {
    if (document.querySelector('#user').value == data.user[0].id) {
      console.log('same user');
    } else {
      if (data.isfollowing == false) {
        followbtn.innerHTML = 'Follow';
        followbtn.className = 'btn btn-primary';
    
        followbtn.addEventListener('click', () => {
          fetch(`follow/${data.user[0].id}`, {
            method: 'POST',
            body: JSON.stringify({
              following: data.user[0].id
            })
          })
          .then(response => response.json())
          .then(r => {
            console.log(r);
            RenderUser(data.user[0].id);
          })
        })
      } else {
        followbtn.innerHTML = 'Unfollow';
        followbtn.className = 'btn btn-outline-primary';
    
        followbtn.addEventListener('click', () => {
          fetch(`unfollow/${data.user[0].id}`, {
            method: 'POST',
            body: JSON.stringify({
              following: data.user[0].id
            })
          })
          .then(response => response.json())
          .then(r => {
            console.log(r);
            RenderUser(data.user[0].id);
          })
        })
      }
      userdiv.append(followbtn);
    }
  } else {
    followbtn.innerHTML = 'Follow';
    followbtn.className = 'btn btn-primary';

    followbtn.addEventListener('click', () => {
      alert('You need to Log In to follow this person', 'login', 'Click here to Log In');
    })
  }
}


function RenderUser(user_id) {

  removeChildren(usersdiv);

  let userdiv = document.createElement('div');
  userdiv.className = 'boxshadow userdiv';
  usersdiv.append(userdiv);

  GetProfile(user_id);

  GetPosts(user_id);
  
  const row = document.createElement('div');
  row.className = 'd-flex justify-content-between';
}


function GetFollowing() {
  fetch(`following`)
  .then(response => response.json())
  .then(posts => {
    if (posts.length === 0) {
      alert('You are not following anyone at the moment');
    } else if (posts.length > 10) {
      pageposts = paginator(posts, 1, 10);
      RenderPaginav(posts, pageposts.next_page, pageposts.pre_page);
      renderPosts(pageposts.data);
    } else {
      document.querySelector('#paginav').style.display = 'none';
      renderPosts(posts);
    }
  })
}


// Deletes already rendered elements children
function removeChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}


// credit to this guy on stackoverflow: https://stackoverflow.com/a/59005688
function paginator(items, page, per_page) {

  var page = page || 1,
  per_page = per_page || 10,
  offset = (page - 1) * per_page,

  paginatedItems = items.slice(offset).slice(0, per_page),
  total_pages = Math.ceil(items.length / per_page);
  return {
  page: page,
  per_page: per_page,
  pre_page: page - 1 ? page - 1 : null,
  next_page: (total_pages > page) ? page + 1 : null,
  total: items.length,
  total_pages: total_pages,
  data: paginatedItems
  };
}


function RenderPaginav(data, nextpage, previouspage) {
  document.querySelector('#paginav').style.display = 'block';
  nextpagebtn = document.querySelector('#nextpage');
  prepagebtn = document.querySelector('#previouspage')

  if (nextpage != null) {
    nextpagebtn.className = 'page-item';
    nextpagebtn.style.cursor = 'pointer';
    nextpagebtn.onclick = () => {
      data = data;
      pdata = paginator(data, nextpage, 10);
      RenderPaginav(data, pdata.next_page, pdata.pre_page);
      renderPosts(pdata.data);
    }
  } else {
    nextpagebtn.className = 'page-item disabled';
    nextpagebtn.style.cursor = 'default';
  }
  
  if (previouspage != null) {
    prepagebtn.className = 'page-item';
    prepagebtn.style.cursor = 'pointer';
    prepagebtn.onclick = () => {
      data = data;
      pdata = paginator(data, previouspage, 10);
      RenderPaginav(data, pdata.next_page, pdata.pre_page);
      renderPosts(pdata.data);
    }
  } else {
    prepagebtn.className = 'page-item disabled';
    prepagebtn.style.cursor = 'default';
  }
}


function alert(msg, link, linkname) {

  linked = `<a href="/${link}" class="alert-link">${linkname}.</a>`
  const alertdiv = document.querySelector('#alert');
  alertdiv.style.display = 'block';

  if (link == undefined) {
    linked = '';
  }

  const alertspan = document.querySelector('#msg');
  alertspan.innerHTML = `${msg}. ${linked}`; 

  document.querySelector('#closealertbtn').addEventListener('click', () => {
    alertdiv.style.display = 'none';
  })
}


window.onload = () => {
  GetPosts('all');
};