import asyncio
import aiofiles
import os, re
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict, List
from yt_dlp import YoutubeDL
from pathlib import Path

VIDEO_PATH = Path(".").absolute() / "videos"
VIDEO_PATH.mkdir(exist_ok=True)


async def get_streams(url: str) -> Dict:
    try:
        ydl = YoutubeDL()
        video_info = ydl.extract_info(url, download=False)
        return video_info
    except:
        return {}


async def filter_streams(streams: List) -> List:
    return [
        s for s in streams if s.get("vcodec") != "none" or s.get("acodec") != "none"
    ]


def sanitize_filename(filename, itag=""):
    # Remove or replace non-ASCII characters
    sanitized_filename = re.sub(r"[^\x00-\x7F]+", "_", filename)
    return f"{sanitized_filename[:20]}_{itag}"


async def get_available_streams(url) -> Dict:
    yt = await get_streams(url)
    streams: List = yt.get("formats", [])
    streams = await filter_streams(streams)
    video_length = yt.get("duration", 1)
    if (video_length / 60) > 10:
        return {"message": "unable to download because video is longer than 10 min"}
    response = {}
    response["meta"] = {
        "thumbnail": yt.get("thumbnail"),
        "duration": f"{video_length // 60}:{video_length % 60}",
    }
    res_list = []
    for i, stream in enumerate(streams):
        res = {}
        res["key"] = stream.get("format_id", "")
        res["type"] = "video" if stream.get("vcodec") != "none" else "audio"
        res["resolution"] = stream.get("resolution", "")
        res["size"] = f"{(yt.get('filesize_approx', 1024) / (1024*1024)):.2f}"
        title = sanitize_filename(yt.get("title", ""), stream.get("format_id", ""))
        if res["type"] == "audio":
            file_name = f"{title}.mp3"
            res["file_name"] = file_name
            res["resolution"] = stream.get("abr")
        else:
            res["file_name"] = f"{title}.mp4"
        res_list.append(res)
    response["data"] = res_list
    return response


def is_audio(stream: Dict) -> bool:
    return stream.get("acodec") != "none" and stream.get("vcodec") == "none"


def is_only_video(stream) -> bool:
    return stream.get("vcodec") != "none" and stream.get("acodec") == "none"


def get_best_audio_format(formats: List) -> Dict | None:
    best_audio = max(
        (f for f in formats if f.get("acodec") != "none"),
        key=lambda f: (f.get("abr") or 0),
        default=None,
    )
    return best_audio


async def get_stream_by_itag(streams: List, itag: str) -> Dict | None:
    for stream in streams:
        if stream.get("format_id") == itag:
            return stream
    return None


async def get_download_format(stream: Dict, formats: List, file_name: Path) -> Dict:
    default_format = {"format": "bestaudio/bestvideo", "outtmpl": f"{file_name}"}
    if is_audio(stream):
        default_format["format"] = stream.get("format_id", "bestaudio")
    elif is_only_video(stream):
        best_audio = get_best_audio_format(formats)
        if best_audio:
            default_format[
                "format"
            ] = f"{best_audio.get('format_id','best_audio')} + {stream.get('format_id','bestvideo')}"
            default_format["merge_output_format"] = "mp4"

    return default_format


def run_youtube_dl(ydl_fmt, url):
    with YoutubeDL(ydl_fmt) as ydl:
        ydl.download([url])


async def download_video(url, itag):
    yt = await get_streams(url)
    streams = yt.get("formats", [])

    stream = await get_stream_by_itag(streams, itag)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    file_name = yt.get("title", "")

    title = sanitize_filename(file_name, itag=itag)
    senitized_filename = VIDEO_PATH / f"{title}.mp4"

    if is_audio(stream):
        senitized_filename = VIDEO_PATH / f"{title}.mp3"

    ydl_fmt = await get_download_format(stream, streams, senitized_filename)
    await asyncio.to_thread(run_youtube_dl, ydl_fmt, url)

    return senitized_filename


async def file_iterator(file_path: Path):
    async with aiofiles.open(file_path, "rb") as file:
        while chunk := await file.read(1024):  # Read in chunks of 1024 bytes
            if not chunk:
                break
            yield chunk


async def stream_video(file_path: Path):
    # Wait until the file exists before streaming it
    while not file_path.exists():
        await asyncio.sleep(1)
    return StreamingResponse(
        file_iterator(file_path),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={file_path.name}"},
    )
