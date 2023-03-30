let fileInput = document.querySelector(`input[type="file"]`);
let submitButton = document.querySelector(`button[type="submit"]`);

// client-side image file validation beside server-side validation to save user bandwidth
submitButton.addEventListener("click", (eve) => {
  const maxSize = 1024 ** 2 * 2;
  const imageMimeTypes = ['image/jpeg', 'image/bmp', 'image/webp', 'image/png', 'image/gif'];
  if (fileInput.files.length != 0) {
    if (fileInput.files.length > 1) 
      createErrorMessage("Too many files", eve);
    else if (!imageMimeTypes.includes(fileInput.files[0].type)) 
      createErrorMessage("Wrong file type", eve);
    else if (fileInput.files[0].size > maxSize) 
      createErrorMessage(`File too large (Maximum => ${maxSize / 1024 ** 2}MB)`, eve);
    else 
      document.querySelector(`.error-message-1`).remove()
  }
});

function createErrorMessage (errorMessage, event) {
  event.preventDefault();
  let errorElement = document.querySelector(`.error-message-1`);
  if (errorElement)
      errorElement.innerText = errorMessage + " !!!";
  else {
    let div = document.createElement('div');
    div.classList.add('error-message-1');
    div.innerText = errorMessage;
    document.querySelector(`header`).after(div);
  }
}