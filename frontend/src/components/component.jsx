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
  const [spinner, setSpinner] = useState(false);
  const [btn, setbtn] = useState(true);

  const submit_hander = async (e) => {
    e.preventDefault();
    setbtn(false);
    setSpinner(true);
    try {
      let video_link = e.target.elements.name.value;
      setLink(video_link);
      const url = `${server_url}/get_formated`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: video_link }),
      });
      const data = await res.json();
      console.log(data);
      setSpinner(false);
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

            {btn && (
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
            )}
          </form>
        </div>

        {spinner && (
          <div role="status" className="flex justify-center mt-5">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        )}

        <div className="flex justify-center gap-14 mt-5">
          {/* Thumbnails */}
          {Thumbnail && (
            <div>
              <img
                src={`${Thumbnail}`}
                alt="Thumbnail"
                className="flex justify-center flex-col text-center h-44 w-55 "
              />
              <p className="flex justify-center  text-center mt-2 ">
                {duration}{" "}
              </p>
            </div>
          )}

          {/* Download buttons */}
          <div className="w-auto">
            {cards?.map((d, i) => (
              <div className="flex justify-center flex-col " key={i}>
                {d.type == "video" && (
                  <div>
                    {d.is_progressive && (
                      <div>
                        <p>
                         Video - {d.resolution} - {d.size}Mb
                        </p>
                        <button
                          type="button"
                          className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 md:shrink-0"
                          onClick={() => download_video(d.key, d.file_name)}
                        >
                          download
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {d.type == "audio" && (
                  <div>
                    <p>
                      Audio - {d.size} Mb
                    </p>

                    <button
                      type="button"
                      className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 md:shrink-0"
                      onClick={() => download_video(d.key, d.file_name)}
                    >
                      download
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
