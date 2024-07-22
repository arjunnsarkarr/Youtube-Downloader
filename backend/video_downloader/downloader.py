import os
from typing import Dict, List
from pytube import YouTube
from pathlib import Path
from pytube.innertube import _default_clients

_default_clients["ANDROID"]["context"]["client"]["clientVersion"] = "19.08.35"
_default_clients["IOS"]["context"]["client"]["clientVersion"] = "19.08.35"
_default_clients["ANDROID_EMBED"]["context"]["client"]["clientVersion"] = "19.08.35"
_default_clients["IOS_EMBED"]["context"]["client"]["clientVersion"] = "19.08.35"
_default_clients["IOS_MUSIC"]["context"]["client"]["clientVersion"] = "6.41"
_default_clients["ANDROID_MUSIC"] = _default_clients["ANDROID_CREATOR"]

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
        else:
            res["file_name"] = stream.default_filename
        res_list.append(res)
    response["data"] = res_list
    return response


async def download_video(url, itag):
    yt = YouTube(url)
    stream = yt.streams.get_by_itag(itag)
    if stream:
        stream.download(VIDEO_PATH)

        file_name = VIDEO_PATH / stream.default_filename

        if stream.type == "audio":
            old_name = file_name
            file_name = VIDEO_PATH / f"{stream.title}.mp3"
            os.rename(old_name, file_name)
        return file_name
    return None
