from pydantic import BaseModel


class Video(BaseModel):
    url: str
    itag: str


class Link(BaseModel):
    url: str
