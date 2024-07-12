import { useState } from "react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Component() {
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [link, setLink] = useState("");
  const [cards, setCart] = useState([]);
  const [erro, setError] = useState("");
  const [Thumbnail, setThumbnail] = useState("");
  const [duration, setDuration] = useState("");

  const submit_hander = async (e) => {
    e.preventDefault();
    try {
      let video_link = e.target.elements.name.value;
      setLink(video_link);
      const url = `${server_url}/get_formated/${video_link}`;

      const res = await fetch(url);
      const data = await res.json();
      console.log(data);
      setCart(data.data);
      setThumbnail(data.meta.thumbnail);
      setDuration(data.meta.duration);
    } catch (error) {
      setError(error);
      console.log(error, "error mil gya");
      toast("Please Paste youtube video link  !", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const download_video = async (itag, filename) => {
    try {
      const url = `${server_url}/download_video`;
      const res = await fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/octet-stream",
        },
        body: JSON.stringify({
          url: link,
          itag: itag,
        }),
      });
      const blob = await res.blob();
      toast("Please wait your video is downloading  !", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      // Use the blob to create a link and simulate a click to download

      const download_url = window.URL.createObjectURL(blob);
      const download_link = document.createElement("a");
      download_link.href = download_url;
      download_link.download = filename || "video.mp3"; // or any other extension
      document.body.appendChild(download_link);
      download_link.click();
      document.body.removeChild(download_link);
    } catch (error) {
      setError(error);
      console.log(error, "error mil gya");
      toast("Please Paste youtube video link  !", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return (
    <>
      <div className="m-5 mt-9  flex flex-col justify-center content-center ">
        <div className="flex justify-center ">
          <ToastContainer />
          <h1 className="text-center mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white font-serif ">
            Youtube Video Downloader
          </h1>
        </div>
        <div className="flex justify-center ">
          <form
            className="mt-9 w-full max-w-md space-y-4 "
            onSubmit={submit_hander}
          >
            <div className="space-y-2 flex justify-center">
              <input
                type="text"
                id="name"
                placeholder="Paste Youtube Video Link"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
            </div>

            <div className="flex justify-center ">
              <button
                type="submit"
                className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                Download
              </button>
              <button
                type="submit"
                className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                Trim And Download
              </button>
            </div>
          </form>
        </div>

        <div className="flex justify-center gap-14 mt-5">
          {/* Thumbnails */}
          {Thumbnail && (
            <div>
              <img
                src={`${Thumbnail}`}
                alt="Thumbnail"
                className="flex justify-center flex-col text-center h-44 w-55"
              />
              <p className="flex justify-center  text-center mt-2 ">
                {duration}{" "}
              </p>
            </div>
          )}

          {/* Download buttons */}
          <div className=" h-24 w-55">
            {cards?.map((d, i) => (
              <div className="flex justify-center flex-col " key={i}>
                <button
                  type="button"
                  class="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  onClick={() => download_video(d.key, d.file_name)}
                >
                  {d.resolution} - {d.type} -
                  {d.is_progressive ? "full" : "only video or audio"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
