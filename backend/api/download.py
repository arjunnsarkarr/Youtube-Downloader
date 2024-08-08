from fastapi import APIRouter, BackgroundTasks, Path
from fastapi.responses import StreamingResponse
from video_downloader.downloader import (
    VIDEO_PATH,
    get_available_streams,
    download_video,
    stream_video,
    file_iterator,
)
from api.models import Link, Video, FileName

router = APIRouter()


@router.post("/get_formated")
async def get_video_formates(video_link: Link):
    print(video_link)
    res = await get_available_streams(video_link.url)
    return res


@router.post("/download_video")
async def download(video: Video, background_task: BackgroundTasks):
    background_task.add_task(download_video, video.url, video.itag)

    return {"message": "Download started"}


@router.post("/stream")
async def stream(file_name: FileName):
    file_path = VIDEO_PATH / file_name.filename

    return await stream_video(file_path)
