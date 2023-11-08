"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useRouter } from "next/navigation";

import { BsUpload } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";
import { HiOutlineVideoCamera, HiXMark } from "react-icons/hi2";
import { IoImageOutline } from "react-icons/io5";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";

import { useTheme } from "@/context/ThemeContext";
import { app } from "@/libs/firebase";

const WritePage = () => {
  const { theme } = useTheme();
  const { status } = useSession();
  const router = useRouter();

  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [file, setFile] = useState<File | null | any>(null);
  const [media, setMedia] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [catSlug, setCatSlug] = useState<string>("");

  useEffect(() => {
    const storage = getStorage(app);
    const upload = () => {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, name);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {},
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setMedia(downloadURL);
          });
        }
      );
    };

    file && upload();
  }, [file]);

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3000/api/posts", {
      method: "POST",
      body: JSON.stringify({
        title,
        desc: value,
        img: media,
        slug: slugify(title),
        catSlug: "travel",
      }),
    });

    if (res.ok) {
      router.push("/");
    }

    console.log(res);
  };

  if (status === "loading") {
    return <div className="">Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/");
  }

  return (
    <div className="flex flex-col mt-10">
      <input
        type="text"
        placeholder="Title"
        className="bg-transparent text-5xl xl:text-6xl outline-none font-semibold py-5 px-2"
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* TODO: Category */}

      <div className="flex gap-5 relative px-3">
        <button
          className={`w-9 h-9 rounded-full flex justify-center items-center border hover:scale-105 transition ${
            theme === "light" && "border-[#111]"
          }`}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <HiXMark size={16} /> : <AiOutlinePlus size={16} />}
        </button>

        {open && (
          <div className="flex gap-5 absolute z-20 w-full left-16">
            <input
              type="file"
              id="image"
              onChange={(e: any) => setFile(e.target.files[0])}
              className="sr-only"
            />
            <label
              htmlFor="image"
              className={`w-9 h-9 rounded-full flex justify-center items-center border hover:scale-105 transition ${
                theme === "light" && "border-[#111]"
              } cursor-pointer`}
            >
              <IoImageOutline size={16} />
            </label>

            <button
              className={`w-9 h-9 rounded-full flex justify-center items-center border hover:scale-105 transition ${
                theme === "light" && "border-[#111]"
              }`}
            >
              <BsUpload size={16} />
            </button>

            <button
              className={`w-9 h-9 rounded-full flex justify-center items-center border hover:scale-105 transition ${
                theme === "light" && "border-[#111]"
              }`}
            >
              <HiOutlineVideoCamera size={16} />
            </button>
          </div>
        )}
      </div>

      <ReactQuill
        theme="bubble"
        className={`w-full mt-7 font-[400] h-[400px] border-2 rounded-2xl xl:p-3 ${
          theme === "dark" ? "border-white/20" : "border-black/10"
        }`}
        value={value}
        onChange={setValue}
        placeholder="Tell your story . . ."
      />

      <button
        className="md:fixed relative md:top-5 md:right-6 mt-10 md:mt-auto py-2 px-4 bg-[#1a8917] text-white rounded-lg
        hover:bg-[#1a8917]/70 active:scale-105 transition"
        onClick={handleSubmit}
      >
        Publish
      </button>
    </div>
  );
};

export default WritePage;
