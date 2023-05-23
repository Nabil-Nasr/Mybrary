import fs from 'fs';
import multer from 'multer';
import ImageKit from 'imagekit';


// we shouldn't change this path because it's the only writable path on cyclic.sh
const tempUploadPath = "/tmp";


// this saving the app from crashing because out of memory when using memory storage
const storage = multer.diskStorage({
  destination: tempUploadPath,
  filename: (req, file, callback) => {
    const fileNameSuffix = `${(Math.round(Math.random() * 1e9) + "").slice(0, 7)}${Date.now()}`;
    file.originalname = `${file.originalname}${fileNameSuffix}`;
    callback(null, file.originalname);
  }
});

const upload = multer({ storage })

export const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export const uploadImageToExpress = bodyPath=>(req,res,next) => upload.array(bodyPath)(req,res,err=>next())


// needs req.coverImageFileId when uploading in PUT request
export const uploadImageToImagKit = async(req)=> {
  let newImageResponse;
  try {
    newImageResponse = await imageKit.upload({
    file: fs.readFileSync(req.files[0].path),
    // add supporting of arabic letters
    fileName: Buffer.from(req.files[0].originalname, 'latin1').toString('utf-8').slice(0, -(7 + `${Date.now()}`.length)),
    folder: process.env.IMAGEKIT_UPLOAD_FOLDER,
    useUniqueFileName: true
    });

    // when PUT request
    if (req.oldCoverImageFileId) {
      await imageKit.deleteFile(req.oldCoverImageFileId);
    }
  }catch (err) {
    if (!`${err.message}`.match(/The requested file does not exist/i)) {
      // not if the image accidentally deleted from imagekit
      throw new Error("An error occurred during image upload last step. Please try again.");
    }
  }
  req.body.coverImageName = newImageResponse.name;
  req.body.coverImageFileId = newImageResponse.fileId;
  req.body.coverImageURL = newImageResponse.url;
}

export const removeUploadedFiles = req =>
  req.files?.forEach(file => {
    fs.unlink(file.path, err => {
      console.log(file.originalname, err ? err : " deleted");
    });
  });
