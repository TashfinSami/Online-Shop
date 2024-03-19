const hamIconButton=document.getElementById('hamIcon');
const hammenu=document.getElementById('hamMenu');
const image=document.querySelector('#hamIcon img');

hamIconButton.addEventListener('click',function(){
    

  if (hamIconButton.dataset.value=='1') {
    image.style.backgroundColor = 'rgba(255, 242, 242, 0.4)';
    hamIconButton.dataset.value='2';
  }else{
    image.style.backgroundColor = 'rgba(80, 156, 255, 0.4)';
    hamIconButton.dataset.value='1';
  }
    hammenu.classList.toggle('collapsed');
    hammenu.classList.toggle('expanded');

})