const fileInput = document.querySelector(`input[type="file"]`);
const submitButton = document.querySelector(`button[type="submit"]`);

// client-side image file validation beside server-side validation to save user bandwidth
const imageMimeTypes = ['image/jpeg', 'image/bmp', 'image/webp', 'image/png', 'image/gif'];
const maxSize = 1024 ** 2 * 2;
submitButton.addEventListener("click", (eve) => {
  if (fileInput.files.length != 0) {
    if (fileInput.files.length != 1) 
      createErrorMessage("Too Many Files ❌", eve);
    else if (!imageMimeTypes.includes(fileInput.files[0].type)) 
      createErrorMessage("Wrong File Type ❌", eve);
    else if (fileInput.files[0].size > maxSize) 
      createErrorMessage(`File Too Large (Maximum ==> ${returnFileSize(maxSize)}) ❌`, eve);
    else 
      document.querySelector(`.client-error-message`).remove()
  }
});

function createErrorMessage (errorMessage, event) {
  event.preventDefault();
  const errorElement = document.querySelector(`.client-error-message`);
  if (errorElement)
      errorElement.innerText = errorMessage.replace(/❌/i,'!!! ❌');
  else {
    const clientError = document.createElement('div');
    clientError.classList.add('client-error-message');
    clientError.innerText = errorMessage;
    const errorParent = document.querySelector(`.error-messages`)
    if(errorParent) {
      errorParent.appendChild(clientError)
    } else {
      const errorParent = document.createElement(`div`)
      errorParent.classList.add('error-messages')
      errorParent.appendChild(clientError)
      document.querySelector(`.no-js-wrapper`)?.after(errorParent);
    }
  }
  scrollTo(0,0)
}

const fileInputWrapper=document.querySelector(`.file-input-wrapper`)
fileInput.addEventListener("change",function(){
  const previousImage = document.querySelector(`.file-input-wrapper figure img`)
  URL.revokeObjectURL(previousImage?.src)
  previousImage?.parentElement.remove()
  this.removeAttribute("style")
  if (this.files.length !=0) {
    const figure = document.createElement(`figure`)

    const img = document.createElement(`img`)
    img.src = URL.createObjectURL(this.files[0])
    // the line below is not wrong with search engines because it's temporary
    let file = "Image"
    if(!imageMimeTypes.includes(this.files[0].type)){
      file="File"
    }
    img.alt = `Wrong ${file} Type ❌`
    img.addEventListener("load",()=> {
      // scroll to the Top edge of the file input wrapper
      const scroll = fileInputWrapper.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - 3
      scrollTo(0,scroll)
    })
    figure.appendChild(img)

    const figureCaption = document.createElement(`figcaption`)

    const span1 = document.createElement(`span`)
    span1.innerText = `${file} Name : ${this.files[0].name}`
    figureCaption.appendChild(span1)

    const span2 = document.createElement(`span`)
    span2.innerText = `${file} Size : ${returnFileSize(this.files[0].size)}`
    if(this.files[0].size > maxSize) {
      span2.classList.add('chosen-file-error')
      span2.innerText+=` ❌ Maximum ==> ${returnFileSize(maxSize)}`
    }
    figureCaption.appendChild(span2)

    if(this.files.length > 1) {
      const span3 = document.createElement(`span`)
      span3.classList.add('chosen-file-error')
      span3.innerText = `Too Many Files ❌`
      figureCaption.appendChild(span3)
    }

    figure.appendChild(figureCaption)
    fileInputWrapper.appendChild(figure)

    this.style.opacity=0
    this.style.position= "absolute"
    this.style.top= 0
    this.style.left= 0
    this.style.zIndex=-1
  }
})


function returnFileSize(sizeInBits) {
  if (sizeInBits < 1024) 
    return `${sizeInBits} bytes`;
  else if (sizeInBits >= 1024 && sizeInBits < 1048576) 
    return `${(sizeInBits / 1024).toFixed(1)} KB`;
  else if (sizeInBits >= 1048576 && sizeInBits < 1073741824) 
    return `${(sizeInBits / 1048576).toFixed(1)} MB`;
  else if (sizeInBits >= 1073741824)
    return `${(sizeInBits / 1073741824).toFixed(1)} GB`;
}