const btn = document.getElementById('login-btn');
const email = document.getElementById('exampleInputEmail1');
const password = document.getElementById('exampleInputPassword1');

async function request(event) {
  event.preventDefault();
  const Eemail = email.value;
  const Epassword = password.value;

  const data = { email: Eemail, password: Epassword };

  const response = await fetch(`/login`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    const result = await response.json();
    console.log(result);
    
    if (result==0) {
       document.getElementById('error').style.display='block'
    }

  } else if(result==1) {

    window.location.href = '/index_log';
    
  }
  
 
 

}

btn.addEventListener('click', request);
