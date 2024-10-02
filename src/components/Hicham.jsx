import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import styles from "../styles/Upload.module.css";

export default function Hicham() {
  const [files, setFiles] = useState([null, null, null]);
  const [progress, setProgress] = useState([0, 0, 0]);
  const [imageUrls, setImageUrls] = useState([null, null, null]);
  const [post, setPost] = useState({
    title: "",
    desc: "",
    price: "",
    sold: false,
  });

  const handleFileChange = (index) => (e) => {
    const newFiles = [...files];
    newFiles[index] = e.target.files[0];
    setFiles(newFiles);
  };

  const handleUpload = (index) => {
    if (post.title === "" || post.desc === "" || post.price === "") {
      alert("ادخل معلومات المنتج قبل رفع الصور");
    } else {
      const file = files[index];
      if (file) {
        const storageRef = ref(
          storage,
          `${post.title.replace(" ", "")}/${file.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progressValue =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress((prevProgress) => {
              const newProgress = [...prevProgress];
              newProgress[index] = progressValue;
              return newProgress;
            });
          },
          (error) => {
            console.error("Upload failed:", error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              setImageUrls((prevUrls) => {
                const newUrls = [...prevUrls];
                newUrls[index] = downloadURL;
                return newUrls;
              });
              setPost((prev) => ({ ...prev, imageLink: downloadURL }));
            });
          }
        );
      }
    }
  };

  const handlePost = async () => {
    if (!imageUrls[0] || !imageUrls[1] || !imageUrls[2]) {
      alert("ارفع الصور اولا");
    } else {
      try {
        await setDoc(doc(db, "posts", post.title.replace(/\s+/g, "")), {
          title: post.title,
          desc: post.desc,
          price: post.price,
          images: imageUrls,
          sold: false,
        });
        alert("تم نشر المنتج");
        setFiles([null, null, null]);
        setProgress([0, 0, 0]);
        setImageUrls([null, null, null]);
        setPost({
          title: "",
          desc: "",
          price: "",
        });
        window.location.reload();
      } catch (error) {
        console.error("Error writing document: ", error);
      }
    }
  };

  const allImagesUploaded = files.every((file) => file !== null);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Upload Images</h1>

      {/* Main Image Input */}
      <div className={styles.inputGroup}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange(0)}
          className={styles.fileInput}
        />
        <button onClick={() => handleUpload(0)} className={styles.uploadButton}>
          Upload Main Image
        </button>
      </div>
      {progress[0] > 0 && (
        <div className={styles.progressBarContainer}>
          <div
            style={{ width: `${progress[0]}%` }}
            className={styles.progressBar}
          >
            <span className={styles.progressText}>
              {Math.round(progress[0])}%
            </span>
          </div>
        </div>
      )}

      {/* Additional Images Inputs */}
      {[1, 2].map((index) => (
        <div key={index} className={styles.inputGroup}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange(index)}
            className={styles.fileInput}
          />
          <button
            onClick={() => handleUpload(index)}
            className={styles.uploadButton}
          >
            Upload Image {index}
          </button>
          {progress[index] > 0 && (
            <div className={styles.progressBarContainer}>
              <div
                style={{ width: `${progress[index]}%` }}
                className={styles.progressBar}
              >
                <span className={styles.progressText}>
                  {Math.round(progress[index])}%
                </span>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Display the uploaded images */}
      <div className={styles.imageContainer}>
        <h2 className={styles.subheading}>Uploaded Images:</h2>
        {imageUrls.map(
          (url, index) =>
            url && (
              <img
                key={index}
                src={url}
                alt={`Uploaded ${index}`}
                className={styles.image}
              />
            )
        )}
      </div>

      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Title"
          value={post.title}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, title: e.target.value }))
          }
          className={styles.textInput}
        />
      </div>

      <div className={styles.inputGroup}>
        <textarea
          rows="4"
          placeholder="Description"
          value={post.desc}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, desc: e.target.value }))
          }
          className={styles.textArea}
        />
      </div>

      <div className={styles.inputGroup}>
        <input
          type="number"
          placeholder="Price"
          value={post.price}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, price: e.target.value }))
          }
          className={styles.textInput}
        />
      </div>

      <button
        onClick={handlePost}
        className={styles.postButton}
        disabled={!allImagesUploaded}
      >
        Upload Post
      </button>
    </div>
  );
}
