from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: str
    name: str
    email: str

def mock_login(email: str, password: str) -> Optional[User]:
    if password == "password": # Super simple mock
        return User(id="u123", name="Traveler", email=email)
    return None
