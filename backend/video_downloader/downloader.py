import os, re
from typing import Dict, List
from pytube import YouTube
from pathlib import Path

VIDEO_PATH = Path(".").absolute() / "videos"
VIDEO_PATH.mkdir(exist_ok=True)


async def get_available_streams(url) -> Dict:
    yt = YouTube(url)
    streams: List = yt.streams.filter(file_extension="mp4")
    video_length = yt.length
    if (video_length / 60) > 10:
        return {"message": "unable to download because video is longer than 10 min"}
    response = {}
    response["meta"] = {
        "thumbnail": yt.thumbnail_url,
        "duration": f"{video_length // 60}:{video_length % 60}",
    }
    res_list = []
    for i, stream in enumerate(streams):
        res = {}
        res["key"] = str(stream.itag)
        res["type"] = stream.type
        res["resolution"] = stream.resolution
        res["is_progressive"] = stream.is_progressive
        res["size"] = stream._filesize_mb
        if stream.type == "audio":
            file_name = stream.default_filename.split(".")[0]
            file_name = f"{file_name}.mp3"
            res["file_name"] = file_name
            res["resolution"] = stream.abr
        else:
            res["file_name"] = stream.default_filename
        res_list.append(res)
    response["data"] = res_list
    return response


def sanitize_filename(filename):
    # Remove or replace non-ASCII characters
    sanitized_filename = re.sub(r"[^\x00-\x7F]+", "_", filename)
    return sanitized_filename


async def download_video(url, itag):
    yt = YouTube(url)
    stream = yt.streams.get_by_itag(itag)
    if stream:
        stream.download(VIDEO_PATH)

        file_name = VIDEO_PATH / stream.default_filename

        senitized_filename = VIDEO_PATH / sanitize_filename(stream.default_filename)
        os.rename(file_name, senitized_filename)

        if stream.type == "audio":
            old_name = senitized_filename
            title = sanitize_filename(stream.title)
            senitized_filename = VIDEO_PATH / f"{title}.mp3"
            os.rename(old_name, senitized_filename)
        return senitized_filename
    return None
