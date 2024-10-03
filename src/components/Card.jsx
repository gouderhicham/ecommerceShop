import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../lib/firebase";
import styles from "../styles/Card.module.css";
import { useEffect, useState } from "react";
import SlideShow from "./SlideShow";
import { deleteObject, listAll, ref } from "firebase/storage";

export default function Card() {
  const [postsArray, setPostsArray] = useState([]);
  const [shortenedUrls, setShortenedUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const queryParams = new URLSearchParams(window.location.search);
  const adminParam = queryParams.get("admin");

  const LOCAL_STORAGE_KEY = "postsData";

  const shortenUrl = async (longUrl, title) => {
    try {
      const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(
        longUrl
      )}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const shortUrl = await response.text();
      if (shortUrl) {
        setShortenedUrls((prevUrls) => ({
          ...prevUrls,
          [title]: shortUrl,
        }));
      }
    } catch (error) {
      console.error("Error shortening URL:", error);
    }
  };

  const arraysAreEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item1, index) => {
      const item2 = arr2[index];
      return JSON.stringify(item1) === JSON.stringify(item2);
    });
  };
  async function fetchPosts() {
    try {
      const postsCollectionRef = collection(db, "posts");
      const querySnapshot = await getDocs(postsCollectionRef);
      const posts = querySnapshot.docs.map((doc) => doc.data());

      const savedPosts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
      if (!arraysAreEqual(savedPosts || [], posts)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
      }

      // Set the posts array to state
      setPostsArray(posts);
    } catch (error) {
      console.error("Error fetching collection:", error);
    }
  }
  const deletePost = async (postTitle) => {
    const folderRef = ref(storage, postTitle);
    try {
      const ref = doc(db, "posts", postTitle);
      await deleteDoc(ref);
      console.log("deleted post succesfully");
    } catch (error) {
      console.error("Error deleting document:", error);
    }
    try {
      const listResult = await listAll(folderRef);
      const deletePromises = listResult.items.map(async (item) => {
        await deleteObject(item);
        console.log(`Deleted: ${item.fullPath}`);
        window.location.replace("/");
      });
      await Promise.all(deletePromises);
      console.log(`All files in /"${postTitle}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };
  const updateSold = async (title) => {
    await updateDoc(doc(db, "posts", title), {
      sold: true,
    });
    console.log("updated sold");
    window.location.replace("/");
  };
  useEffect(() => {
    const savedPosts = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedPosts) {
      setPostsArray(JSON.parse(savedPosts));
      setLoading(false);
      console.log("used local");
    }
    fetchPosts();
    console.log("hydrated shit");
  }, []);

  useEffect(() => {
    if (adminParam && adminParam.toLowerCase() === "iamadmin") {
      setAdmin(true);
    }
  }, [queryParams]);

  useEffect(() => {
    const fetchUrls = async () => {
      await Promise.all(
        postsArray.map(async (ar) => {
          if (ar.images && ar.images.length > 0) {
            await shortenUrl(ar.images[0], ar.title);
          }
        })
      );
      setLoading(false);
    };

    if (postsArray.length > 0) {
      fetchUrls();
    }
  }, [postsArray]);

  if (loading) {
    return <p>Loading...</p>;
  }
  const isArabic = (text) => {
    const arabicCharRange = /[\u0600-\u06FF]/;
    return arabicCharRange.test(text.charAt(0));
  };
  return (
    <section className={styles.cards}>
      {postsArray
        ?.sort((a, b) => a.sold - b.sold)
        .map((ar) => {
          const shortenedUrlForPost = shortenedUrls[ar.title];
          const messageParts = [
            shortenedUrlForPost,
            " <= ",
            ar.title,
            ": سلام عليكم اود الاستفسار حول هذا المنتج",
          ];
          const message = messageParts.reverse().join(" ");
          return (
            <div key={Math.random()}>
              <div key={Math.random()} className={styles.card}>
                <div className={styles["right-side"]}>
                  <SlideShow sources={ar.images} />
                </div>
                <div className={styles["left-side"]}>
                  <h3>{ar.title}</h3>
                  <div className={styles.desc}>
                    <p
                      style={{
                        textAlign: isArabic(ar.desc) ? "right" : "left",
                      }}
                    >
                      {ar.desc}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: "bold",
                        fontSize: 22,
                        color: ar.sold ? "red" : "green",
                      }}
                    >
                      {ar.sold ? "Vendu" : "Disponsible"}
                    </p>
                    <div className={styles["buying-section"]}>
                      <h2>{ar.price + " دج"}</h2>
                      <a
                        className={ar.sold ? styles.nothing : styles.pulse}
                        style={{
                          backgroundColor: ar.sold ? "green" : "#00ff00",
                          color: ar.sold ? "gray" : "white",
                          pointerEvents: ar.sold ? "none" : "all",
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://api.whatsapp.com/send/?phone=213783126027&text=${encodeURIComponent(
                          message
                        )}&type=phone_number&app_absent=0`}
                      >
                        طلب المنتج
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="edit_buttons"
                style={{
                  display: admin ? "flex" : "none",
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <button
                  style={{
                    width: "100%",
                    fontSize: 20,
                    padding: 4,
                    background: "red",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    deletePost(ar.title.replace(/\s+/g, ""));
                  }}
                >
                  supprimer
                </button>
                <button
                  style={{
                    width: "100%",
                    fontWeight: "bold",
                    fontSize: 20,
                    padding: 4,
                    background: ar.sold ? "#0000aa" : "blue",
                    color: ar.sold ? "gray" : "white",
                    border: "none",
                    pointerEvents: ar.sold ? "none" : "auto",
                    cursor: ar.sold ? "default" : "pointer",
                  }}
                  onClick={() => {
                    updateSold(ar.title.replace(/\s+/g, ""));
                  }}
                >
                  Mark Comme Vendu
                </button>
              </div>
            </div>
          );
        })}
    </section>
  );
}
