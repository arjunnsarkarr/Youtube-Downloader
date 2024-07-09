from fastapi import APIRouter, Path
from fastapi.responses import StreamingResponse
from video_downloader.downloader import get_available_streams, download_video
from api.models import Video
import aiofiles

router = APIRouter()


@router.get("/get_formated/{video_link:path}")
async def get_video_formates(video_link: str = Path(..., title="YouTube video link")):
    print(video_link)
    res = await get_available_streams(video_link)
    return res


@router.post("/download_video")
async def download(video: Video):
    print(video)
    file_path = await download_video(video.url, video.itag)

    if file_path:
        filename = file_path.name
        print(file_path.exists())

        async def file_iterator(file_path):
            async with aiofiles.open(file_path, "rb") as file:
                while chunk := await file.read(1024):  # Read in chunks of 1024 bytes
                    yield chunk

        return StreamingResponse(
            file_iterator(file_path),
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    return {"Not able to download"}
